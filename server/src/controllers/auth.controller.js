import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const User = db.User;

/**
 * Utilitaire pour valider la force du mot de passe
 */
function isPasswordSecure(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

function userDto(user) {
  return {
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    telephone: user.telephone,
    role: user.role,
    localisation: user.localisation,
    date_inscription: user.date_inscription
  };
}

export async function register(req, res) {
  try {
    const { pseudo, email, password, localisation } = req.body;

    if (!pseudo || !email || !password) {
      return res.status(400).json({ message: "Pseudo, email et mot de passe sont requis." });
    }

    // Validation de la sécurité du mot de passe
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

    const user = await User.create({
      pseudo,
      email,
      mot_de_passe: hashedPassword,
      localisation: localisation || null,
      role: "acheteur"
    });

    return res.status(201).json({
      message: "Compte créé avec succès.",
      user: userDto(user)
    });
  } catch (error) {
    console.error("Erreur register:", error);
    return res.status(500).json({ message: "Erreur serveur à l'inscription." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: "Identifiants invalides." });
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

export async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.json({ user: userDto(user) });
  } catch (error) {
    console.error("Erreur me:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

export async function updateMe(req, res) {
  try {
    const { pseudo, email, telephone, localisation } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (!pseudo || !email) {
      return res.status(400).json({ message: "Pseudo et email sont requis." });
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
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "La confirmation du mot de passe ne correspond pas." });
    }

    // Validation de la sécurité du nouveau mot de passe
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

    return res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    return res.status(500).json({ message: "Erreur serveur lors du changement de mot de passe." });
  }
}