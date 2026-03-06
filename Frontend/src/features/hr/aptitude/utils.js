/**
 * File Type: Feature Utilities
 * Input Type: Candidate/drive/job records
 * Output Type: Normalized values, candidate keys, filtered arrays
 */
export const safeText = (value) => String(value || "").trim();
export const safeLower = (value) => safeText(value).toLowerCase();

export const splitAssignedJobs = (candidate) => {
  if (Array.isArray(candidate?.AssignedJobs)) {
    return candidate.AssignedJobs.map((job) => safeText(job)).filter(Boolean);
  }
  return safeText(candidate?.AssignedJob)
    .split(/[;,]/)
    .map((job) => job.trim())
    .filter(Boolean);
};

export const normalizeDriveKeys = (drive = {}) =>
  new Set([drive?._id, drive?.id, drive?.DriveID].filter(Boolean).map((value) => safeLower(value)));

export const getJobKey = (job = {}) => safeText(job._id || job.id || job.JobID || job.JobName);

export const getCandidateKey = (candidate) =>
  safeText(candidate?._id || candidate?.CandidateID || candidate?.id || candidate?.email);

export const resolveAvailableJobs = ({ selectedDrive, jobs }) => {
  if (!selectedDrive) return [];
  const driveCode = safeText(selectedDrive.DriveID);
  const configuredOpenings = new Set(
    (Array.isArray(selectedDrive.JobsOpening) ? selectedDrive.JobsOpening : [])
      .map((job) => safeLower(job))
      .filter(Boolean),
  );

  return jobs.filter((job) => {
    const jobName = safeText(job.JobName);
    if (!jobName) return false;
    if (configuredOpenings.has(safeLower(jobName))) return true;
    const driveMap = job.Drive && typeof job.Drive === "object" ? job.Drive : {};
    return driveCode ? Object.prototype.hasOwnProperty.call(driveMap, driveCode) : false;
  });
};

export const filterTargetCandidates = ({ selectedDrive, selectedJob, candidates, searchText }) => {
  if (!selectedDrive || !selectedJob) return [];
  const driveKeys = normalizeDriveKeys(selectedDrive);
  const selectedJobLower = safeLower(selectedJob.JobName);
  const query = safeLower(searchText);

  return candidates
    .filter((candidate) => {
      const candidateDriveKeys = [
        candidate?.driveId,
        candidate?.assignedDriveId,
        candidate?.DriveID,
        candidate?.AssignedDriveId,
      ]
        .filter(Boolean)
        .map((value) => safeLower(value));
      if (!candidateDriveKeys.some((key) => driveKeys.has(key))) return false;
      if (!splitAssignedJobs(candidate).some((jobName) => safeLower(jobName) === selectedJobLower)) return false;
      if (!query) return true;
      return [candidate?.CandidateID, candidate?.name, candidate?.email].some((value) => safeLower(value).includes(query));
    })
    .sort((left, right) => safeText(left.CandidateID || left.name).localeCompare(safeText(right.CandidateID || right.name), undefined, { sensitivity: "base" }));
};
