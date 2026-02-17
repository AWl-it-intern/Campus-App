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

  const result = await db.collection("Candidate").insertOne({
    ...candidateData,
    createdAt: new Date(),
  });

  console.log("✅ Candidate inserted:", result.insertedId);

  return result;
}

/* -------- Print Candidates -------- */
export async function printCandidates(limit = 50, debug = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const candidates = await db
    .collection("Candidate")
    .find({})
    .limit(limit)
    .toArray();

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

  const result = await db.collection("Jobs").insertOne({
    ...jobData,
    createdAt: new Date(),
  });

  console.log("✅ Job inserted:", result.insertedId);

  return result;
}

/* -------- Print Jobs -------- */
export async function printJobs(limit = 50, debug = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const jobs = await db
    .collection("Jobs")
    .find({})
    .limit(limit)
    .toArray();

  if (debug) {
    console.log(`📄 Job collection | Count: ${jobs.length}`);
  }

  return jobs;
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
export async function printPanelists(limit = 50, includeAll = false) {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  const collection = db.collection("Panelist");
  const query = includeAll ? {} : { limit: limit };

  const panelists = await collection
    .find({})
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  return panelists;
}
