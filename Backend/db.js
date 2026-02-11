import { MongoClient } from "mongodb";
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
export async function printCandidates(limit = 10, debug = false) {
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
    console.table(candidates);
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
export async function printJobs(limit = 10, debug = false) {
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
    console.table(jobs);
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
    Role : "Candidate",
    createdAt: new Date(),
  });

  console.log("✅ User inserted:", result.insertedId);

  return result;
}


/* -------- Close -------- */
export async function closeDB() {
  if (!client) return;

  await client.close();
  db = null;
  console.log("🔒 MongoDB connection closed");
}
