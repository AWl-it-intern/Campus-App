import { ObjectId } from "mongodb";
import { getDB } from "../core.js";
import {
  escapeRegExp,
  normalizeDriveObjectIdStrings,
  normalizeStringArray,
} from "./common.helper.js";

export async function resolveDriveObjectIdsByReferences(references = [], cache = new Map()) {
  const db = getDB();
  const drivesCollection = db.collection("Drives");
  const resolvedIds = new Set();

  for (const reference of normalizeStringArray(references)) {
    const cacheKey = String(reference).toLowerCase();
    if (cache.has(cacheKey)) {
      const cachedId = cache.get(cacheKey);
      if (cachedId) {
        resolvedIds.add(cachedId);
      }
      continue;
    }

    let resolvedId = null;

    if (ObjectId.isValid(reference)) {
      const byObjectId = await drivesCollection.findOne(
        { _id: new ObjectId(reference) },
        { projection: { _id: 1 } },
      );
      if (byObjectId?._id) {
        resolvedId = String(byObjectId._id);
      }
    }

    if (!resolvedId) {
      const byDriveCode = await drivesCollection.findOne(
        {
          DriveID: {
            $regex: `^${escapeRegExp(reference)}$`,
            $options: "i",
          },
        },
        { projection: { _id: 1 } },
      );
      if (byDriveCode?._id) {
        resolvedId = String(byDriveCode._id);
      }
    }

    cache.set(cacheKey, resolvedId);
    if (resolvedId) {
      resolvedIds.add(resolvedId);
    }
  }

  return normalizeDriveObjectIdStrings(Array.from(resolvedIds)).map(
    (value) => new ObjectId(value),
  );
}

async function addCandidateToDrives(candidateKey, driveObjectIds = [], { session } = {}) {
  const db = getDB();
  const normalizedCandidateKey = String(candidateKey || "").trim();
  if (!normalizedCandidateKey || driveObjectIds.length === 0) {
    return;
  }

  await db.collection("Drives").updateMany(
    { _id: { $in: driveObjectIds } },
    [
      {
        $set: {
          CandidateIDs: {
            $setUnion: [
              { $ifNull: ["$CandidateIDs", []] },
              [normalizedCandidateKey],
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
    session ? { session } : undefined,
  );
}

export async function removeCandidateFromDrives(candidateKey, driveObjectIds = [], { session } = {}) {
  const db = getDB();
  const normalizedCandidateKey = String(candidateKey || "").trim();
  if (!normalizedCandidateKey || driveObjectIds.length === 0) {
    return;
  }

  await db.collection("Drives").updateMany(
    { _id: { $in: driveObjectIds } },
    [
      {
        $set: {
          CandidateIDs: {
            $filter: {
              input: { $ifNull: ["$CandidateIDs", []] },
              as: "candidateId",
              cond: {
                $ne: [
                  { $trim: { input: { $toString: "$$candidateId" } } },
                  normalizedCandidateKey,
                ],
              },
            },
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
    session ? { session } : undefined,
  );
}

function buildDriveCandidateAssignmentQuery(drive = {}) {
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

export async function recalculateDriveCandidateStats(driveObjectIds = [], { session } = {}) {
  const db = getDB();
  const normalizedDriveIds = normalizeDriveObjectIdStrings(
    (driveObjectIds || []).map((value) => String(value)),
  );

  if (normalizedDriveIds.length === 0) {
    return;
  }

  const driveIdsAsObjectIds = normalizedDriveIds.map((value) => new ObjectId(value));
  const driveFindOptions = { projection: { _id: 1, DriveID: 1 } };
  if (session) {
    driveFindOptions.session = session;
  }

  const drives = await db
    .collection("Drives")
    .find({ _id: { $in: driveIdsAsObjectIds } }, driveFindOptions)
    .toArray();

  for (const drive of drives) {
    const candidateQuery = buildDriveCandidateAssignmentQuery(drive);
    const candidateFindOptions = { projection: { _id: 1, CandidateID: 1 } };
    if (session) {
      candidateFindOptions.session = session;
    }

    const linkedCandidates = candidateQuery
      ? await db.collection("Candidate").find(candidateQuery, candidateFindOptions).toArray()
      : [];

    const candidateIds = normalizeStringArray(
      linkedCandidates.map((candidate) => candidate.CandidateID || candidate._id),
    );

    await db.collection("Drives").updateOne(
      { _id: drive._id },
      {
        $set: {
          CandidateIDs: candidateIds,
          updatedAt: new Date(),
        },
        $unset: {
          NumberOfCandidates: "",
          numberOfCandidates: "",
        },
      },
      session ? { session } : undefined,
    );
  }
}

export async function syncCandidateDriveMembership(
  candidateKey,
  previousDriveIds = [],
  nextDriveIds = [],
  { session } = {},
) {
  const previousSet = new Set(
    normalizeDriveObjectIdStrings(previousDriveIds.map((value) => String(value))),
  );
  const nextSet = new Set(
    normalizeDriveObjectIdStrings(nextDriveIds.map((value) => String(value))),
  );

  const driveIdsToAdd = Array.from(nextSet)
    .filter((value) => !previousSet.has(value))
    .map((value) => new ObjectId(value));
  const driveIdsToRemove = Array.from(previousSet)
    .filter((value) => !nextSet.has(value))
    .map((value) => new ObjectId(value));

  if (driveIdsToAdd.length > 0) {
    await addCandidateToDrives(candidateKey, driveIdsToAdd, { session });
  }

  if (driveIdsToRemove.length > 0) {
    await removeCandidateFromDrives(candidateKey, driveIdsToRemove, { session });
  }

  const affectedDriveIds = Array.from(new Set([...previousSet, ...nextSet]));
  if (affectedDriveIds.length > 0) {
    await recalculateDriveCandidateStats(affectedDriveIds, { session });
  }
}

export async function resolveDriveDocsByReferences(
  references = [],
  idCache = new Map(),
  docCache = new Map(),
) {
  const db = getDB();
  const resolvedIds = await resolveDriveObjectIdsByReferences(references, idCache);
  if (resolvedIds.length === 0) return [];

  const idsToFetch = [];
  const docs = [];

  for (const objectId of resolvedIds) {
    const idString = String(objectId);
    if (docCache.has(idString)) {
      const cached = docCache.get(idString);
      if (cached) docs.push(cached);
      continue;
    }
    idsToFetch.push(objectId);
  }

  if (idsToFetch.length > 0) {
    const fetchedDocs = await db
      .collection("Drives")
      .find(
        { _id: { $in: idsToFetch } },
        { projection: { _id: 1, DriveID: 1, CollegeName: 1 } },
      )
      .toArray();

    const fetchedMap = new Map(
      fetchedDocs.map((doc) => [String(doc._id), doc]),
    );

    for (const objectId of idsToFetch) {
      const key = String(objectId);
      const resolvedDoc = fetchedMap.get(key) || null;
      docCache.set(key, resolvedDoc);
      if (resolvedDoc) docs.push(resolvedDoc);
    }
  }

  const ordered = [];
  for (const objectId of resolvedIds) {
    const doc = docCache.get(String(objectId));
    if (doc) ordered.push(doc);
  }

  return ordered;
}

export function buildCandidateDriveFields(primaryDrive = null) {
  if (!primaryDrive?._id) {
    return { driveId: "", DriveID: "" };
  }

  return {
    driveId: String(primaryDrive._id),
    DriveID: String(primaryDrive.DriveID || "").trim(),
  };
}

export function hasDriveReferenceKeys(payload = {}) {
  return (
    Object.prototype.hasOwnProperty.call(payload, "driveId") ||
    Object.prototype.hasOwnProperty.call(payload, "DriveID") ||
    Object.prototype.hasOwnProperty.call(payload, "assignedDriveId") ||
    Object.prototype.hasOwnProperty.call(payload, "AssignedDriveId")
  );
}
