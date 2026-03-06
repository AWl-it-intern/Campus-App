import { getDB } from "../core.js";
import { normalizeCandidateOutput } from "./shared.js";

export async function printCandidates({ limit = 50, job, college, debug = false }) {
  const db = getDB();
  const numericLimit = Number(limit);

  const filter = {};

  if (job && job.trim()) {
    filter.AssignedJobs = { $elemMatch: { $regex: `^${job.trim()}$`, $options: "i" } };
  }

  if (college && college.trim()) {
    filter.college = { $regex: `^${college.trim()}$`, $options: "i" };
  }

  const cursor = db
    .collection("Candidate")
    .find(filter)
    .sort({ createdAt: -1 });

  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const candidates = await cursor.toArray();
  const normalizedCandidates = candidates.map((candidate) =>
    normalizeCandidateOutput(candidate),
  );

  if (debug) {
    // console.log("Filter:", filter);
    // console.log(`Candidate count: ${normalizedCandidates.length}`);
  }

  return normalizedCandidates;
}
