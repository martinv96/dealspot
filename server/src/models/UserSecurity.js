import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "UserSecurity",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id"
        }
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "user_security",
      timestamps: false
    }
  );
};
