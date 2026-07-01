import express from "express";
import cors from "cors";
import { DataTypes } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import "./config/env.js";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import annonceRoutes from "./routes/annonce.routes.js";
import messageRoutes from "./routes/message.routes.js";
import reportRoutes from "./routes/report.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import "./models/index.js";
import connectMongo from './config/mongo.js';
import contactRoutes from './routes/contact.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");


const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = configuredOrigins.length
  ? configuredOrigins
  : [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_STAGING_URL,
      "http://localhost:5173",
      "http://localhost:5174"
    ].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;

  // Useful for preview URLs during demos/exams.
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/i.test(origin)) return true;

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin non autorisee par CORS."));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, next) => {
  if (!error) {
    next();
    return;
  }

  if (error.name === "MulterError") {
    return res.status(400).json({ message: "Upload invalide: " + error.message });
  }

  if (error.message && error.message.includes("fichiers image")) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Erreur serveur.", error: error.message });
});

const PORT = Number(process.env.PORT) || 4000;

async function ensureUserSecurityAdminColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const tableDefinition = await queryInterface.describeTable("user_security");

  if (!tableDefinition.is_blocked) {
    await queryInterface.addColumn("user_security", "is_blocked", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }

  if (!tableDefinition.blocked_at) {
    await queryInterface.addColumn("user_security", "blocked_at", {
      type: DataTypes.DATE,
      allowNull: true
    });
  }

  if (!tableDefinition.blocked_reason) {
    await queryInterface.addColumn("user_security", "blocked_reason", {
      type: DataTypes.STRING(255),
      allowNull: true
    });
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureUserSecurityAdminColumns();
    await connectMongo();
    app.listen(PORT, () => {
      console.log("API DealSpot démarrée sur le port " + PORT);
    });
  } catch (error) {
    console.error("Erreur démarrage API:", error.message);
    process.exit(1);
  }
}

start();