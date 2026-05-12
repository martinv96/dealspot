import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, createReport);

export default router;