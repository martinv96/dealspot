import { Router } from "express";
import {
	register,
	login,
	me,
	updateMe,
	changePassword,
	getUserPublicProfile,
	getMyHistory,
	verifyEmail,
	forgotPassword,
	resetPassword
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import {
	validateBody,
	validateChangePasswordBody,
	validateForgotPasswordBody,
	validateLoginBody,
	validateRegisterBody,
	validateResetPasswordBody,
	validateUpdateProfileBody
} from "../middleware/validation.js";


const router = Router();

router.post("/register", validateBody(validateRegisterBody), register);
router.post("/login", validateBody(validateLoginBody), login);
router.get("/verify", verifyEmail);
router.post("/forgot-password", validateBody(validateForgotPasswordBody), forgotPassword);
router.post("/reset-password", validateBody(validateResetPasswordBody), resetPassword);
router.get("/me", authMiddleware, me);
router.get("/me/history", authMiddleware, getMyHistory);
router.put("/me", authMiddleware, validateBody(validateUpdateProfileBody), updateMe);
router.put("/me/password", authMiddleware, validateBody(validateChangePasswordBody), changePassword);
router.get("/users/:id", getUserPublicProfile);

export default router;