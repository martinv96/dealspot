import { sequelize } from "../config/database.js";
import createUserModel from "./User.js";
import createAnnonceModel from "./Annonce.js";
import createMessageModel from "./Message.js";
import createReportModel from "./Report.js";
import createFavoriteModel from "./Favorite.js";

const User = createUserModel(sequelize);
const Annonce = createAnnonceModel(sequelize);
const Message = createMessageModel(sequelize);
const Report = createReportModel(sequelize);
const Favorite = createFavoriteModel(sequelize);

// --- Définition des Relations (Associations) ---
// Un utilisateur possède plusieurs annonces
User.hasMany(Annonce, { foreignKey: "user_id", as: "annonces" });
// Une annonce appartient à un seul utilisateur
Annonce.belongsTo(User, { foreignKey: "user_id", as: "vendeur" });

// Messages
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiver_id", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });
Annonce.hasMany(Message, { foreignKey: "annonce_id", as: "messages" });
Message.belongsTo(Annonce, { foreignKey: "annonce_id", as: "annonce" });

// report
User.hasMany(Report, { foreignKey: "user_id", as: "reports" });
Annonce.hasMany(Report, { foreignKey: "annonce_id", as: "reports"});
Report.belongsTo(User, {foreignKey: "user_id", as: "reporter"});
Report.belongsTo(Annonce, { foreignKey: "annonce_id", as: "annonce"});

// favorites
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
Annonce.hasMany(Favorite, { foreignKey: "annonce_id", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
Favorite.belongsTo(Annonce, { foreignKey: "annonce_id", as: "annonce" });

// On exporte tout dans un objet "db" par défaut pour le controller
const db = {
  sequelize,
  User,
  Annonce,
  Message,
  Report,
  Favorite
};

export default db;