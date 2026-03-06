import { ObjectId } from "mongodb";
import { getDB } from "../core.js";
import {
  allocateCandidateIds,
  buildCandidateDriveFields,
  extractDriveReferences,
  linkJobsToDrive,
  normalizeAssignedJobs,
  recalculateDriveCandidateStats,
  resolveDriveDocsByReferences,
  syncCandidateDriveMembership,
  syncJobsForCandidate,
} from "../helpers.js";

function sanitizeCandidateInput(candidateData = {}) {
  const {
    CandidateID: _ignoredCandidateId,
    AssignedJob: _ignoredAssignedJob,
    assignedDriveId: _ignoredAssignedDriveId,
    DriveID: _ignoredDriveIdCode,
    AssignedDriveId: _ignoredAssignedDriveIdCode,
    ...safeCandidateData
  } = candidateData || {};

  return safeCandidateData;
}

function buildCaseInsensitiveJobNameQuery(jobNameKey = "") {
  return {
    $expr: {
      $eq: [{ $toLower: { $ifNull: ["$JobName", ""] } }, String(jobNameKey)],
    },
  };
}

export async function insertCandidate(candidateData) {
  const db = getDB();

  if (!candidateData?.email) {
    throw new Error("Email is required");
  }

  try {
    const driveIdCacheForInsert = new Map();
    const driveDocCacheForInsert = new Map();

    const normalizedAssignedJobs = normalizeAssignedJobs(candidateData);
    const driveReferences = extractDriveReferences(candidateData);
    const resolvedDriveDocs = await resolveDriveDocsByReferences(
      driveReferences,
      driveIdCacheForInsert,
      driveDocCacheForInsert,
    );
    const primaryDriveDoc = resolvedDriveDocs[0] || null;
    const candidateDriveFields = buildCandidateDriveFields(primaryDriveDoc);

    const safeCandidateData = sanitizeCandidateInput(candidateData);
    const [generatedCandidateId] = await allocateCandidateIds(1);

    const insertResult = await db.collection("Candidate").insertOne({
      ApplicationStatus: candidateData?.ApplicationStatus || "Under Review",
      AssignedPanelist: Array.isArray(candidateData?.AssignedPanelist)
        ? candidateData.AssignedPanelist
        : [],
      ...safeCandidateData,
      email: String(candidateData.email || "").trim(),
      name: String(candidateData.name || "").trim(),
      college: String(candidateData.college || "").trim(),
      AssignedJobs: normalizedAssignedJobs,
      ...candidateDriveFields,
      CandidateID: generatedCandidateId,
      createdAt: new Date(),
    });

    if (insertResult.acknowledged) {
      console.log("Candidate inserted:", insertResult.insertedId);
      await syncCandidateDriveMembership(
        generatedCandidateId,
        [],
        resolvedDriveDocs.map((doc) => doc._id),
      );
      await syncJobsForCandidate(insertResult.insertedId, [], normalizedAssignedJobs);
      await linkJobsToDrive(normalizedAssignedJobs, primaryDriveDoc);
    }

    return insertResult;
  } catch (error) {
    console.error("Candidate insert failed:", error);
    throw error;
  }
}

export async function insertManyCandidates(candidatesData = [], options = {}) {
  const db = getDB();

  if (!Array.isArray(candidatesData) || candidatesData.length === 0) {
    throw new Error("Candidates array is required");
  }

  const defaultDriveReference = String(
    options?.defaultDriveId ||
      options?.defaultDriveID ||
      options?.driveId ||
      options?.DriveID ||
      "",
  ).trim();
  const forceDriveReference = String(
    options?.forceDriveId || options?.forceDriveID || "",
  ).trim();
  const defaultJobName = String(
    options?.defaultJobName || options?.jobName || "",
  ).trim();
  const forceJobName = String(
    options?.forceJobName || "",
  ).trim();

  const driveIdCacheForBulk = new Map();
  const driveDocCacheForBulk = new Map();

  const generatedCandidateIds = await allocateCandidateIds(candidatesData.length);
  const postInsertCandidateMeta = [];

  const preparedCandidates = [];
  for (let index = 0; index < candidatesData.length; index += 1) {
    const candidate = candidatesData[index];

    if (!candidate?.email) {
      throw new Error(`Email is required for candidate at row ${index + 1}`);
    }

    const candidateId = generatedCandidateIds[index];

    const driveReferences = forceDriveReference
      ? [forceDriveReference]
      : extractDriveReferences(candidate);
    if (!forceDriveReference && driveReferences.length === 0 && defaultDriveReference) {
      driveReferences.push(defaultDriveReference);
    }

    const resolvedDriveDocs = await resolveDriveDocsByReferences(
      driveReferences,
      driveIdCacheForBulk,
      driveDocCacheForBulk,
    );
    const primaryDriveDoc = resolvedDriveDocs[0] || null;
    const driveFields = buildCandidateDriveFields(primaryDriveDoc);

    const assignedJobs = forceJobName
      ? [forceJobName]
      : normalizeAssignedJobs(candidate, defaultJobName);
    const safeCandidate = sanitizeCandidateInput(candidate);

    preparedCandidates.push({
      ApplicationStatus: candidate?.ApplicationStatus || "Under Review",
      AssignedPanelist: Array.isArray(candidate?.AssignedPanelist)
        ? candidate.AssignedPanelist
        : [],
      ...safeCandidate,
      email: String(candidate.email || "").trim(),
      name: String(candidate.name || "").trim(),
      college: String(candidate.college || "").trim(),
      AssignedJobs: assignedJobs,
      ...driveFields,
      CandidateID: candidateId,
      createdAt: new Date(),
    });

    postInsertCandidateMeta.push({
      assignedJobs,
      candidateKey: candidateId,
      driveObjectIds: resolvedDriveDocs.map((doc) => String(doc._id)),
      primaryDriveDoc,
    });
  }

  const insertResult = await db.collection("Candidate").insertMany(preparedCandidates, {
    ordered: false,
  });

  const driveCandidateMap = new Map();
  const jobCandidateMap = new Map();
  const driveJobMap = new Map();

  Object.entries(insertResult.insertedIds || {}).forEach(([indexText, objectId]) => {
    const index = Number(indexText);
    if (!Number.isFinite(index)) return;

    const meta = postInsertCandidateMeta[index];
    if (!meta) return;

    const objectIdText = String(objectId);
    const candidateKey = meta.candidateKey;

    meta.driveObjectIds.forEach((driveObjectId) => {
      if (!driveCandidateMap.has(driveObjectId)) {
        driveCandidateMap.set(driveObjectId, new Set());
      }
      driveCandidateMap.get(driveObjectId).add(candidateKey);
    });

    meta.assignedJobs.forEach((jobName) => {
      const key = String(jobName || "").trim().toLowerCase();
      if (!key) return;
      if (!jobCandidateMap.has(key)) {
        jobCandidateMap.set(key, new Set());
      }
      jobCandidateMap.get(key).add(objectIdText);
    });

    if (meta.primaryDriveDoc?._id && meta.assignedJobs.length > 0) {
      const driveKey = String(meta.primaryDriveDoc._id);
      if (!driveJobMap.has(driveKey)) {
        driveJobMap.set(driveKey, {
          driveDoc: meta.primaryDriveDoc,
          jobs: new Set(),
        });
      }
      const jobSet = driveJobMap.get(driveKey).jobs;
      meta.assignedJobs.forEach((jobName) => jobSet.add(jobName));
    }
  });

  for (const [driveObjectId, candidateKeySet] of driveCandidateMap.entries()) {
    await db.collection("Drives").updateOne(
      { _id: new ObjectId(driveObjectId) },
      [
        {
          $set: {
            CandidateIDs: {
              $setUnion: [
                { $ifNull: ["$CandidateIDs", []] },
                Array.from(candidateKeySet),
              ],
            },
          },
        },
        {
          $set: {
            updatedAt: "$$NOW",
          },
        },
        {
          $unset: ["NumberOfCandidates", "numberOfCandidates"],
        },
      ],
    );
  }

  for (const [jobNameKey, candidateIds] of jobCandidateMap.entries()) {
    await db.collection("Jobs").updateMany(
      buildCaseInsensitiveJobNameQuery(jobNameKey),
      { $addToSet: { assignedCandidates: { $each: Array.from(candidateIds) } } },
    );
  }

  for (const { driveDoc, jobs } of driveJobMap.values()) {
    await linkJobsToDrive(Array.from(jobs), driveDoc);
  }

  if (driveCandidateMap.size > 0) {
    await recalculateDriveCandidateStats(Array.from(driveCandidateMap.keys()));
  }

  console.log("Candidates inserted:", insertResult.insertedCount);
  return insertResult;
}
