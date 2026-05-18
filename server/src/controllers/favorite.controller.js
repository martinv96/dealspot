import db from "../models/index.js";

const Favorite = db.Favorite;
const Annonce = db.Annonce;

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function normalizeImages(rawImages) {
  if (Array.isArray(rawImages)) {
    return rawImages
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return normalizeImages(parsed);
    } catch {
      return trimmed ? [trimmed] : [];
    }
  }

  return [];
}

function serializeAnnonce(annonce) {
  if (!annonce) return null;

  const plain = typeof annonce.toJSON === "function" ? annonce.toJSON() : annonce;
  return {
    id: plain.id,
    titre: plain.titre,
    prix: plain.prix,
    localisation: plain.localisation,
    date_publication: plain.date_publication,
    categorie: plain.categorie,
    statut: plain.statut,
    images: normalizeImages(plain.images)
  };
}

export async function listFavorites(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Annonce,
          as: "annonce",
          attributes: [
            "id",
            "titre",
            "prix",
            "localisation",
            "date_publication",
            "categorie",
            "statut",
            "images"
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const annonces = favorites
      .map((fav) => serializeAnnonce(fav.annonce))
      .filter(Boolean);

    return res.json({ favorites: annonces });
  } catch (error) {
    console.error("Erreur listFavorites:", error);
    return res.status(500).json({ message: "Erreur récupération favoris." });
  }
}

export async function addFavorite(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const annonceId = toInt(req.body.annonceId);
    if (!annonceId) {
      return res.status(400).json({ message: "annonceId invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    const [favorite] = await Favorite.findOrCreate({
      where: { user_id: userId, annonce_id: annonceId },
      defaults: { user_id: userId, annonce_id: annonceId }
    });

    return res.status(201).json({
      favorite: serializeAnnonce(annonce),
      favoriteId: favorite.id
    });
  } catch (error) {
    console.error("Erreur addFavorite:", error);
    return res.status(500).json({ message: "Erreur ajout favori." });
  }
}

export async function removeFavorite(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const annonceId = toInt(req.params.annonceId);
    if (!annonceId) {
      return res.status(400).json({ message: "annonceId invalide." });
    }

    await Favorite.destroy({
      where: {
        user_id: userId,
        annonce_id: annonceId
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur removeFavorite:", error);
    return res.status(500).json({ message: "Erreur suppression favori." });
  }
}
