import {
  createDrive,
  getDrive,
  listDrives,
  removeDrive,
  updateDrive,
  // updateNumberOfCandidates, 
} from "../services/driveService.js";

/* -------- Insert Drive -------- */
export async function insertDriveHandler(req, res) {
  try {
    const result = await createDrive(req.body);

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

/* -------- Get Drive By Id -------- */
export async function getDriveByIdHandler(req, res) {
  try {
    const drive = await getDrive(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        error: "Drive not found",
      });
    }

    res.json({
      success: true,
      data: drive,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Delete Drive -------- */
export async function deleteDriveHandler(req, res) {
  try {
    const result = await removeDrive(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Drive not found",
      });
    }

    res.json({
      success: true,
      message: "Drive deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Update Drive -------- */
export async function updateDriveHandler(req, res) {
  try {
    const driveId = req.params.id;
    if (!driveId) {
      return res.status(400).json({
        success: false,
        error: "Drive ID is required",
      });
    }

    const updateData = req.body;
    const result = await updateDrive(driveId, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Drive not found",
      });
    }

    res.json({
      success: true,
      message: "Drive updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
/* -------- Print Drives API -------- */
export async function printDrivesHandler(req, res) {
  try {
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 0;
    const data = await listDrives({ limit, debug: true });

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

// export async function updateNumberOfCandidatesHandler(req, res) {
//   try {
//     const driveId = req.params.id;
//     const { NumberOfCandidates } = req.body;

//     if (NumberOfCandidates === undefined) {
//       return res.status(400).json({
//         success: false,
//         error: "NumberOfCandidates is required",
//       });
//     }

//     const result = await updateNumberOfCandidates(driveId, NumberOfCandidates);

//     if (result.matchedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "Drive not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Number of candidates updated successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// }
