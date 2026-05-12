import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      annonce_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "annonce",
          key: "id"
        }
      },
      contenu: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      lu: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: "messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false
    }
  );
};
