import { extractDriveReferences, normalizeAssignedJobs } from "../helpers.js";

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const safeText = (value) => String(value || "").trim();

export function normalizeCandidateOutput(candidate = {}) {
  const normalizedAssignedJobs = normalizeAssignedJobs(candidate);
  const references = extractDriveReferences(candidate);
  const primaryDriveReference = safeText(references[0]);

  let normalizedDriveId = safeText(candidate?.driveId);
  let normalizedDriveCode = safeText(candidate?.DriveID);

  if (!normalizedDriveId && primaryDriveReference && OBJECT_ID_PATTERN.test(primaryDriveReference)) {
    normalizedDriveId = primaryDriveReference;
  }

  if (!normalizedDriveCode && primaryDriveReference && !OBJECT_ID_PATTERN.test(primaryDriveReference)) {
    normalizedDriveCode = primaryDriveReference;
  }

  const {
    AssignedJob: _legacyAssignedJob,
    assignedDriveId: _legacyAssignedDriveId,
    AssignedDriveId: _legacyAssignedDriveIdCode,
    ...rest
  } = candidate || {};

  return {
    ...rest,
    AssignedJobs: normalizedAssignedJobs,
    driveId: normalizedDriveId,
    DriveID: normalizedDriveCode,
  };
}
