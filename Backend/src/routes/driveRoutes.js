import { Router } from "express";
import {
  insertDriveHandler,
  getDriveByIdHandler,
  deleteDriveHandler,
  printDrivesHandler,
  updateDriveHandler,
} from "../controllers/driveController.js";

const router = Router();

router.post("/drive", insertDriveHandler);
router.get("/drive/:id", getDriveByIdHandler);
router.delete("/drive/:id", deleteDriveHandler);
router.put("/drive/:id", updateDriveHandler);
router.get("/print-drives", printDrivesHandler);
// router.patch("/drive/:id/NumberOfCandidates", updateDriveHandler); // For updating drive status only 

export default router;
