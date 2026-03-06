import { ObjectId } from "mongodb";
import { getDB, startSession } from "../core.js";
import {
  extractDriveReferences,
  normalizeAssignedJobs,
  recalculateDriveCandidateStats,
  releaseCandidateSequence,
  removeCandidateFromDrives,
  resolveDriveObjectIdsByReferences,
  syncJobsForCandidate,
} from "../helpers/index.js";

export async function deleteCandidate(id) {
  const db = getDB();

  if (!ObjectId.isValid(id)) {
    return { deletedCount: 0 };
  }

  const objectId = new ObjectId(id);
  const objectIdText = objectId.toString();
  const session = startSession();

  try {
    let deleteResult = { deletedCount: 0 };
    let deletedCandidateCustomId = "";

    await session.withTransaction(async () => {
      const candidateDoc = await db
        .collection("Candidate")
        .findOne({ _id: objectId }, { session });

      if (!candidateDoc) {
        throw new Error("NOT_FOUND");
      }

      const candidateKey = String(candidateDoc.CandidateID || objectIdText).trim();
      deletedCandidateCustomId = String(candidateDoc.CandidateID || "").trim();
      const assignedJobs = normalizeAssignedJobs(candidateDoc);
      const resolvedDriveObjectIds = await resolveDriveObjectIdsByReferences(
        extractDriveReferences(candidateDoc),
      );

      deleteResult = await db
        .collection("Candidate")
        .deleteOne({ _id: objectId }, { session });

      if (deleteResult.deletedCount === 0) {
        throw new Error("NOT_FOUND");
      }

      await syncJobsForCandidate(objectIdText, assignedJobs, [], { session });

      await db.collection("Jobs").updateMany(
        { assignedCandidates: { $in: [objectId, objectIdText, id, candidateKey] } },
        {
          $pull: {
            assignedCandidates: { $in: [objectId, objectIdText, id, candidateKey] },
          },
        },
        { session },
      );

      if (resolvedDriveObjectIds.length > 0) {
        await removeCandidateFromDrives(candidateKey, resolvedDriveObjectIds, {
          session,
        });
        await recalculateDriveCandidateStats(
          resolvedDriveObjectIds.map((value) => String(value)),
          { session },
        );
      } else {
        await db.collection("Drives").updateMany(
          { CandidateIDs: candidateKey },
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
                        candidateKey,
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
          { session },
        );
      }

      await db.collection("Panelist").updateMany(
        {},
        {
          $pull: {
            scheduledRounds: { candidateId: { $in: [id, objectIdText] } },
          },
        },
        { session },
      );
    });

    if (deleteResult.deletedCount > 0 && deletedCandidateCustomId) {
      try {
        await releaseCandidateSequence(deletedCandidateCustomId);
      } catch (releaseError) {
        console.error("Unable to recycle candidate ID:", releaseError);
      }
    }

    return deleteResult;
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return { deletedCount: 0 };
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
