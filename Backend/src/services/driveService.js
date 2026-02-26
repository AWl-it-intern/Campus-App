import { insertDrive, getDriveById, deleteDrive, printDrives } from "../../db.js";

export async function createDrive(payload) {
  return insertDrive(payload);
}

export async function getDrive(driveId) {
  return getDriveById(driveId);
}

export async function removeDrive(driveId) {
  return deleteDrive(driveId);
}

export async function listDrives({ limit = 0, debug = false } = {}) {
  return printDrives(limit, debug);
}
