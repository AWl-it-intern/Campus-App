import { normalizeStringArray } from "./common.helper.js";

export function extractDriveReferences(source = {}) {
  return normalizeStringArray([
    source?.driveId,
    source?.DriveID,
    source?.assignedDriveId,
    source?.AssignedDriveId,
  ]);
}

export function normalizeAssignedJobs(source = {}, fallbackJobName = "") {
  const fromArray = Array.isArray(source?.AssignedJobs)
    ? source.AssignedJobs.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  const fromString = String(source?.AssignedJob || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const fallbackJobs = String(fallbackJobName || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const merged = Array.from(new Set([...fromArray, ...fromString]));
  if (merged.length > 0) return merged;

  return Array.from(new Set(fallbackJobs));
}
