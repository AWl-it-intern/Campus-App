import { ObjectId } from "mongodb";
import { getDB } from "./core.js";

let candidateSequenceCache = null;
let candidateFreeIdsCache = null;
let candidateSequenceInitPromise = null;

function parseCandidateSequence(candidateId) {
  if (!candidateId) return null;

  const match = String(candidateId).trim().match(/^CND(\d+)$/i);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeCandidateSequenceNumbers(values = []) {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ).sort((left, right) => left - right);
}

async function getUsedCandidateSequenceNumbers() {
  const db = getDB();

  const cursor = db.collection("Candidate").find(
    { CandidateID: { $regex: /^CND\d+$/i } },
    { projection: { CandidateID: 1 } },
  );

  const used = new Set();

  for await (const doc of cursor) {
    const value = doc.CandidateID || "";
    const parsed = parseCandidateSequence(value);
    if (parsed !== null) {
      used.add(parsed);
    }
  }

  return Array.from(used).sort((left, right) => left - right);
}

async function ensureCandidateSequenceCache(countersCollection) {
  if (candidateSequenceCache !== null && Array.isArray(candidateFreeIdsCache)) {
    return {
      seq: candidateSequenceCache,
      freeIds: candidateFreeIdsCache,
    };
  }

  if (!candidateSequenceInitPromise) {
    candidateSequenceInitPromise = (async () => {
      const existing = await countersCollection.findOne({ _id: "candidateId" });
      const storedSeq = Number(existing?.seq) || 0;
      const storedFreeIds = normalizeCandidateSequenceNumbers(existing?.freeIds);
      const usedSequences = await getUsedCandidateSequenceNumbers();

      let nextSeq = 0;
      let nextFreeIds = [];

      if (usedSequences.length > 0) {
        const maxUsed = usedSequences[usedSequences.length - 1];
        nextSeq = Math.max(storedSeq, maxUsed);

        const usedSet = new Set(usedSequences);
        const inferredMissing = [];

        for (let sequence = 1; sequence <= nextSeq; sequence += 1) {
          if (!usedSet.has(sequence)) {
            inferredMissing.push(sequence);
          }
        }

        const mergedFreeIds = normalizeCandidateSequenceNumbers([
          ...storedFreeIds,
          ...inferredMissing,
        ]);
        nextFreeIds = mergedFreeIds.filter(
          (sequence) => !usedSet.has(sequence) && sequence <= nextSeq,
        );
      }

      await countersCollection.updateOne(
        { _id: "candidateId" },
        { $set: { seq: nextSeq, freeIds: nextFreeIds } },
        { upsert: true },
      );

      candidateSequenceCache = nextSeq;
      candidateFreeIdsCache = nextFreeIds;

      return {
        seq: candidateSequenceCache,
        freeIds: candidateFreeIdsCache,
      };
    })().finally(() => {
      candidateSequenceInitPromise = null;
    });
  }

  return candidateSequenceInitPromise;
}

async function persistCandidateSequenceState(countersCollection) {
  await countersCollection.updateOne(
    { _id: "candidateId" },
    {
      $set: {
        seq: candidateSequenceCache,
        freeIds: candidateFreeIdsCache,
      },
    },
    { upsert: true },
  );
}

export async function reserveCandidateSequences(count = 1) {
  const db = getDB();
  const counters = db.collection("counters");
  const safeCount = Math.max(1, Math.floor(Number(count) || 1));

  await ensureCandidateSequenceCache(counters);

  // If the candidate collection is empty, always restart from CND001.
  // This handles long-running server processes with stale in-memory cache.
  const hasAnyCandidate = await db.collection("Candidate").findOne(
    { CandidateID: { $regex: /^CND\d+$/i } },
    { projection: { _id: 1 } },
  );

  if (!hasAnyCandidate) {
    candidateSequenceCache = 0;
    candidateFreeIdsCache = [];
    await persistCandidateSequenceState(counters);
  }

  const reservedSequences = [];

  while (reservedSequences.length < safeCount && candidateFreeIdsCache.length > 0) {
    const nextFreeId = candidateFreeIdsCache.shift();
    if (Number.isInteger(nextFreeId) && nextFreeId > 0) {
      reservedSequences.push(nextFreeId);
    }
  }

  if (reservedSequences.length < safeCount) {
    const missingCount = safeCount - reservedSequences.length;
    const start = candidateSequenceCache + 1;

    for (let index = 0; index < missingCount; index += 1) {
      reservedSequences.push(start + index);
    }

    candidateSequenceCache += missingCount;
  }

  await persistCandidateSequenceState(counters);
  return reservedSequences;
}

export async function allocateCandidateIds(count = 1) {
  const reservedSequences = await reserveCandidateSequences(count);
  return reservedSequences.map((sequence) => formatCandidateId(sequence));
}

export async function releaseCandidateSequence(candidateId) {
  const sequence = parseCandidateSequence(candidateId);
  if (!sequence) return false;

  const db = getDB();
  const counters = db.collection("counters");

  await ensureCandidateSequenceCache(counters);

  if (sequence > candidateSequenceCache) {
    candidateSequenceCache = sequence;
  }

  if (!candidateFreeIdsCache.includes(sequence)) {
    candidateFreeIdsCache = normalizeCandidateSequenceNumbers([
      ...candidateFreeIdsCache,
      sequence,
    ]);
    await persistCandidateSequenceState(counters);
  }

  return true;
}

export async function getNextSequence(sequenceName, count = 1) {
  const db = getDB();
  const counters = db.collection("counters");
  const safeCount = Math.max(1, Math.floor(Number(count) || 1));

  if (sequenceName === "candidateId") {
    const values = await reserveCandidateSequences(safeCount);
    const start = values[0] || 1;
    const end = values[values.length - 1] || start;
    return { start, end, values };
  }

  const existing = await counters.findOne({ _id: sequenceName });
  const seed = Number(existing?.seq) || 0;

  if (!existing) {
    await counters.insertOne({ _id: sequenceName, seq: seed });
  }

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: safeCount } },
    { returnDocument: "before" },
  );

  const current = Number(
    result?.seq ??
      result?.value?.seq ??
      existing?.seq ??
      seed,
  ) || 0;
  return { start: current + 1, end: current + safeCount };
}

export function formatCandidateId(sequenceNumber) {
  return `CND${String(sequenceNumber).padStart(3, "0")}`;
}

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

export function extractDriveReferences(source = {}) {
  return normalizeStringArray([
    source?.driveId,
    source?.DriveID,
    source?.assignedDriveId,
    source?.AssignedDriveId,
  ]);
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
    return { driveId: "" };
  }

  return { driveId: String(primaryDrive._id) };
}

export function hasDriveReferenceKeys(payload = {}) {
  return (
    Object.prototype.hasOwnProperty.call(payload, "driveId") ||
    Object.prototype.hasOwnProperty.call(payload, "DriveID") ||
    Object.prototype.hasOwnProperty.call(payload, "assignedDriveId") ||
    Object.prototype.hasOwnProperty.call(payload, "AssignedDriveId")
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
