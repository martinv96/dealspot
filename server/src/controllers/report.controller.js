import db from "../models/index.js";
import { sendAdminReportEmail } from "../services/mail.service.js";

// ce controller gère le signalement d'annonces par les utilisateurs

export async function createReport(req, res) {
  try {
      // but: créer un signalement d'annonce avec garde-fous anti-abus
      // on vérifie annonce existante, anti auto-signalement et anti doublon
    const userId = req.user.id;
    const { annonce_id, motif, description } = req.body;

    if (!annonce_id || !motif) {
      return res.status(400).json({ message: "annonce_id et motif sont requis." });
    }

    const annonce = await db.Annonce.findByPk(annonce_id);
    if (!annonce) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    if (annonce.user_id === userId) {
      return res.status(403).json({ message: "Vous ne pouvez pas signaler votre propre annonce." });
    }

    const alreadyReported = await db.Report.findOne({
      where: { user_id: userId, annonce_id }
    });
    // on bloque les doublons pour éviter le spam de signalements
    if (alreadyReported) {
      return res.status(409).json({ message: "Vous avez déjà signalé cette annonce." });
    }

    const report = await db.Report.create({ user_id: userId, annonce_id, motif, description });

      // on récupère le reporter pour enrichir le mail admin
    const reporter = await db.User.findByPk(userId, {
      attributes: ["id", "pseudo", "email"]
    });

    try {
      // l'email admin est best effort, le signalement reste valide même sans mail
      const mailResult = await sendAdminReportEmail({ report, annonce, reporter });
      if (mailResult?.sent) {
        console.log("[MAIL] Email signalement envoye:", mailResult.messageId);
      }
    } catch (mailError) {
      console.error("[MAIL] Echec envoi email signalement:", mailError.message);
    }

    return res.status(201).json({ message: "Signalement envoyé. Merci." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
}