import {
  createCandidate,
  createManyCandidates,
  removeCandidate,
  listCandidates,
  updateCandidate,
} from "../services/candidateService.js";

/* -------- Insert Candidate -------- */
export async function insertCandidateHandler(req, res) {
  try {
    const result = await createCandidate(req.body);

    // DEV ONLY: print after insert
    await listCandidates({ limit: 5, debug: true });

    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Insert Many Candidates -------- */
export async function insertManyCandidatesHandler(req, res) {
  try {
    const payload = Array.isArray(req.body) ? req.body : req.body?.candidates;
    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Candidates array is required",
      });
    }

    const options = Array.isArray(req.body)
      ? {}
      : {
          defaultDriveId: req.body?.defaultDriveId || req.body?.driveId || req.body?.DriveID,
          defaultJobName: req.body?.defaultJobName || req.body?.jobName,
          forceDriveId: req.body?.forceDriveId || req.body?.forceDriveID,
          forceJobName: req.body?.forceJobName,
        };

    const result = await createManyCandidates(payload, options);
    res.status(201).json({
      success: true,
      insertedCount: result.insertedCount || 0,
      insertedIds: Object.values(result.insertedIds || {}),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Delete Candidate -------- */
export async function deleteCandidateHandler(req, res) {
  try {
    const result = await removeCandidate(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }
    res.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Print Candidates API -------- */
export async function printCandidatesHandler(req, res) {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : 0;
    const job = typeof req.query.job === "string" ? req.query.job : undefined;
    const college = typeof req.query.college === "string" ? req.query.college : undefined;
    const data = await listCandidates({ limit, job, college, debug: true });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}


/* -------- Edit Candidate -------- */ 
export async function editcandidateHandler(req, res) {
  try {
    const candidateId = req.params.id;
    const updateData = req.body;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "Candidate ID is required",
      });
    }

    const result = await updateCandidate(candidateId, updateData);
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    res.json({
      success: true,
      message: "Candidate updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
