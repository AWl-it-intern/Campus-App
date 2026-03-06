import { getDB } from "./core.js";

function normalizeUserPayload(UserData = {}) {
  const {
    Role: _ignoredRole,
    role: _ignoredRoleLegacy,
    ...rest
  } = UserData || {};

  return {
    ...rest,
    email: String(UserData?.email || "").trim(),
  };
}

export async function insertUsers(UserData) {
  const db = getDB();
  const normalizedPayload = normalizeUserPayload(UserData);

  if (!normalizedPayload?.email && !normalizedPayload?.password) {
    throw new Error("Please Enter required fields First!!");
  }

  const result = await db.collection("Users").insertOne({
    ...normalizedPayload,
    Role: "Candidate",
    createdAt: new Date(),
  });

  console.log("User inserted:", result.insertedId);

  return result;
}
