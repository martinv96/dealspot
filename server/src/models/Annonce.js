import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Annonce",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      date_publication: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      categorie: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      localisation: {
        type: DataTypes.STRING(255),
        allowNull: false, // Requis selon ta maquette
      },
      statut: {
        type: DataTypes.ENUM("active", "expirée", "brouillon"),
        allowNull: false,
        defaultValue: "active",
      },
      // Stockage des URLs d'images sous forme de tableau JSON
      images: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      // Clé étrangère reliée à l'utilisateur
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "annonce",
      timestamps: false, 
    }
  );
};