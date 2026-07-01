import { Router } from "express";
import {
  adminDeleteAnnonce,
  adminDeleteUser,
  adminListAnnonces,
  adminListUsers,
  adminSetUserBlock,
  adminStats,
  adminUpdateAnnonce
} from "../controllers/admin.controller.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";
import { validateAnnonceBody, validateBody } from "../middleware/validation.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", adminStats);

router.get("/annonces", adminListAnnonces);
router.patch(
  "/annonces/:id",
  validateBody((body) => validateAnnonceBody(body, { partial: true })),
  adminUpdateAnnonce
);
router.delete("/annonces/:id", adminDeleteAnnonce);

router.get("/users", adminListUsers);
router.patch("/users/:id/block", adminSetUserBlock);
router.delete("/users/:id", adminDeleteUser);

export default router;
