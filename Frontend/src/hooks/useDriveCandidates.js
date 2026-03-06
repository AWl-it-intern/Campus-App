import { useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchDrives } from "../services/drivesService";
import { fetchJobs } from "../services/jobsService";

const safeLower = (value) => String(value || "").trim().toLowerCase();

const candidateSortKey = (candidate) => {
  const candidateId = String(candidate?.CandidateID || "").trim().toUpperCase();
  const match = candidateId.match(/^CND(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean);
  }

  const text = String(candidate?.AssignedJob || "").trim();
  if (!text) return [];
  const delim = text.includes(";") ? ";" : ",";
  return text
    .split(delim)
    .map((job) => job.trim())
    .filter(Boolean);
};

export default function useDriveCandidates({ jobName, driveId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const [fetchedCandidates, fetchedDrives, fetchedJobs] = await Promise.all([
          fetchCandidates({ limit: 5000 }),
          fetchDrives({ limit: 5000 }),
          fetchJobs({ limit: 5000 }),
        ]);

        if (!isMounted) return;

        const drivesData = (fetchedDrives || []).map((doc) => ({
          ...doc,
          id: doc._id,
          JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
        }));

        setCandidates(Array.isArray(fetchedCandidates) ? fetchedCandidates : []);
        setDrives(drivesData);
        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch candidates/drives:", error);
        setError(error?.response?.data?.error || "Failed to load data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [jobName, driveId, refreshToken]);

  const drivesMap = useMemo(
    () =>
      Object.fromEntries(
        (drives || []).map((drive) => [
          String(drive._id || drive.id || drive.DriveID || ""),
          drive,
        ]),
      ),
    [drives],
  );

  const getDriveName = (driveId) => {
    const drive = drivesMap[String(driveId || "")];
    if (!drive) return "";
    const driveCode = drive.DriveID || drive.driveId || "";
    const college = drive.CollegeName || drive.collegeName || "";
    return [driveCode, college].filter(Boolean).join(" - ");
  };

  const filteredCandidates = useMemo(() => {
    const jobLower = safeLower(jobName);

    if (!jobLower || jobName === "Job") return [];

    const jobRecord = (jobs || []).find(
      (job) => safeLower(job.JobName) === jobLower,
    );
    const assignedIds = Array.isArray(jobRecord?.assignedCandidates)
      ? jobRecord.assignedCandidates.map((id) => String(id))
      : [];

    const driveRecord =
      (drives || []).find(
        (drive) =>
          String(drive._id || drive.id || "") === String(driveId) ||
          String(drive.DriveID || "") === String(driveId),
      ) || null;

    const driveKeySet = new Set(
      [driveId, driveRecord?._id, driveRecord?.id, driveRecord?.DriveID]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    );

    return candidates
      .filter((candidate) => {
        const jobs = splitAssignedJobs(candidate).map((job) => safeLower(job));
        const hasJob = jobs.includes(jobLower);

        const candidateKeys = [
          candidate.driveId,
          candidate.DriveID,
          candidate.assignedDriveId,
          candidate.AssignedDriveId,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        const matchesDrive =
          driveKeySet.size === 0
            ? true
            : candidateKeys.some((key) => driveKeySet.has(key));

        const matchesAssignedList = assignedIds.includes(String(candidate._id));

        return matchesDrive && (matchesAssignedList || hasJob);
      })
      .sort((left, right) => {
        const byId = candidateSortKey(left) - candidateSortKey(right);
        if (byId !== 0) return byId;
        return String(left.name || "").localeCompare(String(right.name || ""), undefined, {
          sensitivity: "base",
        });
      });
  }, [candidates, jobName, driveId, drives, jobs]);

  return {
    loading,
    error,
    filteredCandidates,
    getDriveName,
    splitAssignedJobs,
    reload: () => setRefreshToken((value) => value + 1),
  };
}
