import { extractDriveReferences, normalizeAssignedJobs } from "../helpers.js";

export function normalizeCandidateOutput(candidate = {}) {
  const normalizedAssignedJobs = normalizeAssignedJobs(candidate);
  const [primaryDriveReference = ""] = extractDriveReferences(candidate);
  const {
    AssignedJob: _legacyAssignedJob,
    assignedDriveId: _legacyAssignedDriveId,
    DriveID: _legacyDriveIdCode,
    AssignedDriveId: _legacyAssignedDriveIdCode,
    ...rest
  } = candidate || {};

  return {
    ...rest,
    AssignedJobs: normalizedAssignedJobs,
    driveId: String(primaryDriveReference || ""),
  };
}
