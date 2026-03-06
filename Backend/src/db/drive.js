import { ObjectId } from "mongodb";
import { getDB, startSession } from "./core.js";
import {
  escapeRegExp,
  linkJobsToDrive,
  mapDriveWithCandidateStats,
  normalizeJobNames,
  normalizeStringArray,
} from "./helpers.js";

function normalizeDriveJobsOpening(value) {
  if (Array.isArray(value)) {
    return normalizeJobNames(value);
  }

  if (typeof value === "string") {
    return normalizeJobNames(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return [];
}

function stripLegacyDriveFields(drive = {}) {
  const {
    driveId: _legacyDriveId,
    driveID: _legacyDriveIdAlt,
    collegeName: _legacyCollegeName,
    college: _legacyCollege,
    startDate: _legacyStartDate,
    endDate: _legacyEndDate,
    jobsOpening: _legacyJobsOpening,
    status: _legacyStatus,
    candidateIDs: _legacyCandidateIds1,
    candidateIds: _legacyCandidateIds2,
    NumberOfCandidates: _storedCandidateCount,
    numberOfCandidates: _legacyNumberOfCandidates,
    selected: _legacySelected,
    ...rest
  } = drive || {};

  return rest;
}

function normalizeDriveOutput(drive = {}) {
  const sanitized = stripLegacyDriveFields(drive);
  const candidateIds = normalizeStringArray(sanitized.CandidateIDs || []);
  return {
    ...sanitized,
    DriveID: String(sanitized.DriveID || "").trim(),
    CollegeName: String(sanitized.CollegeName || "").trim(),
    JobsOpening: normalizeDriveJobsOpening(sanitized.JobsOpening),
    Status: String(sanitized.Status || "Draft").trim() || "Draft",
    CandidateIDs: candidateIds,
    NumberOfCandidates: candidateIds.length,
    Selected: Number(sanitized.Selected) || 0,
  };
}

function buildDriveCandidateQuery(drive = {}) {
  const driveObjectIdText = String(drive?._id || "").trim();
  const driveCode = String(drive?.DriveID || "").trim();
  const orConditions = [];

  if (driveObjectIdText) {
    orConditions.push(
      { driveId: driveObjectIdText },
      { assignedDriveId: driveObjectIdText },
    );
  }

  if (driveCode) {
    orConditions.push(
      { DriveID: { $regex: `^${escapeRegExp(driveCode)}$`, $options: "i" } },
      { AssignedDriveId: { $regex: `^${escapeRegExp(driveCode)}$`, $options: "i" } },
    );
  }

  if (orConditions.length === 0) {
    return null;
  }

  return { $or: orConditions };
}

function areSameCandidateSets(left = [], right = []) {
  const normalizedLeft = normalizeStringArray(left);
  const normalizedRight = normalizeStringArray(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  const rightSet = new Set(normalizedRight);
  return normalizedLeft.every((value) => rightSet.has(value));
}

async function syncDriveCandidateStatsFromAssignments(drive, db) {
  const candidateQuery = buildDriveCandidateQuery(drive);
  const linkedCandidates = candidateQuery
    ? await db.collection("Candidate").find(candidateQuery).toArray()
    : [];

  const derivedCandidateIds = normalizeStringArray(
    linkedCandidates.map((candidate) => candidate.CandidateID || candidate._id),
  );
  const existingCandidateIds = normalizeStringArray(
    drive?.CandidateIDs || drive?.candidateIDs || drive?.candidateIds || [],
  );
  const hasStoredCandidateCount =
    Object.prototype.hasOwnProperty.call(drive || {}, "NumberOfCandidates") ||
    Object.prototype.hasOwnProperty.call(drive || {}, "numberOfCandidates");

  const shouldPersist =
    !areSameCandidateSets(existingCandidateIds, derivedCandidateIds) ||
    hasStoredCandidateCount;

  if (shouldPersist && drive?._id) {
    await db.collection("Drives").updateOne(
      { _id: drive._id },
      {
        $set: {
          CandidateIDs: derivedCandidateIds,
          updatedAt: new Date(),
        },
        $unset: {
          NumberOfCandidates: "",
          numberOfCandidates: "",
        },
      },
    );
  }

  return derivedCandidateIds;
}

export async function insertDrive(driveData) {
  const db = getDB();
  const normalizedDriveId = String(
    driveData?.DriveID || driveData?.driveId || driveData?.driveID || "",
  ).trim();
  const normalizedCollegeName = String(
    driveData?.CollegeName || driveData?.collegeName || driveData?.college || "",
  ).trim();
  const normalizedStartDate = String(
    driveData?.StartDate || driveData?.startDate || "",
  ).trim();
  const normalizedEndDate = String(
    driveData?.EndDate || driveData?.endDate || "",
  ).trim();
  const normalizedJobs = normalizeDriveJobsOpening(
    driveData?.JobsOpening ?? driveData?.jobsOpening,
  );
  const normalizedCandidateIds = normalizeStringArray(
    driveData?.CandidateIDs || driveData?.candidateIDs || driveData?.candidateIds || [],
  );
  const normalizedStatus = String(driveData?.Status || driveData?.status || "Draft").trim() || "Draft";
  const normalizedSelected = Number(driveData?.Selected ?? driveData?.selected ?? 0) || 0;

  const safeDriveData = stripLegacyDriveFields(driveData);

  if (
    !normalizedDriveId ||
    !normalizedCollegeName ||
    !normalizedStartDate ||
    !normalizedEndDate
  ) {
    throw new Error(
      "DriveID, CollegeName, StartDate and EndDate are required",
    );
  }

  const existingDrive = await db.collection("Drives").findOne({
    DriveID: normalizedDriveId,
  });

  if (existingDrive) {
    throw new Error("Drive ID already exists");
  }

  const result = await db.collection("Drives").insertOne({
    ...safeDriveData,
    DriveID: normalizedDriveId,
    CollegeName: normalizedCollegeName,
    StartDate: normalizedStartDate,
    EndDate: normalizedEndDate,
    JobsOpening: normalizedJobs,
    Status: normalizedStatus,
    CandidateIDs: normalizedCandidateIds,
    Selected: normalizedSelected,
    createdAt: new Date(),
  });

  // console.log("Drive inserted:", result.insertedId);

  if (normalizedJobs.length > 0) {
    const driveDoc = {
      _id: result.insertedId,
      DriveID: normalizedDriveId,
      CollegeName: normalizedCollegeName,
    };
    await linkJobsToDrive(normalizedJobs, driveDoc);
  }

  return result;
}

export async function printDrives(limit = 100, debug = false) {
  const db = getDB();
  const numericLimit = Number(limit);
  const cursor = db.collection("Drives").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const drives = await cursor.toArray();

  const drivesWithCounts = [];
  for (const drive of drives) {
    const derivedCandidateIds = await syncDriveCandidateStatsFromAssignments(drive, db);
    const mappedDrive = normalizeDriveOutput({
      ...mapDriveWithCandidateStats(drive),
      CandidateIDs: derivedCandidateIds,
    });
    drivesWithCounts.push(mappedDrive);
  }

  if (debug) {
    // console.log(`Drive collection | Count: ${drives.length}`);
  }

  return drivesWithCounts;
}

export async function deleteDrive(id) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return { deletedCount: 0 };
  }

  const driveObjectId = new ObjectId(id);
  const driveObjectIdText = String(driveObjectId);
  const session = startSession();

  try {
    let deleteResult = { deletedCount: 0 };

    await session.withTransaction(async () => {
      const driveDoc = await db
        .collection("Drives")
        .findOne({ _id: driveObjectId }, { session });

      if (!driveDoc) {
        throw new Error("NOT_FOUND");
      }

      const driveCode = String(driveDoc.DriveID || "").trim();

      deleteResult = await db
        .collection("Drives")
        .deleteOne({ _id: driveObjectId }, { session });

      if (deleteResult.deletedCount === 0) {
        throw new Error("NOT_FOUND");
      }

      if (driveCode) {
        await db.collection("Jobs").updateMany(
          {},
          {
            $unset: { [`Drive.${driveCode}`]: "" },
            $pull: { driveObjectIds: driveObjectIdText },
          },
          { session },
        );
      } else {
        await db.collection("Jobs").updateMany(
          {},
          { $pull: { driveObjectIds: driveObjectIdText } },
          { session },
        );
      }

      const candidateMatch = {
        $or: [
          { driveId: { $in: [id, driveObjectIdText] } },
          { assignedDriveId: { $in: [id, driveObjectIdText] } },
        ],
      };

      if (driveCode) {
        candidateMatch.$or.push(
          { DriveID: { $regex: `^${escapeRegExp(driveCode)}$`, $options: "i" } },
          { AssignedDriveId: { $regex: `^${escapeRegExp(driveCode)}$`, $options: "i" } },
        );
      }

      await db.collection("Candidate").updateMany(
        candidateMatch,
        {
          $unset: {
            driveId: "",
            assignedDriveId: "",
            DriveID: "",
            AssignedDriveId: "",
          },
          $set: { updatedAt: new Date() },
        },
        { session },
      );
    });

    // console.log("Drive deleted:", deleteResult.deletedCount);
    return deleteResult;
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return { deletedCount: 0 };
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function editDrive(id, updateData) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const driveObjectId = new ObjectId(id);
  const driveObjectIdText = String(driveObjectId);
  const existingDrive = await db.collection("Drives").findOne({ _id: driveObjectId });
  if (!existingDrive) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const previousDriveId = String(existingDrive.DriveID || "").trim();
  const incomingDriveId =
    updateData?.DriveID ?? updateData?.driveId ?? updateData?.driveID;
  const nextDriveId = String(
    incomingDriveId !== undefined ? incomingDriveId : previousDriveId,
  ).trim();

  const incomingCollegeName =
    updateData?.CollegeName ?? updateData?.collegeName ?? updateData?.college;
  const nextCollegeName = String(
    incomingCollegeName !== undefined
      ? incomingCollegeName
      : existingDrive.CollegeName || "",
  ).trim();

  const incomingStartDate = updateData?.StartDate ?? updateData?.startDate;
  const nextStartDate = String(
    incomingStartDate !== undefined ? incomingStartDate : existingDrive.StartDate || "",
  ).trim();

  const incomingEndDate = updateData?.EndDate ?? updateData?.endDate;
  const nextEndDate = String(
    incomingEndDate !== undefined ? incomingEndDate : existingDrive.EndDate || "",
  ).trim();

  const hasJobsInPayload =
    Object.prototype.hasOwnProperty.call(updateData || {}, "JobsOpening") ||
    Object.prototype.hasOwnProperty.call(updateData || {}, "jobsOpening");
  const jobsOpeningPayload = Object.prototype.hasOwnProperty.call(updateData || {}, "JobsOpening")
    ? updateData?.JobsOpening
    : updateData?.jobsOpening;
  const nextJobsOpening = hasJobsInPayload
    ? normalizeDriveJobsOpening(jobsOpeningPayload)
    : normalizeJobNames(existingDrive.JobsOpening || []);

  const nextStatus = String(
    updateData?.Status ?? updateData?.status ?? existingDrive.Status ?? "Draft",
  ).trim() || "Draft";
  const nextSelected = Number(
    updateData?.Selected ?? updateData?.selected ?? existingDrive.Selected ?? 0,
  ) || 0;

  const safeUpdateData = stripLegacyDriveFields(updateData);
  delete safeUpdateData.DriveID;
  delete safeUpdateData.CollegeName;
  delete safeUpdateData.StartDate;
  delete safeUpdateData.EndDate;
  delete safeUpdateData.JobsOpening;
  delete safeUpdateData.Status;
  delete safeUpdateData.CandidateIDs;
  delete safeUpdateData.NumberOfCandidates;
  delete safeUpdateData.Selected;

  const previousJobsOpening = normalizeJobNames(existingDrive.JobsOpening || []);
  const nextJobsSet = new Set(nextJobsOpening.map((job) => job.toLowerCase()));
  const removedJobs = previousJobsOpening.filter(
    (job) => !nextJobsSet.has(job.toLowerCase()),
  );

  const result = await db.collection("Drives").updateOne(
    { _id: driveObjectId },
    {
      $set: {
        ...safeUpdateData,
        DriveID: nextDriveId,
        CollegeName: nextCollegeName,
        StartDate: nextStartDate,
        EndDate: nextEndDate,
        JobsOpening: nextJobsOpening,
        Status: nextStatus,
        Selected: nextSelected,
        updatedAt: new Date(),
      },
      $unset: {
        driveId: "",
        driveID: "",
        collegeName: "",
        college: "",
        startDate: "",
        endDate: "",
        jobsOpening: "",
        status: "",
        NumberOfCandidates: "",
        candidateIDs: "",
        candidateIds: "",
        numberOfCandidates: "",
        selected: "",
      },
    },
  );

  if (result.matchedCount === 0) {
    return result;
  }

  const updatedDriveDoc = {
    _id: driveObjectId,
    DriveID: nextDriveId,
    CollegeName: nextCollegeName,
  };

  if (removedJobs.length > 0) {
    for (const jobName of removedJobs) {
      const unsetDriveKeys = {};
      if (previousDriveId) {
        unsetDriveKeys[`Drive.${previousDriveId}`] = "";
      }
      if (nextDriveId && nextDriveId !== previousDriveId) {
        unsetDriveKeys[`Drive.${nextDriveId}`] = "";
      }

      await db.collection("Jobs").updateMany(
        { JobName: { $regex: `^${escapeRegExp(jobName)}$`, $options: "i" } },
        {
          $unset: unsetDriveKeys,
          $pull: { driveObjectIds: driveObjectIdText },
        },
      );
    }
  }

  if (nextJobsOpening.length > 0) {
    await linkJobsToDrive(nextJobsOpening, updatedDriveDoc);
  }

  if (previousDriveId && previousDriveId !== nextDriveId) {
    await db.collection("Jobs").updateMany(
      { driveObjectIds: driveObjectIdText },
      { $unset: { [`Drive.${previousDriveId}`]: "" } },
    );

    await db.collection("Candidate").updateMany(
      {
        $or: [
          { driveId: driveObjectIdText },
          { assignedDriveId: driveObjectIdText },
          { DriveID: { $regex: `^${escapeRegExp(previousDriveId)}$`, $options: "i" } },
          {
            AssignedDriveId: {
              $regex: `^${escapeRegExp(previousDriveId)}$`,
              $options: "i",
            },
          },
        ],
      },
      {
        $set: {
          driveId: driveObjectIdText,
          updatedAt: new Date(),
        },
        $unset: {
          assignedDriveId: "",
          DriveID: "",
          AssignedDriveId: "",
        },
      },
    );
  }

  return result;
}

export async function getDriveById(id) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid drive id");
  }

  const drive = await db.collection("Drives").findOne({ _id: new ObjectId(id) });
  if (!drive) return null;

  const derivedCandidateIds = await syncDriveCandidateStatsFromAssignments(drive, db);
  return normalizeDriveOutput({
    ...mapDriveWithCandidateStats(drive),
    CandidateIDs: derivedCandidateIds,
  });
}
