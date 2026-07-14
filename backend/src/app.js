require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const rateLimit = require("express-rate-limit");

// Importações Locais
const logger = require("./config/logger");
const swaggerDocument = require("./swagger/swaggerDocument");
const errorHandler = require("./middlewares/errorHandler");

// Importações de Rotas
const dashboardRoutes = require("./routes/dashboardRoutes");
const assetRoutes = require("./routes/assetRoutes");

const app = express();

// ==========================================
// 1. DETECTOR (A prova de fogo)
// ==========================================
app.use((req, res, next) => {
  console.log(
    `\n[DETECTOR] O React chamou o nosso código: ${req.method} ${req.url}`,
  );
  next();
});

// ==========================================
// 2. CORS OFICIAL
// ==========================================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ==========================================
// 3. SEGURANÇA E PARSERS
// ==========================================
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", apiLimiter);

// ==========================================
// 4. ROTAS
// ==========================================
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);

// ==========================================
// 5. TRATAMENTO DE ERROS
// ==========================================
app.use(errorHandler);

module.exports = app;
