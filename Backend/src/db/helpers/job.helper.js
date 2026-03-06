import { getDB } from "../core.js";
import { escapeRegExp, normalizeJobNames } from "./common.helper.js";

export async function syncJobsForCandidate(
  candidateObjectId,
  previousJobs = [],
  nextJobs = [],
  { session } = {},
) {
  const db = getDB();
  const candidateKey = String(candidateObjectId);
  const prevJobs = normalizeJobNames(previousJobs);
  const newJobs = normalizeJobNames(nextJobs);

  const prevSet = new Set(prevJobs.map((job) => job.toLowerCase()));
  const nextSet = new Set(newJobs.map((job) => job.toLowerCase()));

  const jobsToAdd = newJobs.filter((job) => !prevSet.has(job.toLowerCase()));
  const jobsToRemove = prevJobs.filter((job) => !nextSet.has(job.toLowerCase()));

  for (const jobName of jobsToAdd) {
    await db.collection("Jobs").updateMany(
      { JobName: { $regex: `^${escapeRegExp(jobName)}$`, $options: "i" } },
      { $addToSet: { assignedCandidates: candidateKey } },
      session ? { session } : undefined,
    );
  }

  for (const jobName of jobsToRemove) {
    await db.collection("Jobs").updateMany(
      { JobName: { $regex: `^${escapeRegExp(jobName)}$`, $options: "i" } },
      { $pull: { assignedCandidates: candidateKey } },
      session ? { session } : undefined,
    );
  }
}

export async function linkJobsToDrive(jobNames = [], driveDoc = null, { session } = {}) {
  if (!driveDoc?._id) return;

  const db = getDB();
  const names = normalizeJobNames(jobNames);
  if (names.length === 0) return;

  const driveCode = String(driveDoc.DriveID || "").trim();
  const driveCollege = String(driveDoc.CollegeName || "").trim();
  const driveObjectId = String(driveDoc._id);

  for (const jobName of names) {
    await db.collection("Jobs").updateMany(
      { JobName: { $regex: `^${escapeRegExp(jobName)}$`, $options: "i" } },
      {
        $set: {
          [`Drive.${driveCode}`]: driveCollege,
        },
        $addToSet: {
          driveObjectIds: driveObjectId,
        },
      },
      session ? { session } : undefined,
    );
  }
}
