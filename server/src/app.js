import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import annonceRoutes from "./routes/annonce.routes.js";
import "./models/index.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log("API DealSpot démarrée sur le port " + PORT);
    });
  } catch (error) {
    console.error("Erreur démarrage API:", error.message);
    process.exit(1);
  }
}

start();