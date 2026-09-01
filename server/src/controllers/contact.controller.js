
import ContactMessage from '../models/contactMessage.js';

// ce controller gère la boîte de contact publique côté mongodb

export const createContactMessage = async (req, res) => {
  try {
    // but: créer un message de contact depuis le formulaire public
    // on impose les champs minimum pour éviter les entrées vides
    const { email, sujet, message, categorie, meta } = req.body;
    if (!email || !sujet || !message) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }
    // stockage brut du message pour traitement ultérieur côté admin
    const contact = new ContactMessage({ email, sujet, message, categorie, meta });
    await contact.save();
    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const getAllContactMessages = async (req, res) => {
  // endpoint à protéger en admin dans un prochain passage
  try {
    // but: récupérer la boîte de réception contact pour la modération
    // tri décroissant pour afficher les tickets récents en premier
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};