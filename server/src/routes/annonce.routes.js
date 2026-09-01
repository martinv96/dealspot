import express from "express";
import {
	createAnnonce,
	deleteMyAnnonce,
	getAnnonceById,
	listMyAnnonces,
	publishAnnonce,
	listPublishedAnnonces,
	updateMyAnnonce
} from "../controllers/annonce.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { validateAnnonceBody, validateBody } from "../middleware/validation.js";

const router = express.Router();

router.patch("/:id/publish", authMiddleware, publishAnnonce);
router.get("/", listPublishedAnnonces);
router.get("/me", authMiddleware, listMyAnnonces);
router.get("/:id", getAnnonceById);
router.post("/", authMiddleware, upload.array("images", 5), validateBody((body) => validateAnnonceBody(body)), createAnnonce);
router.put("/:id", authMiddleware, upload.array("images", 5), validateBody((body) => validateAnnonceBody(body, { partial: true })), updateMyAnnonce);
router.delete("/:id", authMiddleware, deleteMyAnnonce);

export default router;