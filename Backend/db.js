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
    const result = await db.collection("Candidate").insertOne({
      ...candidateData,
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

  const preparedCandidates = candidatesData.map((candidate, index) => {
    if (!candidate?.email) {
      throw new Error(`Email is required for candidate at row ${index + 1}`);
    }

    return {
      ...candidate,
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
export async function printCandidates(limit = 50, debug = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const numericLimit = Number(limit);

  const cursor = db.collection("Candidate").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const candidates = await cursor.toArray();

  if (debug) {
    console.log(`📄 Candidate collection | Count: ${candidates.length}`);
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

  if (debug) {
    console.log(` Drive collection | Count: ${drives.length}`);
  }

  return drives;
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



/* -------- Delete Candidate -------- */
export async function deleteCandidate(id) {
  if (!db) {
    throw new Error('DB not connected. Call connectDB() first.');
  }

  const result = await db.collection('Candidate').deleteOne({ _id: new ObjectId(id) });

  console.log(' Candidate deleted:', result.deletedCount);

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
