import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import "./models/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);

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