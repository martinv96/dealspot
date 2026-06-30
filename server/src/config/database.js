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

// 1. Priorité absolue : Si Railway fournit l'URL complète avec MYSQL_URL
export const sequelize = process.env.MYSQL_URL
  ? new Sequelize(process.env.MYSQL_URL, commonOptions)
  
  // 2. Option Railway par variables séparées (les 9 variables qu'on a ajoutées)
  : process.env.MYSQLHOST
  ? new Sequelize(
      process.env.MYSQLDATABASE,
      process.env.MYSQLUSER,
      process.env.MYSQLPASSWORD,
      {
        ...commonOptions,
        host: process.env.MYSQLHOST,
        port: Number(process.env.MYSQLPORT || 3306)
      }
    )
    
  // 3. Fallback : Ton environnement de développement local classique
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