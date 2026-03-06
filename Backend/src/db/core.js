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

let db = null;

export function getDB() {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  return db;
}

export function startSession() {
  return client.startSession();
}

export async function connectDB() {
  if (db) return db;

  console.log("MongoDB: attempting connection...");
  await client.connect();
  console.log("MongoDB: connected");

  db = client.db(dbName);
  return db;
}

export async function closeDB() {
  await client.close();
  db = null;
  console.log("MongoDB connection closed");
}
