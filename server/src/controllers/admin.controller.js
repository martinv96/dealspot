import { Op, fn, col } from "sequelize";
import db from "../models/index.js";
import { deleteImagesByUrls } from "../services/cloudinary.service.js";

const MAX_LIMIT = 50;

const User = db.User;
const UserSecurity = db.UserSecurity;
const AuthToken = db.AuthToken;
const Annonce = db.Annonce;
const Message = db.Message;
const Report = db.Report;
const Favorite = db.Favorite;

function parseLimit(rawLimit, fallback = 20) {
  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parsePage(rawPage, fallback = 1) {
  const parsed = Number.parseInt(rawPage, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeImages(rawImages) {
  if (Array.isArray(rawImages)) {
    return rawImages.filter((value) => typeof value === "string" && value.trim());
  }

  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((value) => typeof value === "string" && value.trim());
      }
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

function toAnnonceDto(annonce) {
  const raw = typeof annonce?.toJSON === "function" ? annonce.toJSON() : annonce;
  return {
    ...raw,
    images: normalizeImages(raw.images)
  };
}

function toUserDto(user) {
  const raw = typeof user?.toJSON === "function" ? user.toJSON() : user;
  const security = raw.security || null;

  return {
    id: raw.id,
    pseudo: raw.pseudo,
    email: raw.email,
    role: raw.role,
    telephone: raw.telephone,
    localisation: raw.localisation,
    date_inscription: raw.date_inscription,
    email_verified: security?.email_verified ?? false,
    is_blocked: security?.is_blocked ?? false,
    blocked_at: security?.blocked_at || null,
    blocked_reason: security?.blocked_reason || null
  };
}

export async function adminListAnnonces(req, res) {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 20);
    const offset = (page - 1) * limit;
    const where = {};

    const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
    const categorie = typeof req.query.categorie === "string" ? req.query.categorie.trim() : "";
    const statut = typeof req.query.statut === "string" ? req.query.statut.trim() : "";

    if (query) {
      where[Op.or] = [
        { titre: { [Op.like]: "%" + query + "%" } },
        { description: { [Op.like]: "%" + query + "%" } }
      ];
    }

    if (categorie) {
      where.categorie = categorie;
    }

    if (statut) {
      where.statut = statut;
    }

    if (req.query.userId) {
      const userId = Number.parseInt(req.query.userId, 10);
      if (!Number.isNaN(userId)) {
        where.user_id = userId;
      }
    }

    const { rows, count } = await Annonce.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "vendeur",
          attributes: ["id", "pseudo", "email"]
        }
      ],
      order: [["date_publication", "DESC"]],
      limit,
      offset
    });

    return res.json({
      annonces: rows.map(toAnnonceDto),
      page,
      total: count,
      pages: Math.max(1, Math.ceil(count / limit))
    });
  } catch (error) {
    console.error("Erreur adminListAnnonces:", error);
    return res.status(500).json({ message: "Erreur serveur (annonces admin)." });
  }
}

export async function adminUpdateAnnonce(req, res) {
  try {
    const annonceId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(annonceId)) {
      return res.status(400).json({ message: "ID annonce invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    const payload = req.validatedBody || req.body || {};

    if (payload.titre !== undefined) annonce.titre = payload.titre;
    if (payload.description !== undefined) annonce.description = payload.description;
    if (payload.prix !== undefined) annonce.prix = payload.prix;
    if (payload.categorie !== undefined) annonce.categorie = payload.categorie;
    if (payload.localisation !== undefined) annonce.localisation = payload.localisation;
    if (payload.statut !== undefined) annonce.statut = payload.statut;

    await annonce.save();

    return res.json({
      message: "Annonce mise à jour.",
      annonce: toAnnonceDto(annonce)
    });
  } catch (error) {
    console.error("Erreur adminUpdateAnnonce:", error);
    return res.status(500).json({ message: "Erreur serveur (mise à jour annonce)." });
  }
}

export async function adminDeleteAnnonce(req, res) {
  try {
    const annonceId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(annonceId)) {
      return res.status(400).json({ message: "ID annonce invalide." });
    }

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    await deleteImagesByUrls(normalizeImages(annonce.images));
    await annonce.destroy();

    return res.json({ message: "Annonce supprimée." });
  } catch (error) {
    console.error("Erreur adminDeleteAnnonce:", error);
    return res.status(500).json({ message: "Erreur serveur (suppression annonce)." });
  }
}

export async function adminListUsers(req, res) {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = parseLimit(req.query.limit, 20);
    const offset = (page - 1) * limit;
    const where = {};

    const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
    const role = typeof req.query.role === "string" ? req.query.role.trim() : "";
    const blockedOnly = String(req.query.blockedOnly || "false").toLowerCase() === "true";

    if (query) {
      where[Op.or] = [
        { pseudo: { [Op.like]: "%" + query + "%" } },
        { email: { [Op.like]: "%" + query + "%" } }
      ];
    }

    if (role && ["acheteur", "vendeur", "admin"].includes(role)) {
      where.role = role;
    }

    const include = [
      {
        model: UserSecurity,
        as: "security",
        attributes: ["email_verified", "is_blocked", "blocked_at", "blocked_reason"],
        required: blockedOnly,
        ...(blockedOnly ? { where: { is_blocked: true } } : {})
      }
    ];

    const { rows, count } = await User.findAndCountAll({
      where,
      include,
      order: [["date_inscription", "DESC"]],
      limit,
      offset,
      distinct: true
    });

    return res.json({
      users: rows.map(toUserDto),
      page,
      total: count,
      pages: Math.max(1, Math.ceil(count / limit))
    });
  } catch (error) {
    console.error("Erreur adminListUsers:", error);
    return res.status(500).json({ message: "Erreur serveur (users admin)." });
  }
}

export async function adminSetUserBlock(req, res) {
  try {
    const targetId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    if (targetId === req.user.id) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous bloquer vous-même." });
    }

    const blocked = Boolean(req.body?.blocked);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 255) : null;

    const user = await User.findByPk(targetId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const [security] = await UserSecurity.findOrCreate({
      where: { user_id: targetId },
      defaults: {
        user_id: targetId,
        email_verified: true,
        is_blocked: false
      }
    });

    security.is_blocked = blocked;
    security.blocked_at = blocked ? new Date() : null;
    security.blocked_reason = blocked ? reason || "Bloqué par un administrateur" : null;
    await security.save();

    return res.json({
      message: blocked ? "Utilisateur bloqué." : "Utilisateur débloqué.",
      user: {
        id: user.id,
        is_blocked: security.is_blocked,
        blocked_at: security.blocked_at,
        blocked_reason: security.blocked_reason
      }
    });
  } catch (error) {
    console.error("Erreur adminSetUserBlock:", error);
    return res.status(500).json({ message: "Erreur serveur (blocage utilisateur)." });
  }
}

export async function adminDeleteUser(req, res) {
  const transaction = await db.sequelize.transaction();

  try {
    const targetId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) {
      await transaction.rollback();
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    if (targetId === req.user.id) {
      await transaction.rollback();
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte admin." });
    }

    const user = await User.findByPk(targetId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const annonces = await Annonce.findAll({
      where: { user_id: targetId },
      attributes: ["id"],
      transaction,
      raw: true
    });

    const annonceIds = annonces.map((item) => item.id);

    if (annonceIds.length > 0) {
      await Favorite.destroy({ where: { annonce_id: { [Op.in]: annonceIds } }, transaction });
      await Message.destroy({ where: { annonce_id: { [Op.in]: annonceIds } }, transaction });
      await Report.destroy({ where: { annonce_id: { [Op.in]: annonceIds } }, transaction });
      await Annonce.destroy({ where: { id: { [Op.in]: annonceIds } }, transaction });
    }

    await Favorite.destroy({ where: { user_id: targetId }, transaction });
    await Report.destroy({ where: { user_id: targetId }, transaction });
    await Message.destroy({ where: { [Op.or]: [{ sender_id: targetId }, { receiver_id: targetId }] }, transaction });
    await AuthToken.destroy({ where: { user_id: targetId }, transaction });
    await UserSecurity.destroy({ where: { user_id: targetId }, transaction });
    await User.destroy({ where: { id: targetId }, transaction });

    await transaction.commit();
    return res.json({ message: "Utilisateur supprimé." });
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur adminDeleteUser:", error);
    return res.status(500).json({ message: "Erreur serveur (suppression utilisateur)." });
  }
}

function mapGroupedResult(rows, keyField) {
  return rows.reduce((acc, row) => {
    const key = row[keyField];
    acc[key] = Number(row.count || 0);
    return acc;
  }, {});
}

export async function adminStats(req, res) {
  try {
    const [
      usersTotal,
      usersBlocked,
      usersByRoleRows,
      annoncesTotal,
      annoncesByStatusRows,
      annoncesByCategoryRows
    ] = await Promise.all([
      User.count(),
      UserSecurity.count({ where: { is_blocked: true } }),
      User.findAll({
        attributes: ["role", [fn("COUNT", col("id")), "count"]],
        group: ["role"],
        raw: true
      }),
      Annonce.count(),
      Annonce.findAll({
        attributes: ["statut", [fn("COUNT", col("id")), "count"]],
        group: ["statut"],
        raw: true
      }),
      Annonce.findAll({
        attributes: ["categorie", [fn("COUNT", col("id")), "count"]],
        group: ["categorie"],
        order: [[fn("COUNT", col("id")), "DESC"]],
        raw: true
      })
    ]);

    return res.json({
      users: {
        total: usersTotal,
        blocked: usersBlocked,
        byRole: mapGroupedResult(usersByRoleRows, "role")
      },
      annonces: {
        total: annoncesTotal,
        byStatus: mapGroupedResult(annoncesByStatusRows, "statut"),
        byCategory: mapGroupedResult(annoncesByCategoryRows, "categorie")
      }
    });
  } catch (error) {
    console.error("Erreur adminStats:", error);
    return res.status(500).json({ message: "Erreur serveur (stats admin)." });
  }
}
