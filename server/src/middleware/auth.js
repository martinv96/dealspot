import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.User;

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...payload,
      id: payload.id || payload.userId
    };
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide." });
  }
}

export async function adminMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role"]
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Accès administrateur requis." });
    }

    req.user.role = user.role;
    return next();
  } catch {
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function vendeurMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role"]
    });

    if (!user || !["vendeur", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès vendeur ou administrateur requis pour créer une annonce." });
    }

    req.user.role = user.role;
    return next();
  } catch {
    return res.status(500).json({ message: "Erreur serveur." });
  }
}






