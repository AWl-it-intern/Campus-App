import {
  insertDrive,
  getDriveById,
  deleteDrive,
  printDrives,
} from "../../db.js";

/* -------- Insert Drive -------- */
export async function insertDriveHandler(req, res) {
  try {
    const result = await insertDrive(req.body);

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
    const drive = await getDriveById(req.params.id);
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
    const result = await deleteDrive(req.params.id);
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

/* -------- Print Drives API -------- */
export async function printDrivesHandler(req, res) {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : 0;
    const data = await printDrives(limit, true);

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
