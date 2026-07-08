import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import db from "../models/index.js";
import { sendResetPasswordEmail, sendVerificationEmail } from "../services/mail.service.js";

const User = db.User;
const UserSecurity = db.UserSecurity;
const AuthToken = db.AuthToken;
const UserHistory = db.UserHistory;

function isPasswordSecure(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

function userDto(user) {
  const security = user?.security || null;

  return {
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    telephone: user.telephone,
    role: user.role,
    localisation: user.localisation,
    date_inscription: user.date_inscription,
    is_blocked: security?.is_blocked ?? false,
    blocked_reason: security?.blocked_reason || null
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generatePlainToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function ensureUserSecurity(userId, defaults = {}) {
  const [security] = await UserSecurity.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      email_verified: false,
      ...defaults
    }
  });

  return security;
}

async function issueAuthToken(userId, type, expiresInMs) {
  const plainToken = generatePlainToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + expiresInMs);

  await AuthToken.update(
    { used_at: new Date() },
    {
      where: {
        user_id: userId,
        type,
        used_at: null,
        expires_at: { [Op.gt]: new Date() }
      }
    }
  );

  await AuthToken.create({
    user_id: userId,
    type,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  return plainToken;
}

async function findValidAuthToken(plainToken, type) {
  const tokenHash = hashToken(plainToken);
  return AuthToken.findOne({
    where: {
      token_hash: tokenHash,
      type,
      used_at: null,
      expires_at: { [Op.gt]: new Date() }
    }
  });
}

async function findAuthTokenByHash(plainToken, type) {
  const tokenHash = hashToken(plainToken);
  return AuthToken.findOne({
    where: {
      token_hash: tokenHash,
      type
    }
  });
}

async function recordHistory(userId, category, title, subtitle, status = "succès", details = null) {
  await UserHistory.create({
    user_id: userId,
    category,
    title,
    subtitle,
    status,
    details
  });
}

export async function getUserPublicProfile(req, res) {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "pseudo", "date_inscription", "localisation"]
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Erreur getUserPublicProfile:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function getMyHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const limitInput = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitInput) || limitInput <= 0 ? 5 : Math.min(limitInput, 20);
    const comptePageInput = Number.parseInt(req.query.comptePage, 10);
    const annoncesPageInput = Number.parseInt(req.query.annoncesPage, 10);
    const messagesPageInput = Number.parseInt(req.query.messagesPage, 10);
    const signalementsPageInput = Number.parseInt(req.query.signalementsPage, 10);

    const comptePage = Number.isNaN(comptePageInput) || comptePageInput <= 0 ? 1 : comptePageInput;
    const annoncesPage = Number.isNaN(annoncesPageInput) || annoncesPageInput <= 0 ? 1 : annoncesPageInput;
    const messagesPage = Number.isNaN(messagesPageInput) || messagesPageInput <= 0 ? 1 : messagesPageInput;
    const signalementsPage = Number.isNaN(signalementsPageInput) || signalementsPageInput <= 0 ? 1 : signalementsPageInput;

    const user = await User.findByPk(userId, {
      attributes: ["id", "pseudo", "date_inscription"]
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const [security, annoncesResult, messagesResult, reportsResult, historyEntries] = await Promise.all([
      UserSecurity.findOne({
        where: { user_id: userId },
        attributes: ["email_verified_at"]
      }),
      db.Annonce.findAndCountAll({
        where: { user_id: userId },
        attributes: ["id", "titre", "categorie", "localisation", "date_publication", "statut", "description"],
        order: [["date_publication", "DESC"]],
        limit,
        offset: (annoncesPage - 1) * limit
      }),
      db.Message.findAndCountAll({
        where: {
          [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
        },
        include: [
          { model: db.User, as: "sender", attributes: ["id", "pseudo"] },
          { model: db.User, as: "receiver", attributes: ["id", "pseudo"] },
          { model: db.Annonce, as: "annonce", attributes: ["id", "titre"] }
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset: (messagesPage - 1) * limit
      }),
      db.Report.findAndCountAll({
        where: { user_id: userId },
        include: [{ model: db.Annonce, as: "annonce", attributes: ["id", "titre"] }],
        order: [["createdAt", "DESC"]],
        limit,
        offset: (signalementsPage - 1) * limit
      }),
      UserHistory.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        limit: 100
      })
    ]);

    const compte = [
      {
        id: "account-created",
        category: "compte",
        title: "Compte créé",
        subtitle: "Inscription",
        date: user.date_inscription,
        status: "actif",
        statusLabel: "Actif",
        details: `Compte de ${user.pseudo}`
      },
      ...(security?.email_verified_at
        ? [
            {
              id: "email-verified",
              category: "compte",
              title: "Adresse email vérifiée",
              subtitle: "Sécurité du compte",
              date: security.email_verified_at,
              status: "vérifié",
              statusLabel: "Vérifié",
              details: "Adresse email confirmée"
            }
          ]
        : []),
      ...historyEntries.map((entry) => ({
        id: `history-${entry.id}`,
        category: entry.category,
        title: entry.title,
        subtitle: entry.subtitle,
        date: entry.created_at,
        status: entry.status,
        statusLabel: entry.status,
        details: entry.details
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const accountHistory = [
      {
        id: "account-created",
        category: "compte",
        title: "Compte créé",
        subtitle: "Inscription",
        date: user.date_inscription,
        status: "actif",
        statusLabel: "Actif",
        details: `Compte de ${user.pseudo}`
      },
      ...(security?.email_verified_at
        ? [
            {
              id: "email-verified",
              category: "compte",
              title: "Adresse email vérifiée",
              subtitle: "Sécurité du compte",
              date: security.email_verified_at,
              status: "vérifié",
              statusLabel: "Vérifié",
              details: "Adresse email confirmée"
            }
          ]
        : []),
      ...historyEntries.map((entry) => ({
        id: `history-${entry.id}`,
        category: entry.category,
        title: entry.title,
        subtitle: entry.subtitle,
        date: entry.created_at,
        status: entry.status,
        statusLabel: entry.status,
        details: entry.details
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const accountTotal = accountHistory.length;
    const comptePages = Math.max(1, Math.ceil(accountTotal / limit));
    const compteStart = (comptePage - 1) * limit;

    const annoncesHistory = annoncesResult.rows.map((annonce) => ({
      id: `annonce-${annonce.id}`,
      category: "annonces",
      title: annonce.titre,
      subtitle: annonce.localisation ? `${annonce.categorie} · ${annonce.localisation}` : annonce.categorie,
      date: annonce.date_publication,
      status: annonce.statut,
      statusLabel: annonce.statut,
      details: annonce.description
    }));

    const messagesHistory = messagesResult.rows.map((message) => {
      const isSent = message.sender_id === userId;
      const otherUser = isSent ? message.receiver : message.sender;

      return {
        id: `message-${message.id}`,
        category: "messages",
        title: isSent ? `Message envoyé à ${otherUser?.pseudo || "Utilisateur"}` : `Message reçu de ${otherUser?.pseudo || "Utilisateur"}`,
        subtitle: message.annonce?.titre ? `À propos de ${message.annonce.titre}` : "Conversation privée",
        date: message.created_at,
        status: isSent ? "envoyé" : message.lu ? "lu" : "non lu",
        statusLabel: isSent ? "Envoyé" : message.lu ? "Lu" : "Non lu",
        details: message.contenu
      };
    });

    const signalementsHistory = reportsResult.rows.map((report) => ({
      id: `report-${report.id}`,
      category: "signalements",
      title: `Signalement sur ${report.annonce?.titre || "une annonce"}`,
      subtitle: report.motif || "Motif non renseigné",
      date: report.createdAt,
      status: report.statut || "en_attente",
      statusLabel: report.statut || "en_attente",
      details: report.description
    }));

    const paginate = (total) => ({
      page: limit > 0 ? 1 : 1,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit))
    });

    return res.json({
      history: {
        compte: accountHistory.slice(compteStart, compteStart + limit),
        annonces: annoncesHistory,
        messages: messagesHistory,
        signalements: signalementsHistory
      },
      pagination: {
        compte: { page: comptePage, limit, total: accountTotal, pages: comptePages },
        annonces: { page: annoncesPage, limit, total: annoncesResult.count, pages: Math.max(1, Math.ceil(annoncesResult.count / limit)) },
        messages: { page: messagesPage, limit, total: messagesResult.count, pages: Math.max(1, Math.ceil(messagesResult.count / limit)) },
        signalements: { page: signalementsPage, limit, total: reportsResult.count, pages: Math.max(1, Math.ceil(reportsResult.count / limit)) }
      }
    });
  } catch (error) {
    console.error("Erreur getMyHistory:", error);
    return res.status(500).json({ message: "Erreur serveur lors du chargement de l'historique." });
  }
}

export async function register(req, res) {
  try {
    const { pseudo, email, password, localisation, role } = req.validatedBody || req.body;

    if (!isPasswordSecure(password)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&)."
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let finalRole = "acheteur";
    if (role === "vendeur") {
      finalRole = "vendeur";
    }

    const user = await User.create({
      pseudo,
      email,
      mot_de_passe: hashedPassword,
      localisation: localisation || null,
      role: finalRole
    });

    await ensureUserSecurity(user.id, { email_verified: true });

    let verificationEmailAvailable = true;

    try {
      const verifyToken = await issueAuthToken(user.id, "verify_email", 24 * 60 * 60 * 1000);

      const mailResult = await Promise.race([
        sendVerificationEmail({
          email: user.email,
          pseudo: user.pseudo,
          token: verifyToken
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout SMTP")), 4000))
      ]);

      if (mailResult?.sent === false) {
        verificationEmailAvailable = false;
      }

    } catch (mailError) {
      verificationEmailAvailable = false;
      console.error("⚠️ [MAIL ERROR] Échec de l'envoi mais inscription validée :", mailError.message);
    }

    return res.status(201).json({
      message: verificationEmailAvailable
        ? "Compte créé avec succès. Vérifiez votre adresse email pour activer votre compte."
        : "Vérification email indisponible pour le moment. Vous êtes cependant inscrit.",
      user: userDto(user)
    });
  } catch (error) {
    console.error("Erreur register:", error);
    return res.status(500).json({ message: "Erreur serveur à l'inscription." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.validatedBody || req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const security = await UserSecurity.findOne({ where: { user_id: user.id } });
    if (security && !security.email_verified) {
      return res.status(403).json({
        message: "Votre adresse email n'est pas encore vérifiée. Consultez votre boîte mail."
      });
    }

    if (security?.is_blocked) {
      return res.status(403).json({
        message: security.blocked_reason || "Votre compte a été bloqué par un administrateur."
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, pseudo: user.pseudo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: userDto(user)
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ message: "Erreur serveur à la connexion." });
  }
}

export async function verifyEmail(req, res) {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) {
      return res.status(400).json({ message: "Token de vérification manquant." });
    }

    const authToken = await findValidAuthToken(token, "verify_email");
    if (!authToken) {
      const anyToken = await findAuthTokenByHash(token, "verify_email");
      if (anyToken && anyToken.used_at) {
        const security = await UserSecurity.findOne({ where: { user_id: anyToken.user_id } });
        if (security?.email_verified) {
          return res.json({ message: "Adresse email déjà vérifiée." });
        }
      }

      return res.status(400).json({ message: "Lien de vérification invalide ou expiré." });
    }

    const security = await ensureUserSecurity(authToken.user_id, { email_verified: false });
    security.email_verified = true;
    security.email_verified_at = new Date();
    await security.save();
    await recordHistory(authToken.user_id, "compte", "Adresse email vérifiée", "Sécurité du compte", "succès");

    authToken.used_at = new Date();
    await authToken.save();

    return res.json({ message: "Adresse email vérifiée avec succès." });
  } catch (error) {
    console.error("Erreur verifyEmail:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la vérification de l'email." });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.validatedBody || req.body;

    const user = await User.findOne({ where: { email } });
    if (user) {
      try {
        const resetToken = await issueAuthToken(user.id, "reset_password", 60 * 60 * 1000);
        await sendResetPasswordEmail({
          email: user.email,
          pseudo: user.pseudo,
          token: resetToken
        });
      } catch (mailError) {
        console.error("Erreur envoi email reset password:", mailError.message);
      }
    }

    return res.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
    });
  } catch (error) {
    console.error("Erreur forgotPassword:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la demande de réinitialisation." });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.validatedBody || req.body;

    if (!isPasswordSecure(newPassword)) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&)."
      });
    }

    const authToken = await findValidAuthToken(token, "reset_password");
    if (!authToken) {
      return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré." });
    }

    const user = await User.findByPk(authToken.user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    user.mot_de_passe = await bcrypt.hash(newPassword, 10);
    await user.save();
    await recordHistory(user.id, "compte", "Mot de passe réinitialisé", "Sécurité du compte", "succès");

    authToken.used_at = new Date();
    await authToken.save();

    return res.json({ message: "Votre mot de passe a été réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur resetPassword:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la réinitialisation du mot de passe." });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserSecurity,
          as: "security",
          attributes: ["is_blocked", "blocked_reason"]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.security?.is_blocked) {
      return res.status(403).json({
        message: user.security.blocked_reason || "Votre compte a été bloqué par un administrateur."
      });
    }

    return res.json({ user: userDto(user) });
  } catch (error) {
    console.error("Erreur me:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function updateMe(req, res) {
  try {
    const { pseudo, email, telephone, localisation } = req.validatedBody || req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const existing = await User.findOne({ where: { email } });

    if (existing && existing.id !== user.id) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    user.pseudo = pseudo;
    user.email = email;
    user.telephone = telephone || null;
    user.localisation = localisation || null;

    await user.save();
    await recordHistory(
      user.id,
      "compte",
      "Informations de compte mises à jour",
      "Modification du profil",
      "succès",
      {
        pseudo,
        email,
        telephone: telephone || null,
        localisation: localisation || null
      }
    );

    return res.json({
      message: "Profil mis à jour.",
      user: userDto(user)
    });
  } catch (error) {
    console.error("Erreur updateMe:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour du profil." });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.validatedBody || req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (!isPasswordSecure(newPassword)) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@$!%*?&)."
      });
    }

    const valid = await bcrypt.compare(currentPassword, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    user.mot_de_passe = await bcrypt.hash(newPassword, 10);
    await user.save();
    await recordHistory(user.id, "compte", "Mot de passe modifié", "Sécurité du compte", "succès");

    return res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    return res.status(500).json({ message: "Erreur serveur lors du changement de mot de passe." });
  }
}