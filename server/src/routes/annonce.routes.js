import express from "express";
import {
	createAnnonce,
	deleteMyAnnonce,
	getAnnonceById,
	listMyAnnonces,
	listPublishedAnnonces,
	updateMyAnnonce
} from "../controllers/annonce.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", listPublishedAnnonces);
router.get("/me", authMiddleware, listMyAnnonces);
router.get("/:id", getAnnonceById);
router.post("/", authMiddleware, upload.array("images", 5), createAnnonce);
router.put("/:id", authMiddleware, upload.array("images", 5), updateMyAnnonce);
router.delete("/:id", authMiddleware, deleteMyAnnonce);

export default router;