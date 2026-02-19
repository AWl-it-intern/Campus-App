import { Router } from "express";
import {
  insertPanelistHandler,
  deletePanelistHandler,
  updatePanelistHandler,
  printPanelistsHandler,
} from "../controllers/panelistController.js";

const router = Router();

router.post("/panelist", insertPanelistHandler);
router.delete("/panelist/:id", deletePanelistHandler);
router.put("/panelist/:id", updatePanelistHandler);
router.get("/print-panelists", printPanelistsHandler);

export default router;
