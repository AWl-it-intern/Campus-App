import {
  insertPanelist,
  deletePanelist,
  updatePanelist,
  printPanelists,
} from "../../db.js";

/* ---------Insert Panelist --------- */
export async function insertPanelistHandler(req, res) {
  try {
    const result = await insertPanelist(req.body);
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

/* -------- Delete Panelist --------- */
export async function deletePanelistHandler(req, res) {
  try {
    const result = await deletePanelist(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Panelist not found",
      });
    }
    res.json({
      success: true,
      message: "Panelist deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Update Panelist --------- */
export async function updatePanelistHandler(req, res) {
  try {
    const result = await updatePanelist(req.params.id, req.body);
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Panelist not found or no changes made",
      });
    }
    res.json({
      success: true,
      message: "Panelist updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/* -------- Print Panelists API -------- */
export async function printPanelistsHandler(req, res) {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : 0;
    const data = await printPanelists(limit);

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
