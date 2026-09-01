import db from "../models/index.js";
import { Op } from "sequelize";

// ce controller gère les conversations privées entre utilisateurs

const Message = db.Message;
const User = db.User;
const Annonce = db.Annonce;

function toInt(value) {
  // helper commun pour valider les ids issus route/query/body
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function conversationKey(a, b, annonceId) {
  // clé stable pour regrouper une conversation quel que soit le sens sender/receiver
  const x = Math.min(a, b);
  const y = Math.max(a, b);
  return `${x}-${y}-${annonceId || 0}`;
}

export async function listConversations(req, res) {
  try {
    // but: construire la liste des conversations pour la sidebar messages
    // on part des messages bruts puis on agrège par clé de conversation
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
      },
      order: [["created_at", "DESC"]],
      limit: 400
    });

    const latestByConversation = new Map();
    const unreadByConversation = new Map();
    const otherUserIds = new Set();
    const annonceIds = new Set();

    for (const msg of messages) {
      const key = conversationKey(msg.sender_id, msg.receiver_id, msg.annonce_id);
      if (!latestByConversation.has(key)) {
        latestByConversation.set(key, msg);
      }
      if (msg.receiver_id === userId && !msg.lu) {
        unreadByConversation.set(key, (unreadByConversation.get(key) || 0) + 1);
      }
      otherUserIds.add(msg.sender_id === userId ? msg.receiver_id : msg.sender_id);
      if (msg.annonce_id) annonceIds.add(msg.annonce_id);
    }

    const users = await User.findAll({
      where: { id: Array.from(otherUserIds) },
      attributes: ["id", "pseudo", "date_inscription"]
    });

    const annonces = await Annonce.findAll({
      where: { id: Array.from(annonceIds) },
      attributes: ["id", "titre"]
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const annonceMap = new Map(annonces.map((a) => [a.id, a]));

    const conversations = Array.from(latestByConversation.values()).map((msg) => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      return {
        otherUser: userMap.get(otherUserId) || { id: otherUserId, pseudo: "Utilisateur" },
        annonce: msg.annonce_id ? annonceMap.get(msg.annonce_id) || null : null,
        annonceId: msg.annonce_id || null,
        lastMessage: msg.contenu,
        lastDate: msg.created_at,
        unreadCount: unreadByConversation.get(conversationKey(msg.sender_id, msg.receiver_id, msg.annonce_id)) || 0
      };
    });

    conversations.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

    return res.json({ conversations });
  } catch (error) {
    console.error("Erreur listConversations:", error);
    return res.status(500).json({ message: "Erreur récupération conversations." });
  }
}

export async function getThread(req, res) {
  try {
    // but: charger un fil complet entre deux utilisateurs
    // puis marquer comme lus les messages entrants du thread
    const userId = req.user?.id;
    const otherUserId = toInt(req.params.otherUserId);
    const annonceId = toInt(req.query.annonceId);

    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ message: "Destinataire invalide." });
    }

    const where = {
      [Op.or]: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    };

    if (annonceId) {
      where.annonce_id = annonceId;
    }

    const messages = await Message.findAll({
      where,
      order: [["created_at", "ASC"]],
      limit: 500
    });

    await Message.update(
      { lu: true },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          lu: false,
          ...(annonceId ? { annonce_id: annonceId } : {})
        }
      }
    );

    const otherUser = await User.findByPk(otherUserId, {
      attributes: ["id", "pseudo", "date_inscription"]
    });

    let annonce = null;
    if (annonceId) {
      annonce = await Annonce.findByPk(annonceId, {
        attributes: ["id", "titre"]
      });
    }

    return res.json({
      otherUser,
      annonce,
      messages
    });
  } catch (error) {
    console.error("Erreur getThread:", error);
    return res.status(500).json({ message: "Erreur récupération messages." });
  }
}

export async function sendMessage(req, res) {
  try {
    // but: créer un message dans une conversation
    // on vérifie destinataire, contenu et annonce si elle est fournie
    const senderId = req.user?.id;
    const receiverId = toInt(req.body.receiverId);
    const annonceId = toInt(req.body.annonceId);
    const contenu = String(req.body.contenu || "").trim();

    if (!senderId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    if (!receiverId || receiverId === senderId) {
      return res.status(400).json({ message: "Destinataire invalide." });
    }

    if (!annonceId) {
      return res.status(400).json({ message: "Un message ne peut être envoyé que depuis une annonce." });
    }

    if (!contenu) {
      return res.status(400).json({ message: "Le message ne peut pas etre vide." });
    }

    if (contenu.length > 2000) {
      return res.status(400).json({ message: "Le message ne peut pas dépasser 2 000 caractères." });
    }

    const receiver = await User.findByPk(receiverId, { attributes: ["id"] });
    if (!receiver) {
      return res.status(404).json({ message: "Destinataire introuvable." });
    }

    const annonce = await Annonce.findByPk(annonceId, { attributes: ["id"] });
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      annonce_id: annonceId,
      contenu,
      lu: false
    });

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Erreur sendMessage:", error);
    return res.status(500).json({ message: "Impossible d'envoyer ce message pour le moment. Réessayez dans quelques instants." });
  }
}

export async function deleteThread(req, res) {
  try {
    // but: supprimer l'historique d'un fil pour l'utilisateur courant
    // ce endpoint efface les messages du couple users (+ annonce optionnelle)
    const userId = req.user?.id;
    const otherUserId = toInt(req.params.otherUserId);
    const annonceId = toInt(req.query.annonceId);

    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ message: "Conversation invalide." });
    }

    const where = {
      [Op.or]: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ],
      ...(annonceId ? { annonce_id: annonceId } : {})
    };

    const deletedCount = await Message.destroy({ where });
    return res.json({ deletedCount });
  } catch (error) {
    console.error("Erreur deleteThread:", error);
    return res.status(500).json({ message: "Erreur suppression conversation." });
  }
}

export async function deleteMessage(req, res) {
  try {
    // but: supprimer un message unitaire
    // garde-fou: seul l'expéditeur peut supprimer son message
    const userId = req.user?.id;
    const messageId = toInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Token invalide." });
    }

    if (!messageId) {
      return res.status(400).json({ message: "Message invalide." });
    }

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message introuvable." });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ message: "Vous pouvez supprimer uniquement vos propres messages." });
    }

    await message.destroy();
    return res.json({ success: true });
  } catch (error) {
    console.error("Erreur deleteMessage:", error);
    return res.status(500).json({ message: "Erreur suppression message." });
  }
}
