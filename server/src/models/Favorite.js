import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Favorite",
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
      annonce_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "annonce",
          key: "id"
        }
      }
    },
    {
      tableName: "favorites",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "annonce_id"]
        }
      ]
    }
  );
};
