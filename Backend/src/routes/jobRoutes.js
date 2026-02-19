import { Router } from "express";
import {
  insertJobHandler,
  deleteJobHandler,
  printJobsHandler,
} from "../controllers/jobController.js";

const router = Router();

router.post("/job", insertJobHandler);
router.delete("/job/:id", deleteJobHandler);
router.get("/print-jobs", printJobsHandler);

export default router;
