import { Router } from "express";
import {
  insertCandidateHandler,
  insertManyCandidatesHandler,
  deleteCandidateHandler,
  printCandidatesHandler,
} from "../controllers/candidateController.js";

const router = Router();

router.post("/candidate", insertCandidateHandler);
router.post("/candidate/bulk", insertManyCandidatesHandler);
router.delete("/candidate/:id", deleteCandidateHandler);
router.get("/print-candidates", printCandidatesHandler);

export default router;
