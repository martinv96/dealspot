import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      pseudo: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("acheteur", "vendeur", "admin"),
        allowNull: false,
        defaultValue: "acheteur"
      },
      date_inscription: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      localisation: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: "users",
      timestamps: false
    }
  );
};