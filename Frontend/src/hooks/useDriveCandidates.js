import { useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchDrives } from "../services/drivesService";

const safeLower = (value) => String(value || "").trim().toLowerCase();

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

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const [fetchedCandidates, fetchedDrives] = await Promise.all([
          fetchCandidates({ limit: 5000 }),
          fetchDrives({ limit: 5000 }),
        ]);

        if (!isMounted) return;

        const drivesData = (fetchedDrives || []).map((doc) => ({
          ...doc,
          id: doc._id,
          JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
        }));

        setCandidates(Array.isArray(fetchedCandidates) ? fetchedCandidates : []);
        setDrives(drivesData);
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
  }, [jobName, driveId]);

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

    return candidates.filter((candidate) => {
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

      return hasJob && matchesDrive;
    });
  }, [candidates, jobName, driveId, drives]);

  return {
    loading,
    error,
    filteredCandidates,
    getDriveName,
    splitAssignedJobs,
  };
}
