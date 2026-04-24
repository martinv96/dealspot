import db from "../models/index.js";
import jwt from "jsonwebtoken";
const Annonce = db.Annonce;
const User = db.User;

const MAX_LIMIT = 50;

function parseLimit(rawLimit, fallback = 20) {
  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function sanitizeImages(rawImages) {
  if (!Array.isArray(rawImages)) {
    return [];
  }

  return rawImages
    .filter((imageValue) => typeof imageValue === "string")
    .map((imageValue) => imageValue.trim())
    .filter((imageValue) => imageValue.length > 0 && imageValue.length <= 255)
    .filter((imageValue) => !imageValue.startsWith("data:"))
    .slice(0, 5);
}

function getUploadedImageUrls(req) {
  if (!Array.isArray(req.files) || req.files.length === 0) {
    return [];
  }

  return req.files.map((file) => "/uploads/" + file.filename).slice(0, 5);
}

function getAuthenticatedUserIdFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.id || payload.userId || null;
  } catch {
    return null;
  }
}

export const createAnnonce = async (req, res) => {
  try {
    // On récupère les données envoyées par le front
    const { titre, description, prix, categorie, localisation, statut, images } = req.body;

    // L'id de l'utilisateur viendra normalement du middleware auth (req.user.id)
    const userId = req.user.id; 

    const uploadedImages = getUploadedImageUrls(req);

    const nouvelleAnnonce = await Annonce.create({
      titre,
      description,
      prix,
      categorie,
      localisation,
      statut: statut || "active", // Si pas de statut, on met 'active'
      images: uploadedImages.length > 0 ? uploadedImages : sanitizeImages(images),
      user_id: userId
    });

    res.status(201).json({
      message: "Annonce créée avec succès !",
      annonce: nouvelleAnnonce
    });
  } catch (error) {
    console.error("Erreur createAnnonce:", error);
    res.status(500).json({ message: "Erreur lors de la création", error: error.message });
  }
};

export const listPublishedAnnonces = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 24);

    const annonces = await Annonce.findAll({
      where: { statut: "active" },
      order: [["date_publication", "DESC"]],
      limit
    });

    res.json({ annonces });
  } catch (error) {
    console.error("Erreur listPublishedAnnonces:", error);
    res.status(500).json({ message: "Erreur récupération annonces", error: error.message });
  }
};

export const listMyAnnonces = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const limit = parseLimit(req.query.limit, 50);
    const statut = req.query.statut;
    const where = { user_id: req.user.id };

    if (statut) {
      where.statut = statut;
    }

    const annonces = await Annonce.findAll({
      where,
      order: [["date_publication", "DESC"]],
      limit
    });

    res.json({ annonces });
  } catch (error) {
    console.error("Erreur listMyAnnonces:", error);
    res.status(500).json({ message: "Erreur récupération de vos annonces", error: error.message });
  }
};

export const getAnnonceById = async (req, res) => {
  try {
    const annonceId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(annonceId)) {
      return res.status(400).json({ message: "ID annonce invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId, {
      include: [{ model: User, as: "vendeur", attributes: ["id", "pseudo", "date_inscription"] }]
    });

    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    const requesterId = getAuthenticatedUserIdFromHeader(req);
    const isOwner = requesterId && annonce.user_id === requesterId;
    if (annonce.statut !== "active" && !isOwner) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    return res.json({ annonce });
  } catch (error) {
    console.error("Erreur getAnnonceById:", error);
    return res.status(500).json({ message: "Erreur récupération annonce.", error: error.message });
  }
};

export const deleteMyAnnonce = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const annonceId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(annonceId)) {
      return res.status(400).json({ message: "ID annonce invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    if (annonce.user_id !== req.user.id) {
      return res.status(403).json({ message: "Suppression non autorisée." });
    }

    await annonce.destroy();
    return res.json({ message: "Annonce supprimée avec succès." });
  } catch (error) {
    console.error("Erreur deleteMyAnnonce:", error);
    return res.status(500).json({ message: "Erreur suppression annonce.", error: error.message });
  }
};

export const updateMyAnnonce = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const annonceId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(annonceId)) {
      return res.status(400).json({ message: "ID annonce invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    if (annonce.user_id !== req.user.id) {
      return res.status(403).json({ message: "Modification non autorisée." });
    }

    // On récupère 'existingImages' depuis le body (envoyé par le front)
    const { titre, description, prix, categorie, localisation, statut, existingImages } = req.body;
    const newUploadedImages = getUploadedImageUrls(req);

    // Mise à jour des champs textes
    annonce.titre = titre ?? annonce.titre;
    annonce.description = description ?? annonce.description;
    annonce.prix = prix ?? annonce.prix;
    annonce.categorie = categorie ?? annonce.categorie;
    annonce.localisation = localisation ?? annonce.localisation;
    annonce.statut = statut ?? annonce.statut;

    // GESTION DES IMAGES
    let finalImages = [];

    // 1. On prend les images que le front nous dit de garder
    if (existingImages) {
      // Si existingImages est envoyé via FormData, c'est parfois une string JSON, on la parse
      finalImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
    } else {
      // Si le front n'envoie rien du tout, on garde les images actuelles par défaut
      finalImages = Array.isArray(annonce.images) ? annonce.images : [];
    }

    // 2. On ajoute les nouvelles photos uploadées
    if (newUploadedImages.length > 0) {
      finalImages = [...finalImages, ...newUploadedImages];
    }

    // 3. On applique la limite de 5 et on enregistre
    annonce.images = finalImages.slice(0, 5);

    await annonce.save();
    return res.json({ message: "Annonce modifiée avec succès.", annonce });
  } catch (error) {
    console.error("Erreur updateMyAnnonce:", error);
    return res.status(500).json({ message: "Erreur modification annonce.", error: error.message });
  }
};