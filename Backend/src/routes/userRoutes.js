import { Router } from "express";
import { insertUsersHandler } from "../controllers/userController.js";

const router = Router();

router.post("/Users", insertUsersHandler);

export default router;
