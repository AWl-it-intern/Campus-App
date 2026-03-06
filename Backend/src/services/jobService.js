import { insertJob, deleteJob, printJobs } from "../db/index.js";

export async function createJob(payload) {
  return insertJob(payload);
}

export async function removeJob(jobId) {
  return deleteJob(jobId);
}

export async function listJobs({ limit = 0, debug = false } = {}) {
  return printJobs(limit, debug);
}
