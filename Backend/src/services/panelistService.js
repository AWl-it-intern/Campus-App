import {
  insertPanelist,
  deletePanelist,
  updatePanelist,
  printPanelists,
} from "../db/index.js";

export async function createPanelist(payload) {
  return insertPanelist(payload);
}

export async function removePanelist(panelistId) {
  return deletePanelist(panelistId);
}

export async function updatePanelistRecord(panelistId, payload) {
  return updatePanelist(panelistId, payload);
}

export async function listPanelists({ limit = 0 } = {}) {
  return printPanelists(limit);
}
