import { getDB } from "../core.js";

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
