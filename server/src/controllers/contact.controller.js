
import ContactMessage from '../models/ContactMessage.js';

export const createContactMessage = async (req, res) => {
  try {
    const { email, sujet, message, categorie, meta } = req.body;
    if (!email || !sujet || !message) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }
    const contact = new ContactMessage({ email, sujet, message, categorie, meta });
    await contact.save();
    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const getAllContactMessages = async (req, res) => {
  // Optionnel : sécuriser (admin only)
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};