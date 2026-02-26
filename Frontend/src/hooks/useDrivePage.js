import { useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchDriveById } from "../services/drivesService";
import { fetchJobs } from "../services/jobsService";
import { fetchPanelists } from "../services/panelistsService";

const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean);
  }
  return String(candidate?.AssignedJob || "")
    .split(",")
    .map((job) => job.trim())
    .filter(Boolean);
};

const safeLower = (value) => String(value || "").toLowerCase();

export default function useDrivePage({ driveId }) {
  const [drive, setDrive] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [panelists, setPanelists] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivePageData = async () => {
      try {
        setLoading(true);
        const [driveData, candidateData, panelistData, jobData] = await Promise.all([
          fetchDriveById(driveId),
          fetchCandidates({ limit: 5000 }),
          fetchPanelists({ limit: 5000 }),
          fetchJobs({ limit: 5000 }),
        ]);

        setDrive(driveData || null);
        setCandidates(candidateData || []);
        setPanelists(panelistData || []);
        setJobs(jobData || []);
        setError(null);
      } catch (fetchError) {
        console.error("Error loading drive page:", fetchError);
        setError(
          fetchError?.response?.data?.error ||
            "Unable to load drive details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDrivePageData();
  }, [driveId]);

  const driveScopedCandidates = useMemo(() => {
    if (!drive) return [];

    const driveKeySet = new Set(
      [
        driveId,
        drive._id,
        drive.id,
        drive.DriveID,
        String(drive.DriveID || "").toLowerCase(),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    );

    return candidates.filter((candidate) => {
      const candidateKeys = [
        candidate.driveId,
        candidate.DriveID,
        candidate.assignedDriveId,
        candidate.AssignedDriveId,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return candidateKeys.some((key) => driveKeySet.has(key));
    });
  }, [candidates, drive, driveId]);

  const jobRows = useMemo(() => {
    if (!drive) return [];

    const driveCode = String(drive.DriveID || "");
    const driveJobsFromMap = (jobs || []).filter((job) => {
      if (!driveCode) return false;
      const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
      return Object.prototype.hasOwnProperty.call(driveMap, driveCode);
    });

    const fallbackJobNames = Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [];
    const jobEntries = driveJobsFromMap.length
      ? driveJobsFromMap.map((job) => ({ jobName: job.JobName, job }))
      : fallbackJobNames.map((jobName) => ({ jobName, job: null }));

    return jobEntries.map(({ jobName, job }) => {
      const lowerJob = safeLower(jobName);
      const assignedCandidateIds = Array.isArray(job?.assignedCandidates)
        ? job.assignedCandidates.map((id) => String(id))
        : [];

      const candidateCount = driveScopedCandidates.filter((candidate) => {
        const inAssignedList = assignedCandidateIds.includes(String(candidate._id));
        const inCandidateJobs = splitAssignedJobs(candidate).some(
          (candidateJob) => safeLower(candidateJob) === lowerJob,
        );
        return inAssignedList || inCandidateJobs;
      }).length;

      const mappedPanelists = panelists
        .filter((panelist) => {
          const expertise = safeLower(panelist.expertise);
          const designation = safeLower(panelist.designation);
          const assignedJobs = Array.isArray(panelist.assignedJobs)
            ? panelist.assignedJobs.map((item) => safeLower(item))
            : [];

          return (
            assignedJobs.includes(lowerJob) ||
            expertise.includes(lowerJob) ||
            designation.includes(lowerJob)
          );
        })
        .map((panelist) => ({
          id: panelist._id || panelist.id || panelist.email || panelist.name,
          name: panelist.name || "Unnamed Panelist",
          designation: panelist.designation || "",
          expertise: panelist.expertise || "",
        }));

      return {
        jobName,
        candidateCount,
        panelists: mappedPanelists,
      };
    });
  }, [drive, driveScopedCandidates, panelists, jobs]);

  return {
    drive,
    jobRows,
    loading,
    error,
  };
}
