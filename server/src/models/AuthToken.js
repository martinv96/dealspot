import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "AuthToken",
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
      type: {
        type: DataTypes.ENUM("verify_email", "reset_password"),
        allowNull: false
      },
      token_hash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "auth_tokens",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["user_id", "type"] },
        { fields: ["expires_at"] }
      ]
    }
  );
};
