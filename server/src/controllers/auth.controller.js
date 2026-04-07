import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function userDto(user) {
  return {
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    role: user.role,
    localisation: user.localisation
  };
}

export async function register(req, res) {
  try {
    const { pseudo, email, password, localisation } = req.body;

    if (!pseudo || !email || !password) {
      return res.status(400).json({ message: "Pseudo, email et mot de passe sont requis." });
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
    return res.status(500).json({ message: "Erreur serveur." });
  }
}