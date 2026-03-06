/**
 * File Type: Business Logic Hook
 * Input Type: Aptitude selection state, dataset arrays, and setters
 * Output Type:
 * {
 *   selectedDrive, availableJobs, selectedJob, targetCandidates,
 *   selectedCandidateSet, allVisibleSelected, toggleCandidateSelection, toggleSelectAllVisible
 * }
 */
import { useEffect, useMemo } from "react";

import {
  filterTargetCandidates,
  getCandidateKey,
  getJobKey,
  resolveAvailableJobs,
  safeLower,
} from "./utils";

export default function useAptitudeSelectionState({
  drives,
  jobs,
  candidates,
  searchText,
  stateDriveRef,
  stateJobName,
  selectedDriveId,
  setSelectedDriveId,
  selectedJobRef,
  setSelectedJobRef,
  selectedCandidateIds,
  setSelectedCandidateIds,
}) {
  const selectedDrive = useMemo(
    () =>
      drives.find((drive) => String(drive._id || drive.id || drive.DriveID) === String(selectedDriveId)) ||
      null,
    [drives, selectedDriveId],
  );

  useEffect(() => {
    if (!stateDriveRef || selectedDriveId || drives.length === 0) return;
    const matched = drives.find((drive) =>
      [drive?._id, drive?.id, drive?.DriveID]
        .filter(Boolean)
        .map((value) => String(value))
        .includes(stateDriveRef),
    );
    if (matched) setSelectedDriveId(String(matched._id || matched.id || matched.DriveID));
  }, [drives, selectedDriveId, setSelectedDriveId, stateDriveRef]);

  const availableJobs = useMemo(
    () => resolveAvailableJobs({ selectedDrive, jobs }),
    [selectedDrive, jobs],
  );
  const selectedJob = useMemo(
    () => availableJobs.find((job) => getJobKey(job) === selectedJobRef) || null,
    [availableJobs, selectedJobRef],
  );

  useEffect(() => {
    if (!stateJobName || selectedJobRef || availableJobs.length === 0) return;
    const matched = availableJobs.find((job) => safeLower(job.JobName) === safeLower(stateJobName));
    if (matched) setSelectedJobRef(getJobKey(matched));
  }, [availableJobs, selectedJobRef, setSelectedJobRef, stateJobName]);

  const targetCandidates = useMemo(
    () => filterTargetCandidates({ selectedDrive, selectedJob, candidates, searchText }),
    [selectedDrive, selectedJob, candidates, searchText],
  );
  const selectedCandidateSet = useMemo(
    () => new Set(selectedCandidateIds.map((id) => String(id))),
    [selectedCandidateIds],
  );
  const allVisibleSelected =
    targetCandidates.length > 0 &&
    targetCandidates.every((candidate) => selectedCandidateSet.has(getCandidateKey(candidate)));

  const toggleCandidateSelection = (candidateKey) => {
    const normalized = String(candidateKey);
    setSelectedCandidateIds((prev) =>
      prev.includes(normalized) ? prev.filter((value) => value !== normalized) : [...prev, normalized],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visible = new Set(targetCandidates.map((candidate) => getCandidateKey(candidate)));
      setSelectedCandidateIds((prev) => prev.filter((value) => !visible.has(value)));
      return;
    }
    const nextSet = new Set(selectedCandidateIds);
    targetCandidates.forEach((candidate) => nextSet.add(getCandidateKey(candidate)));
    setSelectedCandidateIds(Array.from(nextSet));
  };

  return {
    selectedDrive,
    availableJobs,
    selectedJob,
    targetCandidates,
    selectedCandidateSet,
    allVisibleSelected,
    toggleCandidateSelection,
    toggleSelectAllVisible,
  };
}
