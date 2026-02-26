import { Router } from "express";
import {
  insertCandidateHandler,
  insertManyCandidatesHandler,
  deleteCandidateHandler,
  printCandidatesHandler,
  editcandidateHandler,
} from "../controllers/candidateController.js";

const router = Router();

router.post("/candidate", insertCandidateHandler);
router.post("/candidate/bulk", insertManyCandidatesHandler);
router.delete("/candidate/:id", deleteCandidateHandler);
router.get("/print-candidates", printCandidatesHandler);
router.patch("/candidate/:id", editcandidateHandler);

export default router;
