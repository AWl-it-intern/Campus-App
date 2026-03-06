import { ObjectId } from "mongodb";
import { getDB } from "./core.js";
import { normalizeStringArray } from "./helpers.js";

function normalizePanelistJobs(values) {
  return normalizeStringArray(values || []);
}

function normalizePanelistPayload(panelistData = {}, { forUpdate = false } = {}) {
  const {
    assignedJobs: _ignoredAssignedJobs,
    AssignedJobs: _ignoredAssignedJobsLegacy,
    assignedJob: _ignoredAssignedJobLegacy,
    AssignedJob: _ignoredAssignedJobLegacyAlt,
    scheduledRounds: _ignoredScheduledRounds,
    ScheduledRounds: _ignoredScheduledRoundsLegacy,
    ...rest
  } = panelistData || {};

  const normalized = { ...rest };

  const hasAssignedJobs =
    !forUpdate ||
    Object.prototype.hasOwnProperty.call(panelistData, "assignedJobs") ||
    Object.prototype.hasOwnProperty.call(panelistData, "AssignedJobs") ||
    Object.prototype.hasOwnProperty.call(panelistData, "assignedJob") ||
    Object.prototype.hasOwnProperty.call(panelistData, "AssignedJob");

  if (hasAssignedJobs) {
    const assignedJobsSource =
      panelistData?.assignedJobs ??
      panelistData?.AssignedJobs ??
      panelistData?.assignedJob ??
      panelistData?.AssignedJob ??
      [];
    normalized.assignedJobs = normalizePanelistJobs(assignedJobsSource);
  }

  const hasScheduledRounds =
    !forUpdate ||
    Object.prototype.hasOwnProperty.call(panelistData, "scheduledRounds") ||
    Object.prototype.hasOwnProperty.call(panelistData, "ScheduledRounds");

  if (hasScheduledRounds) {
    const scheduledRoundsSource =
      panelistData?.scheduledRounds ?? panelistData?.ScheduledRounds ?? [];
    normalized.scheduledRounds = Array.isArray(scheduledRoundsSource)
      ? scheduledRoundsSource
      : [];
  }

  const shouldNormalizeName =
    !forUpdate || Object.prototype.hasOwnProperty.call(panelistData, "name");
  if (shouldNormalizeName) {
    normalized.name = String(panelistData?.name ?? normalized.name ?? "").trim();
  }

  const shouldNormalizeEmail =
    !forUpdate || Object.prototype.hasOwnProperty.call(panelistData, "email");
  if (shouldNormalizeEmail) {
    normalized.email = String(panelistData?.email ?? normalized.email ?? "").trim();
  }

  const shouldNormalizeDesignation =
    !forUpdate || Object.prototype.hasOwnProperty.call(panelistData, "designation");
  if (shouldNormalizeDesignation) {
    normalized.designation = String(
      panelistData?.designation ?? normalized.designation ?? "",
    ).trim();
  }

  const shouldNormalizeExpertise =
    !forUpdate || Object.prototype.hasOwnProperty.call(panelistData, "expertise");
  if (shouldNormalizeExpertise) {
    normalized.expertise = String(
      panelistData?.expertise ?? normalized.expertise ?? "",
    ).trim();
  }

  return normalized;
}

function normalizePanelistOutput(panelist = {}) {
  return normalizePanelistPayload(panelist, { forUpdate: false });
}

export async function insertPanelist(panelistData) {
  const db = getDB();
  const normalizedPayload = normalizePanelistPayload(panelistData, { forUpdate: false });

  const result = await db.collection("Panelist").insertOne({
    ...normalizedPayload,
    createdAt: new Date(),
  });

  console.log("Panelist inserted:", result.insertedId);

  return result;
}

export async function deletePanelist(id) {
  const db = getDB();
  const result = await db.collection("Panelist").deleteOne({ _id: new ObjectId(id) });

  console.log("Panelist deleted:", result.deletedCount);

  return result;
}

export async function updatePanelist(id, updateData) {
  const db = getDB();
  const normalizedPayload = normalizePanelistPayload(updateData, { forUpdate: true });

  const result = await db.collection("Panelist").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: { ...normalizedPayload, updatedAt: new Date() },
      $unset: {
        AssignedJobs: "",
        assignedJob: "",
        AssignedJob: "",
        ScheduledRounds: "",
      },
    },
  );

  console.log("Panelist updated:", result.modifiedCount);

  return result;
}

export async function printPanelists(limit = 50) {
  const db = getDB();
  const numericLimit = Number(limit);
  const cursor = db.collection("Panelist").find({}).sort({ createdAt: -1 });
  if (Number.isFinite(numericLimit) && numericLimit > 0) {
    cursor.limit(numericLimit);
  }

  const panelists = await cursor.toArray();
  const normalizedPanelists = panelists.map((panelist) =>
    normalizePanelistOutput(panelist),
  );

  return normalizedPanelists;
}
