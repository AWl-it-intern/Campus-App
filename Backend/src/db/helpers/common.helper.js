import { ObjectId } from "mongodb";

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeStringArray(values) {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
}

export function normalizeDriveCandidateIds(source = {}) {
  return normalizeStringArray(
    source?.CandidateIDs ||
      source?.candidateIDs ||
      source?.candidateIds ||
      [],
  );
}

export function mapDriveWithCandidateStats(drive = {}) {
  const candidateIds = normalizeDriveCandidateIds(drive);
  return {
    ...drive,
    CandidateIDs: candidateIds,
    NumberOfCandidates: candidateIds.length,
  };
}

export function normalizeDriveObjectIdStrings(values = []) {
  return Array.from(
    new Set(
      (values || [])
        .filter(Boolean)
        .map((value) => String(value))
        .filter((value) => ObjectId.isValid(value)),
    ),
  );
}

export function normalizeJobNames(values = []) {
  return Array.from(
    new Set(
      (values || [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
}
