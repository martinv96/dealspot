import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
	deleteMessage,
	deleteThread,
	getThread,
	listConversations,
	sendMessage
} from "../controllers/message.controller.js";

const router = Router();

router.get("/conversations", authMiddleware, listConversations);
router.get("/threads/:otherUserId", authMiddleware, getThread);
router.delete("/threads/:otherUserId", authMiddleware, deleteThread);
router.delete("/:id", authMiddleware, deleteMessage);
router.post("/", authMiddleware, sendMessage);

export default router;
