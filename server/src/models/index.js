import { sequelize } from "../config/database.js";
import createUserModel from "./User.js";
import createAnnonceModel from "./Annonce.js"; // On importe le nouveau modèle

const User = createUserModel(sequelize);
const Annonce = createAnnonceModel(sequelize);

// --- Définition des Relations (Associations) ---
// Un utilisateur possède plusieurs annonces
User.hasMany(Annonce, { foreignKey: "user_id", as: "annonces" });
// Une annonce appartient à un seul utilisateur
Annonce.belongsTo(User, { foreignKey: "user_id", as: "vendeur" });

// On exporte tout dans un objet "db" par défaut pour le controller
const db = {
  sequelize,
  User,
  Annonce
};

export default db;