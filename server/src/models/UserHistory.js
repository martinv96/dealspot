import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "UserHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      category: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: "succès"
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: "user_history",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [{ fields: ["user_id", "created_at"] }]
    }
  );
};