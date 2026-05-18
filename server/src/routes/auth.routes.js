import { Router } from "express";
import { register, login, me, updateMe, changePassword, getUserPublicProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import {
	validateBody,
	validateChangePasswordBody,
	validateLoginBody,
	validateRegisterBody,
	validateUpdateProfileBody
} from "../middleware/validation.js";


const router = Router();

router.post("/register", validateBody(validateRegisterBody), register);
router.post("/login", validateBody(validateLoginBody), login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, validateBody(validateUpdateProfileBody), updateMe);
router.put("/me/password", authMiddleware, validateBody(validateChangePasswordBody), changePassword);
router.get("/users/:id", getUserPublicProfile);

export default router;