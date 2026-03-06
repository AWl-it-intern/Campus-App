import { ObjectId } from "mongodb";
import { getDB } from "../core.js";
import {
  buildCandidateDriveFields,
  extractDriveReferences,
  hasDriveReferenceKeys,
  linkJobsToDrive,
  normalizeAssignedJobs,
  normalizeJobNames,
  resolveDriveDocsByReferences,
  resolveDriveObjectIdsByReferences,
  syncCandidateDriveMembership,
  syncJobsForCandidate,
} from "../helpers.js";

export async function editcandidate(id, updateData) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid candidate id");
  }

  const candidateId = new ObjectId(id);
  const existingCandidate = await db.collection("Candidate").findOne({
    _id: candidateId,
  });

  if (!existingCandidate) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const payload = { ...updateData };
  const hasAssignedJobs =
    Object.prototype.hasOwnProperty.call(payload, "AssignedJobs") ||
    Object.prototype.hasOwnProperty.call(payload, "AssignedJob") ||
    payload.clearAssignedJobs === true;

  const previousAssignedJobs = normalizeAssignedJobs(existingCandidate);
  let updatedAssignedJobs = previousAssignedJobs;

  if (hasAssignedJobs) {
    const incomingAssignedJobs = normalizeAssignedJobs(payload);
    const replaceAssignedJobs =
      payload.replaceAssignedJobs === true || payload.clearAssignedJobs === true;

    if (replaceAssignedJobs) {
      updatedAssignedJobs = normalizeJobNames(incomingAssignedJobs);
    } else {
      updatedAssignedJobs = normalizeJobNames([
        ...previousAssignedJobs,
        ...incomingAssignedJobs,
      ]);
    }

    payload.AssignedJobs = updatedAssignedJobs;
    delete payload.replaceAssignedJobs;
    delete payload.clearAssignedJobs;
  }

  const hasDriveUpdate = hasDriveReferenceKeys(payload);
  let previousDriveIds = [];
  let nextDriveDocs = [];

  if (hasDriveUpdate) {
    previousDriveIds = await resolveDriveObjectIdsByReferences(
      extractDriveReferences(existingCandidate),
    );

    nextDriveDocs = await resolveDriveDocsByReferences(extractDriveReferences(payload));
    Object.assign(payload, buildCandidateDriveFields(nextDriveDocs[0] || null));
  }

  const unsetLegacyFields = {};
  if (hasAssignedJobs || Object.prototype.hasOwnProperty.call(payload, "AssignedJob")) {
    unsetLegacyFields.AssignedJob = "";
  }
  if (hasDriveUpdate) {
    unsetLegacyFields.assignedDriveId = "";
    unsetLegacyFields.DriveID = "";
    unsetLegacyFields.AssignedDriveId = "";
  }

  delete payload.AssignedJob;
  delete payload.assignedDriveId;
  delete payload.DriveID;
  delete payload.AssignedDriveId;

  const updateDoc = {
    $set: {
      ...payload,
      updatedAt: new Date(),
    },
  };

  if (Object.keys(unsetLegacyFields).length > 0) {
    updateDoc.$unset = unsetLegacyFields;
  }

  const result = await db.collection("Candidate").updateOne(
    { _id: candidateId },
    updateDoc,
  );

  if (hasAssignedJobs) {
    await syncJobsForCandidate(
      String(candidateId),
      previousAssignedJobs,
      updatedAssignedJobs,
    );
  }

  if (hasDriveUpdate) {
    const candidateKey = String(existingCandidate.CandidateID || candidateId);
    await syncCandidateDriveMembership(
      candidateKey,
      previousDriveIds,
      nextDriveDocs.map((doc) => doc._id),
    );
  }

  const effectiveJobs = hasAssignedJobs
    ? updatedAssignedJobs
    : normalizeAssignedJobs(existingCandidate);

  if (hasDriveUpdate) {
    await linkJobsToDrive(effectiveJobs, nextDriveDocs[0] || null);
  } else if (hasAssignedJobs) {
    const currentDriveDocs = await resolveDriveDocsByReferences(
      extractDriveReferences(existingCandidate),
    );
    await linkJobsToDrive(effectiveJobs, currentDriveDocs[0] || null);
  }

  console.log("Candidate updated:", result.modifiedCount);

  return result;
}
