import { Sequelize } from "sequelize";
import "./env.js";

const commonOptions = {
  dialect: "mysql",
  logging: false
};

const useSsl = String(process.env.DB_SSL || "false").toLowerCase() === "true";
if (useSsl) {
  commonOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME || "dealspot",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        ...commonOptions,
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306)
      }
    );