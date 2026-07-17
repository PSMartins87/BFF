require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swaggerDocument');
// === IMPORTAÇÕES NOVAS PARA A SESSÃO BANCÁRIA ===
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { initKeycloak } = require("./config/oidc");

// === AQUI ESTÁ A CORREÇÃO DO CAMINHO DO SEU REDIS ===
const redisClient = require("./cache/redisClient"); 

// Importações Locais
const logger = require("./config/logger");
const errorHandler = require("./middlewares/errorHandler");

// Importações de Rotas
const dashboardRoutes = require("./routes/dashboardRoutes");
const assetRoutes = require("./routes/assetRoutes");
const authRoutes = require("./routes/authRoutes"); // Não esqueça a rota de auth!

const app = express();

// Inicializa o cliente do Keycloak em background
initKeycloak().catch(console.error);

app.use(cookieParser());

// ==========================================
// CONFIGURAÇÃO DA SESSÃO NO REDIS
// ==========================================
app.use(
  session({
    // Passamos o SEU cliente redisClient aqui
    store: new RedisStore({ client: redisClient }), 
    secret: process.env.SESSION_SECRET || 'uma_chave_super_secreta_para_desenvolvimento',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // O crachá opaco que vai pro navegador
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// ... (Resto do seu código com CORS, Helmet, Rotas, etc) ...
// ==========================================
// 2. CORS OFICIAL
// ==========================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // OBRIGATÓRIO para cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
app.use("/api/auth", authRoutes);
 // Rota para a documentação Swagger
// ==========================================
// 5. TRATAMENTO DE ERROS
// ==========================================
app.use(errorHandler);

module.exports = app;
