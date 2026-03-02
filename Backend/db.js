import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true, // dev only
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});


let db;

function parseCandidateSequence(candidateId) {
  if (!candidateId) return null;
  const match = String(candidateId).trim().match(/^CND(\d+)$/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getMaxCandidateSequence() {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const cursor = db.collection("Candidate").find(
    { CandidateID: { $regex: /^CND\d+$/i } },
    { projection: { CandidateID: 1 } },
  );

  let maxSequence = 0;

  for await (const doc of cursor) {
    const value = doc.CandidateID || "";
    const parsed = parseCandidateSequence(value);
    if (parsed !== null) {
      maxSequence = Math.max(maxSequence, parsed);
    }
  }

  return maxSequence;
}

async function getNextSequence(sequenceName, count = 1) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const counters = db.collection("counters");
  const existing = await counters.findOne({ _id: sequenceName });
  let seed = existing?.seq || 0;

  if (!existing && sequenceName === "candidateId") {
    const maxCandidate = await getMaxCandidateSequence();
    if (maxCandidate > seed) {
      seed = maxCandidate;
    }
  }

  if (!existing) {
    await counters.insertOne({ _id: sequenceName, seq: seed });
  } else if (seed !== existing.seq) {
    await counters.updateOne({ _id: sequenceName }, { $set: { seq: seed } });
  }

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: count } },
    { returnDocument: "before" },
  );

  const current = result?.value?.seq || 0;
  return { start: current + 1, end: current + count };
}

function formatCandidateId(sequenceNumber) {
  return `CND${String(sequenceNumber).padStart(3, "0")}`;
}

async function ensureSequenceAtLeast(sequenceName, minValue) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!Number.isFinite(minValue) || minValue <= 0) {
    return;
  }

  const counters = db.collection("counters");
  await counters.updateOne(
    { _id: sequenceName },
    { $max: { seq: minValue } },
    { upsert: true },
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
}

function extractDriveReferences(source = {}) {
  return normalizeStringArray([
    source?.driveId,
    source?.DriveID,
    source?.assignedDriveId,
    source?.AssignedDriveId,
  ]);
}

function normalizeDriveCandidateIds(source = {}) {
  return normalizeStringArray(
    source?.CandidateIDs ||
      source?.candidateIDs ||
      source?.candidateIds ||
      [],
  );
}

function mapDriveWithCandidateStats(drive = {}) {
  const candidateIds = normalizeDriveCandidateIds(drive);
  return {
    ...drive,
    CandidateIDs: candidateIds,
    NumberOfCandidates: candidateIds.length,
  };
}

function getCandidateDriveKey(candidate = {}) {
  const value = String(candidate?.CandidateID || "").trim();
  return value || null;
}

function normalizeDriveObjectIdStrings(values = []) {
  return Array.from(
    new Set(
      (values || [])
        .filter(Boolean)
        .map((value) => String(value))
        .filter((value) => ObjectId.isValid(value)),
    ),
  );
}

async function resolveDriveObjectIdsByReferences(references = [], cache = new Map()) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

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

async function addCandidateToDrives(candidateKey, driveObjectIds = []) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const normalizedCandidateKey = String(candidateKey || "").trim();
  if (!normalizedCandidateKey || driveObjectIds.length === 0) {
    return;
  }

  await db.collection("Drives").updateMany(
    { _id: { $in: driveObjectIds } },
    { $addToSet: { CandidateIDs: normalizedCandidateKey } },
  );
}

async function removeCandidateFromDrives(candidateKey, driveObjectIds = []) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const normalizedCandidateKey = String(candidateKey || "").trim();
  if (!normalizedCandidateKey || driveObjectIds.length === 0) {
    return;
  }

  await db.collection("Drives").updateMany(
    { _id: { $in: driveObjectIds } },
    { $pull: { CandidateIDs: normalizedCandidateKey } },
  );
}

async function syncCandidateDriveMembership(candidateKey, previousDriveIds = [], nextDriveIds = []) {
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
    await addCandidateToDrives(candidateKey, driveIdsToAdd);
  }

  if (driveIdsToRemove.length > 0) {
    await removeCandidateFromDrives(candidateKey, driveIdsToRemove);
  }
}

/* -------- Connect -------- */
export async function connectDB() {
  if (db) return db;

  console.log("⏳ MongoDB: attempting connection...");
  await client.connect();          // <— if it hangs, you’ll know
  console.log("✅ MongoDB: connected");

  db = client.db(dbName);
  return db;
}


/* -------- Insert Candidate -------- */
export async function insertCandidate(candidateData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!candidateData?.email) {
    throw new Error("Email is required");
  }

  try {
    const { CandidateID: _ignoredCandidateId, ...safeCandidateData } = candidateData || {};
    const { start } = await getNextSequence("candidateId", 1);
    const candidateId = formatCandidateId(start);
    const result = await db.collection("Candidate").insertOne({
      ApplicationStatus: candidateData?.ApplicationStatus || "Under Review",
      AssignedPanelist: Array.isArray(candidateData?.AssignedPanelist)
        ? candidateData.AssignedPanelist
        : [],
      ...safeCandidateData,
      CandidateID: candidateId,
      createdAt: new Date(),
    });

    if (result.acknowledged) {
      console.log("✅ Candidate inserted:", result.insertedId);
    }

    return result;

  } catch (error) {
    console.error("❌ Candidate insert failed:", error);
    throw error;
  }
}

/* -------- Insert Many Candidates -------- */
export async function insertManyCandidates(candidatesData = []) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!Array.isArray(candidatesData) || candidatesData.length === 0) {
    throw new Error("Candidates array is required");
  }

  let maxProvidedSequence = 0;
  const candidatesNeedingId = [];

  candidatesData.forEach((candidate, index) => {
    const parsed = parseCandidateSequence(candidate?.CandidateID);
    if (parsed !== null) {
      maxProvidedSequence = Math.max(maxProvidedSequence, parsed);
    } else {
      candidatesNeedingId.push(index);
    }
  });

  if (maxProvidedSequence > 0) {
    await ensureSequenceAtLeast("candidateId", maxProvidedSequence);
  }

  let generatedStart = null;
  if (candidatesNeedingId.length > 0) {
    const { start } = await getNextSequence("candidateId", candidatesNeedingId.length);
    generatedStart = start;
  }

  let generatedOffset = 0;

  const preparedCandidates = candidatesData.map((candidate, index) => {
    if (!candidate?.email) {
      throw new Error(`Email is required for candidate at row ${index + 1}`);
    }

    const providedSequence = parseCandidateSequence(candidate?.CandidateID);
    let candidateId = null;
    if (providedSequence !== null) {
      candidateId = formatCandidateId(providedSequence);
    } else if (generatedStart !== null) {
      candidateId = formatCandidateId(generatedStart + generatedOffset);
      generatedOffset += 1;
    }

    const { CandidateID: _ignoredCandidateId, ...safeCandidate } = candidate || {};

    return {
      ApplicationStatus: candidate?.ApplicationStatus || "Under Review",
      AssignedPanelist: Array.isArray(candidate?.AssignedPanelist)
        ? candidate.AssignedPanelist
        : [],
      ...safeCandidate,
      CandidateID: candidateId,
      email: String(candidate.email).trim(),
      name: String(candidate.name || "").trim(),
      college: String(candidate.college || "").trim(),
      AssignedJob: String(candidate.AssignedJob || "").trim(),
      createdAt: new Date(),
    };
  });

  const result = await db.collection("Candidate").insertMany(preparedCandidates, {
    ordered: false,
  });

  console.log("Candidates inserted:", result.insertedCount);
  return result;
}


/* -------- Print Candidates -------- */
export async function printCandidates({ limit = 50, job, college, debug = false }) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const numericLimit = Number(limit);

  // Build MongoDB filter object
  const filter = {};

  // Filter Candidates where AssignedJobs array contains job (case-insensitive)
  if (job && job.trim()) {
    filter.AssignedJobs = { $elemMatch: { $regex: `^${job.trim()}$`, $options: "i" } };
  }

  // Filter by college (case-insensitive)
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

  if (debug) {
    console.log(`📄 Filter:`, filter);
    console.log(`📄 Candidate count: ${candidates.length}`);
  }

  return candidates;
}


/* -------- Insert Job -------- */
export async function insertJob(jobData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!jobData?.JobID) {
    throw new Error("Job ID is required");
  }

  try {
    const result = await db.collection("Jobs").insertOne({
      Drive: jobData?.Drive && typeof jobData.Drive === "object" ? jobData.Drive : {},
      assignedPanelist: Array.isArray(jobData?.assignedPanelist)
        ? jobData.assignedPanelist
        : [],
      ...jobData,
      createdAt: new Date(),
    });

    // Only log if MongoDB confirms insert
    if (result.acknowledged) {
      console.log("Job inserted:", result.insertedId);
    }

    return result;

  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}


/* -------- Print Jobs -------- */
export async function printJobs(limit = 50, debug = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const numericLimit = Number(limit);
  const cursor = db.collection("Jobs").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const jobs = await cursor.toArray();

  if (debug) {
    console.log(`📄 Job collection | Count: ${jobs.length}`);
  }

  return jobs;
}

/* -------- Delete Job -------- */
export async function deleteJob(id) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const result = await db.collection("Jobs").deleteOne({ _id: new ObjectId(id) });

  console.log(" Job deleted:", result.deletedCount);

  return result;
}

/* -------- Insert Drive -------- */
export async function insertDrive(driveData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (
    !driveData?.DriveID ||
    !driveData?.CollegeName ||
    !driveData?.StartDate ||
    !driveData?.EndDate
  ) {
    throw new Error(
      "DriveID, CollegeName, StartDate and EndDate are required",
    );
  }

  const normalizedDriveId = String(driveData.DriveID).trim();

  const existingDrive = await db.collection("Drives").findOne({
    DriveID: normalizedDriveId,
  });

  if (existingDrive) {
    throw new Error("Drive ID already exists");
  }

  const normalizedJobs = Array.isArray(driveData.JobsOpening)
    ? driveData.JobsOpening
    : typeof driveData.JobsOpening === "string"
      ? driveData.JobsOpening.split(",").map((name) => name.trim()).filter(Boolean)
      : [];

  const result = await db.collection("Drives").insertOne({
    ...driveData,
    DriveID: normalizedDriveId,
    CollegeName: String(driveData.CollegeName).trim(),
    JobsOpening: normalizedJobs,
    Status: driveData.Status || "Draft",
    NumberOfCandidates: Number(driveData.NumberOfCandidates) || 0,
    Selected: Number(driveData.Selected) || 0,
    createdAt: new Date(),
  });

  console.log(" Drive inserted:", result.insertedId);

  if (normalizedJobs.length > 0) {
    const driveMapping = { [normalizedDriveId]: String(driveData.CollegeName).trim() };
    await db.collection("Jobs").updateMany(
      { JobName: { $in: normalizedJobs } },
      { $set: { Drive: driveMapping } },
    );
  }

  return result;
}

/* -------- Print Drives -------- */
export async function printDrives(limit = 100, debug = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const numericLimit = Number(limit);
  const cursor = db.collection("Drives").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const drives = await cursor.toArray();

  const drivesWithCounts = [];
  for (const drive of drives) {
    const driveKeySet = new Set(
      [drive._id, drive.id, drive.DriveID]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    );
    const candidateCount = await db.collection("Candidate").countDocuments({
      $or: [
        { driveId: { $in: Array.from(driveKeySet) } },
        { DriveID: { $in: Array.from(driveKeySet) } },
        { assignedDriveId: { $in: Array.from(driveKeySet) } },
        { AssignedDriveId: { $in: Array.from(driveKeySet) } },
      ],
    });

    drivesWithCounts.push({
      ...drive,
      NumberOfCandidates: candidateCount,
    });
  }

  if (debug) {
    console.log(` Drive collection | Count: ${drives.length}`);
  }

  return drivesWithCounts;
}

/* -------- Delete Drive -------- */
export async function deleteDrive(id) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const result = await db
    .collection("Drives")
    .deleteOne({ _id: new ObjectId(id) });

  console.log(" Drive deleted:", result.deletedCount);

  return result;
}

/* -------- Edit Drive -------- */
export async function editDrive(id, updateData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const result = await db.collection("Drives").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
  );

  return result;
}

// /* -------- Patch Drive NumberOfCandidates -------- */
// export async function updateNumberOfCandidates(id, numberOfCandidates) {
//   if (!db) {
//     throw new Error("DB not connected. Call connectDB() first.");
//   }

//   const result = await db.collection("Drives").updateOne(
//     { _id: new ObjectId(id) },
//     {
//       $set: {
//         NumberOfCandidates: Number(numberOfCandidates) || 0,
//         updatedAt: new Date(),
//       },
//     },
//   );

//   return result;
// }

/* -------- Get Drive By Id -------- */
export async function getDriveById(id) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid drive id");
  }

  return db.collection("Drives").findOne({ _id: new ObjectId(id) });
}

//  Insert Users ---------------------------------------
export async function insertUsers(UserData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  if (!UserData?.email && !UserData?.password) {
    throw new Error("Please Enter required fields First!!");
  }

  const result = await db.collection("Users").insertOne({
    ...UserData,
    Role: "Candidate",
    createdAt: new Date(),
  });

  console.log("✅ User inserted:", result.insertedId);

  return result;
}




/* -------- Delete Candidate (Transactional) -------- */
export async function deleteCandidate(id) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  // If id isn't a valid ObjectId, behave as "not found"
  if (!ObjectId.isValid(id)) {
    return { deletedCount: 0 };
  }

  const objectId = new ObjectId(id);
  const hexId = objectId.toString(); // covers your string storage case in Jobs.assignedCandidates
  const session = client.startSession();

  try {
    let deleteResult = { deletedCount: 0 };

    await session.withTransaction(async () => {
      // 1) Delete the candidate document
      deleteResult = await db
        .collection("Candidate")
        .deleteOne({ _id: objectId }, { session });

      if (deleteResult.deletedCount === 0) {
        // abort cleanly so caller returns 404
        throw new Error("NOT_FOUND");
      }

      // 2) Remove the candidate id from Jobs.assignedCandidates
      //    - Handles both ObjectId arrays and string arrays (String(ObjectId))
      await db.collection("Jobs").updateMany(
        { assignedCandidates: { $in: [objectId, hexId, id] } },
        { $pull: { assignedCandidates: { $in: [objectId, hexId, id] } } },
        { session }
      );
    });

    return deleteResult;
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return { deletedCount: 0 };
    }
    throw err; // bubble up to handler -> 500
  } finally {
    await session.endSession();
  }
}

//------------------Edit Candidate-----------------

export async function editcandidate(id, updateData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const candidateId = new ObjectId(id);
  const existingCandidate = await db.collection("Candidate").findOne({
    _id: candidateId,
  });

  if (!existingCandidate) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const payload = { ...updateData };
  const hasAssignedJobs = Object.prototype.hasOwnProperty.call(payload, "AssignedJobs");
  let updatedAssignedJobs = null;

  if (hasAssignedJobs) {
    const incomingJobs = Array.isArray(payload.AssignedJobs)
      ? payload.AssignedJobs.filter(Boolean).map(String)
      : [];
    const previousJobs = Array.isArray(existingCandidate.AssignedJobs)
      ? existingCandidate.AssignedJobs.filter(Boolean).map(String)
      : [];

    const replaceAssignedJobs =
      payload.replaceAssignedJobs === true || payload.clearAssignedJobs === true;

    if (replaceAssignedJobs) {
      updatedAssignedJobs = incomingJobs;
    } else {
      const merged = new Set([...previousJobs, ...incomingJobs]);
      updatedAssignedJobs = Array.from(merged);
    }

    payload.AssignedJobs = updatedAssignedJobs;
    delete payload.replaceAssignedJobs;
    delete payload.clearAssignedJobs;
  }

  const result = await db.collection("Candidate").updateOne(
    { _id: candidateId },
    {
      $set: {
        ...payload,
        updatedAt: new Date(),
      },
    }
  );

  if (hasAssignedJobs) {
    const previousJobs = Array.isArray(existingCandidate.AssignedJobs)
      ? existingCandidate.AssignedJobs.filter(Boolean).map(String)
      : [];
    const previousSet = new Set(previousJobs);
    const nextJobs = Array.isArray(updatedAssignedJobs) ? updatedAssignedJobs : [];
    const nextSet = new Set(nextJobs);
    const candidateKey = String(candidateId);

    const jobsToAdd = nextJobs.filter((job) => !previousSet.has(job));
    const jobsToRemove = previousJobs.filter((job) => !nextSet.has(job));

    if (jobsToAdd.length > 0) {
      await db.collection("Jobs").updateMany(
        { JobName: { $in: jobsToAdd } },
        { $addToSet: { assignedCandidates: candidateKey } }
      );
    }

    if (jobsToRemove.length > 0) {
      await db.collection("Jobs").updateMany(
        { JobName: { $in: jobsToRemove } },
        { $pull: { assignedCandidates: candidateKey } }
      );
    }
  }

  console.log("Candidate updated:", result.modifiedCount);

  return result;
}

/* -------- Close -------- */
export async function closeDB() {
  if (!client) return;

  await client.close();
  db = null;
  console.log("🔒 MongoDB connection closed");
}


/*--------------Add panelist------------------*/
export async function insertPanelist(panelistData) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const result = await db.collection("Panelist").insertOne({
    ...panelistData,
    createdAt: new Date(),
  });

  console.log("✅ Panelist inserted:", result.insertedId);

  return result;
}

/* -------- Delete Panelist -------- */
export async function deletePanelist(id) {
  if (!db) {
    throw new Error('DB not connected. Call connectDB() first.');
  }

  const result = await db.collection('Panelist').deleteOne({ _id: new ObjectId(id) });

  console.log(' Panelist deleted:', result.deletedCount);

  return result;
}

/* -------- Update Panelist -------- */
export async function updatePanelist(id, updateData) {
  if (!db) {
    throw new Error('DB not connected. Call connectDB() first.');
  }

  const result = await db.collection('Panelist').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  console.log('Panelist updated:', result.modifiedCount);

  return result;
}

/* -------- Print Panelists -------- */
export async function printPanelists(limit = 50) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const numericLimit = Number(limit);
  const cursor = db.collection("Panelist").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const panelists = await cursor.toArray();

  return panelists;
}
