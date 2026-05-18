import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  addFavorite,
  listFavorites,
  removeFavorite
} from "../controllers/favorite.controller.js";

const router = Router();

router.get("/", authMiddleware, listFavorites);
router.post("/", authMiddleware, addFavorite);
router.delete("/:annonceId", authMiddleware, removeFavorite);

export default router;
