// src/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes      from "./routes/authRoutes.js";
import foodRoutes      from "./routes/foodRoutes.js";
import orderRoutes     from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import categoryRoutes  from "./routes/categoryRoutes.js";
import staffRoutes     from "./routes/staffRoutes.js";
import publicRoutes    from "./routes/publicRoutes.js";
import shiftRoutes     from "./routes/shiftRoutes.js";
import tablesRoutes from "./routes/tablesRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const publicPath = path.join(__dirname, "..", "public");

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: "https://amiable-success-production-639e.up.railway.app",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (before routes so assets resolve fast) ──────
app.use(express.static(publicPath));

// ── API routes ────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Restaurant API Running" });
});

app.use("/api/tables", tablesRoutes);
app.use("/api/public",     publicRoutes);
app.use("/api/shifts",     shiftRoutes);
app.use("/api/auth",       authRoutes);
app.use("/api/foods",      foodRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/staff",      staffRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Khan Restaurant API ✅" });
});

// ── Unknown API routes → 404 ──────────────────────────────────
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ── Frontend catch-all (SPA) ──────────────────────────────────
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────
// ✅ Already correct if you have this:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));