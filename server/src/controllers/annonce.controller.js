import db from "../models/index.js";
import jwt from "jsonwebtoken";
import { Op, col, fn } from "sequelize";
import { deleteImagesByUrls, uploadImages } from "../services/cloudinary.service.js";

// ce controller gère le cycle de vie d'une annonce côté utilisateur
const Annonce = db.Annonce;
const User = db.User;

const MAX_LIMIT = 50;

function parseLimit(rawLimit, fallback = 20) {
  // borne haute côté api pour éviter les requêtes trop lourdes
  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parsePage(rawPage, fallback = 1) {
  // garde une pagination stable même si le front envoie une valeur invalide
  const parsed = Number.parseInt(rawPage, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function sanitizeImages(rawImages) {
  // on garde uniquement des urls valides et on limite à 5 images
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

function normalizeImages(rawImages) {
  // accepte tableau ou string json et retourne toujours un tableau filtré
  if (Array.isArray(rawImages)) {
    return sanitizeImages(rawImages);
  }

  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return sanitizeImages(parsed);
    } catch {
      if (
        trimmed.startsWith("/uploads/") ||
        trimmed.startsWith("uploads/") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
      ) {
        return sanitizeImages([trimmed]);
      }
      return [];
    }
  }

  return [];
}

function serializeAnnonce(annonce) {
  // shape de réponse unique pour toutes les routes annonces
  if (!annonce) {
    return annonce;
  }

  const plainAnnonce = typeof annonce.toJSON === "function" ? annonce.toJSON() : annonce;
  return {
    ...plainAnnonce,
    images: normalizeImages(plainAnnonce.images)
  };
}

async function getUploadedImageUrls(req) {
  // les fichiers envoyés passent par cloudinary avant sauvegarde
  if (!Array.isArray(req.files) || req.files.length === 0) {
    return [];
  }

  return uploadImages(req.files, { folder: "dealspot/annonces" });
}

function getAuthenticatedUserIdFromHeader(req) {
  // permet de laisser voir une annonce expirée uniquement à son propriétaire
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
    // but: créer une annonce avec ou sans images uploadées
    // 1) on lit les champs validés
    // 2) on tente l'upload des fichiers reçus
    // 3) on persiste l'annonce avec un statut par défaut "active"
    const { titre, description, prix, categorie, localisation, statut, images } = req.validatedBody || req.body;

    // l'id vient du middleware auth
    const userId = req.user.id; 

    const uploadedImages = await getUploadedImageUrls(req);

    const nouvelleAnnonce = await Annonce.create({
      titre,
      description,
      prix,
      categorie,
      localisation,
      statut: statut || "active", // sans statut explicite on publie en active
      images: uploadedImages.length > 0 ? uploadedImages : sanitizeImages(images),
      user_id: userId
    });

    res.status(201).json({
      message: "Annonce créée avec succès !",
      annonce: serializeAnnonce(nouvelleAnnonce)
    });
  } catch (error) {
    console.error("Erreur createAnnonce:", error);
    res.status(500).json({ message: "Erreur lors de la création", error: error.message });
  }
};

export const listPublishedAnnonces = async (req, res) => {
  try {
    // but: endpoint public de recherche d'annonces actives
    // on combine pagination + filtres texte/catégorie/ville/prix max
    const limit = parseLimit(req.query.limit, 24);
    const page = parsePage(req.query.page, 1);
    const offset = (page - 1) * limit;
    const where = { statut: "active" };
    const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
    const categorie = typeof req.query.categorie === "string" ? req.query.categorie.trim() : "";
    const ville = typeof req.query.ville === "string" ? req.query.ville.trim() : "";
    const prixMax = Number.parseFloat(req.query.prixMax);

    if (req.query.userId) {
      const userId = Number.parseInt(req.query.userId, 10);
      if (!Number.isNaN(userId)) {
        where.user_id = userId;
      }
    }

    if (query) {
      where[Op.or] = [
        { titre: { [Op.like]: "%" + query + "%" } },
        { description: { [Op.like]: "%" + query + "%" } }
      ];
    }

    if (categorie) {
      where.categorie = categorie;
    }

    if (ville) {
      where.localisation = { [Op.like]: "%" + ville + "%" };
    }

    if (!Number.isNaN(prixMax) && prixMax >= 0) {
      where.prix = { [Op.lte]: prixMax };
    }

    const { rows, count } = await Annonce.findAndCountAll({
      where,
      order: [["date_publication", "DESC"]],
      limit,
      offset
    });

    const pages = Math.max(1, Math.ceil(count / limit));
    res.json({
      annonces: rows.map(serializeAnnonce),
      total: count,
      page,
      pages
    });
  } catch (error) {
    console.error("Erreur listPublishedAnnonces:", error);
    res.status(500).json({ message: "Erreur récupération annonces", error: error.message });
  }
};

export const listMyAnnonces = async (req, res) => {
  try {
    // but: retourner uniquement les annonces du compte connecté
    // le filtre statut reste optionnel pour simplifier le front
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const limit = parseLimit(req.query.limit, 12);
    const page = parsePage(req.query.page, 1);
    const offset = (page - 1) * limit;
    const statut = typeof req.query.statut === "string" ? req.query.statut.trim() : "";
    const where = { user_id: req.user.id };

    if (statut) {
      where.statut = statut;
    }

    const [annonces, statusRows, totalCount] = await Promise.all([
      Annonce.findAll({
      where,
      order: [["date_publication", "DESC"]],
      limit,
      offset
      }),
      Annonce.findAll({
        where: { user_id: req.user.id },
        attributes: ["statut", [fn("COUNT", col("id")), "count"]],
        group: ["statut"],
        raw: true
      }),
      Annonce.count({ where })
    ]);

    const counts = statusRows.reduce(
      (acc, row) => {
        const count = Number(row.count || 0);

        if (row.statut === "expirée" || row.statut === "expiree") {
          return { ...acc, vendues: count };
        }

        if (row.statut === "active") {
          return { ...acc, active: count };
        }

        if (row.statut === "brouillon") {
          return { ...acc, brouillon: count };
        }

        return acc;
      },
      {
        active: 0,
        vendues: 0,
        brouillon: 0
      }
    );

    res.json({
      annonces: annonces.map(serializeAnnonce),
      page,
      total: totalCount,
      pages: Math.max(1, Math.ceil(totalCount / limit)),
      counts
    });
  } catch (error) {
    console.error("Erreur listMyAnnonces:", error);
    res.status(500).json({ message: "Erreur récupération de vos annonces", error: error.message });
  }
};

export const getAnnonceById = async (req, res) => {
  try {
    // but: afficher le détail d'une annonce
    // règle métier: une annonce non active n'est visible que par son propriétaire
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

    return res.json({ annonce: serializeAnnonce(annonce) });
  } catch (error) {
    console.error("Erreur getAnnonceById:", error);
    return res.status(500).json({ message: "Erreur récupération annonce.", error: error.message });
  }
};

export const deleteMyAnnonce = async (req, res) => {
  try {
    // but: suppression propriétaire
    // 1) auth
    // 2) validation id + contrôle ownership
    // 3) nettoyage images puis suppression sql
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

    await deleteImagesByUrls(normalizeImages(annonce.images));
    await annonce.destroy();
    return res.json({ message: "Annonce supprimée avec succès." });
  } catch (error) {
    console.error("Erreur deleteMyAnnonce:", error);
    return res.status(500).json({ message: "Erreur suppression annonce.", error: error.message });
  }
};

export const updateMyAnnonce = async (req, res) => {
  try {
    // but: édition propriétaire d'une annonce avec support images
    // ce flux garde la main au front sur les images à conserver
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
    // existingImages indique ce que le front veut conserver après édition
    const { titre, description, prix, categorie, localisation, statut, existingImages } = req.validatedBody || req.body;
    const newUploadedImages = await getUploadedImageUrls(req);
    const currentImages = normalizeImages(annonce.images);
    // mise à jour des champs texte
    annonce.titre = titre ?? annonce.titre;
    annonce.description = description ?? annonce.description;
    annonce.prix = prix ?? annonce.prix;
    annonce.categorie = categorie ?? annonce.categorie;
    annonce.localisation = localisation ?? annonce.localisation;
    annonce.statut = statut ?? annonce.statut;
    // gestion des images: garder, ajouter, limiter, puis nettoyer les supprimées
    let finalImages = [];
    // 1) on garde seulement les images demandées par le front
    if (existingImages !== undefined) {
      // existingImages peut arriver en json string via formdata
      if (typeof existingImages === "string") {
        try {
          finalImages = normalizeImages(JSON.parse(existingImages));
        } catch {
          finalImages = normalizeImages(existingImages);
        }
      } else {
        finalImages = normalizeImages(existingImages);
      }
    } else {
      // sans instruction du front, on conserve l'état courant
      finalImages = normalizeImages(annonce.images);
    }
    // 2) on ajoute les nouvelles photos uploadées
    if (newUploadedImages.length > 0) {
      finalImages = [...finalImages, ...newUploadedImages];
    }
    // 3) on applique la limite de 5 et on enregistre
    annonce.images = sanitizeImages(finalImages.slice(0, 5));
    // 4) nettoyage cloudinary des images retirées
    const removedImages = currentImages.filter((imageUrl) => !annonce.images.includes(imageUrl));
    await deleteImagesByUrls(removedImages);

    await annonce.save();
    return res.json({ message: "Annonce modifiée avec succès.", annonce: serializeAnnonce(annonce) });
  } catch (error) {
    console.error("Erreur updateMyAnnonce:", error);
    return res.status(500).json({ message: "Erreur modification annonce.", error: error.message });
  }
};