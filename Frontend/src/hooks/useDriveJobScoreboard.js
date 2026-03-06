import { useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchDrives } from "../services/drivesService";
import { fetchJobs } from "../services/jobsService";
import { fetchPanelists } from "../services/panelistsService";

const safeLower = (value) => String(value || "").trim().toLowerCase();

const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean);
  }

  return String(candidate?.AssignedJob || "")
    .split(/[;,]/)
    .map((job) => job.trim())
    .filter(Boolean);
};

const candidateSortKey = (candidate) => {
  const candidateId = String(candidate?.CandidateID || "").trim().toUpperCase();
  const match = candidateId.match(/^CND(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const readCandidateScore = (candidate, key) => {
  const score =
    candidate?.[`${key}Score`] ??
    candidate?.[`${safeLower(key)}Score`] ??
    candidate?.scores?.[safeLower(key)] ??
    candidate?.Scores?.[key];
  return score ?? "-";
};

export default function useDriveJobScoreboard({ driveId, jobName }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [drives, setDrives] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [panelists, setPanelists] = useState([]);

  useEffect(() => {
    if (!String(driveId || "").trim() || !String(jobName || "").trim()) {
      setLoading(false);
      setError("");
      setCandidates([]);
      setDrives([]);
      setJobs([]);
      setPanelists([]);
      return;
    }

    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const [fetchedCandidates, fetchedDrives, fetchedJobs, fetchedPanelists] =
          await Promise.all([
            fetchCandidates({ limit: 5000 }),
            fetchDrives({ limit: 5000 }),
            fetchJobs({ limit: 5000 }),
            fetchPanelists({ limit: 5000 }),
          ]);

        if (!isMounted) return;

        setCandidates(Array.isArray(fetchedCandidates) ? fetchedCandidates : []);
        setDrives(Array.isArray(fetchedDrives) ? fetchedDrives : []);
        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
        setPanelists(Array.isArray(fetchedPanelists) ? fetchedPanelists : []);
      } catch (fetchError) {
        if (!isMounted) return;
        console.error("Failed to load drive-job scoreboard data:", fetchError);
        setError(fetchError?.response?.data?.error || "Failed to load drive-job scoreboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [driveId, jobName]);

  const selectedDrive = useMemo(
    () =>
      drives.find(
        (drive) =>
          String(drive._id || drive.id || "") === String(driveId || "") ||
          String(drive.DriveID || "").toLowerCase() === String(driveId || "").toLowerCase(),
      ) || null,
    [drives, driveId],
  );

  const selectedJob = useMemo(
    () =>
      jobs.find((job) => safeLower(job?.JobName) === safeLower(jobName)) ||
      null,
    [jobs, jobName],
  );

  const assignedCandidateIds = useMemo(
    () =>
      Array.isArray(selectedJob?.assignedCandidates)
        ? selectedJob.assignedCandidates.map((id) => String(id))
        : [],
    [selectedJob],
  );

  const rows = useMemo(() => {
    const selectedJobLower = safeLower(jobName);
    if (!selectedDrive || !selectedJobLower) return [];

    const driveKeySet = new Set(
      [driveId, selectedDrive?._id, selectedDrive?.id, selectedDrive?.DriveID]
        .filter(Boolean)
        .map((value) => safeLower(value)),
    );

    return candidates
      .filter((candidate) => {
        const candidateDriveRefs = [
          candidate.driveId,
          candidate.DriveID,
          candidate.assignedDriveId,
          candidate.AssignedDriveId,
        ]
          .filter(Boolean)
          .map((value) => safeLower(value));

        const matchesDrive = candidateDriveRefs.some((key) => driveKeySet.has(key));
        if (!matchesDrive) return false;

        const matchesJobByText = splitAssignedJobs(candidate).some(
          (name) => safeLower(name) === selectedJobLower,
        );
        const matchesJobByAssignedList = assignedCandidateIds.includes(String(candidate._id));
        return matchesJobByText || matchesJobByAssignedList;
      })
      .map((candidate) => {
        const candidateRefs = new Set(
          [candidate._id, candidate.id, candidate.CandidateID]
            .filter(Boolean)
            .map((value) => String(value)),
        );

        const linkedPanelists = panelists.filter((panelist) => {
          const assignedJobs = Array.isArray(panelist?.assignedJobs)
            ? panelist.assignedJobs
            : [];
          const assignedToJob = assignedJobs.some(
            (assignedJob) => safeLower(assignedJob) === selectedJobLower,
          );

          const scheduledRounds = Array.isArray(panelist?.scheduledRounds)
            ? panelist.scheduledRounds
            : [];
          const hasCandidateRound = scheduledRounds.some((round) =>
            candidateRefs.has(String(round?.candidateId || "")),
          );

          return assignedToJob || hasCandidateRound;
        });

        return {
          key: String(candidate._id || candidate.CandidateID || candidate.email || candidate.name),
          candidateId: candidate.CandidateID || "-",
          candidateName: candidate.name || "Unnamed Candidate",
          candidateEmail: candidate.email || "-",
          panelists: linkedPanelists.map((panelist) => panelist.name || "Unnamed Panelist"),
          aptitudeScore: readCandidateScore(candidate, "Aptitude"),
          gdScore: readCandidateScore(candidate, "GD"),
          piScore: readCandidateScore(candidate, "PI"),
          status: candidate.ApplicationStatus || "Under Review",
        };
      })
      .sort((left, right) => {
        const leftScoreKey = candidateSortKey({ CandidateID: left.candidateId });
        const rightScoreKey = candidateSortKey({ CandidateID: right.candidateId });
        if (leftScoreKey !== rightScoreKey) return leftScoreKey - rightScoreKey;

        return String(left.candidateName).localeCompare(String(right.candidateName), undefined, {
          sensitivity: "base",
        });
      });
  }, [assignedCandidateIds, candidates, driveId, jobName, panelists, selectedDrive]);

  return {
    loading,
    error,
    rows,
    driveLabel: selectedDrive
      ? `${selectedDrive.DriveID || "-"} - ${selectedDrive.CollegeName || "-"}`
      : "",
    jobLabel: selectedJob?.JobName || jobName || "",
  };
}
