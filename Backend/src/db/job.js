import { ObjectId } from "mongodb";
import { getDB } from "./core.js";
import { normalizeDriveObjectIdStrings, normalizeStringArray } from "./helpers/index.js";

function normalizeJobPayload(jobData = {}) {
  const {
    Drive: _ignoredDrive,
    drive: _ignoredDriveLegacy,
    driveObjectIds: _ignoredDriveObjectIds,
    driveIds: _ignoredDriveIds,
    assignedCandidates: _ignoredAssignedCandidates,
    AssignedCandidates: _ignoredAssignedCandidatesLegacy,
    assignedPanelist: _ignoredAssignedPanelist,
    assignedPanelists: _ignoredAssignedPanelistsLegacy,
    JobID: _ignoredJobId,
    jobId: _ignoredJobIdLegacy,
    JobName: _ignoredJobName,
    jobName: _ignoredJobNameLegacy,
    ...rest
  } = jobData || {};

  const normalizedDrive =
    jobData?.Drive && typeof jobData.Drive === "object"
      ? jobData.Drive
      : jobData?.drive && typeof jobData.drive === "object"
        ? jobData.drive
        : {};

  const normalizedDriveObjectIds = normalizeDriveObjectIdStrings(
    jobData?.driveObjectIds || jobData?.driveIds || [],
  );

  const normalizedAssignedCandidates = normalizeStringArray(
    jobData?.assignedCandidates || jobData?.AssignedCandidates || [],
  );

  const normalizedAssignedPanelist = Array.isArray(jobData?.assignedPanelist)
    ? jobData.assignedPanelist
    : Array.isArray(jobData?.assignedPanelists)
      ? jobData.assignedPanelists
      : [];

  const normalizedJobId = String(jobData?.JobID || jobData?.jobId || "").trim();
  const normalizedJobName = String(jobData?.JobName || jobData?.jobName || "").trim();

  return {
    ...rest,
    JobID: normalizedJobId,
    JobName: normalizedJobName,
    Drive: normalizedDrive,
    driveObjectIds: normalizedDriveObjectIds,
    assignedCandidates: normalizedAssignedCandidates,
    assignedPanelist: normalizedAssignedPanelist,
  };
}

export async function insertJob(jobData) {
  const db = getDB();
  const normalizedPayload = normalizeJobPayload(jobData);

  if (!normalizedPayload.JobID) {
    throw new Error("Job ID is required");
  }

  try {
    const result = await db.collection("Jobs").insertOne({
      ...normalizedPayload,
      createdAt: new Date(),
    });

    if (result.acknowledged) {
      // console.log("Job inserted:", result.insertedId);
    }

    return result;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}

export async function printJobs(limit = 50, debug = false) {
  const db = getDB();
  const numericLimit = Number(limit);
  const cursor = db.collection("Jobs").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const jobs = await cursor.toArray();
  const normalizedJobs = jobs.map((job) => normalizeJobPayload(job));

  if (debug) {
    // console.log(`Job collection | Count: ${normalizedJobs.length}`);
  }

  return normalizedJobs;
}

export async function deleteJob(id) {
  const db = getDB();
  const result = await db.collection("Jobs").deleteOne({ _id: new ObjectId(id) });

  // console.log("Job deleted:", result.deletedCount);

  return result;
}
