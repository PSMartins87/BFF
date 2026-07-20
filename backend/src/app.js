require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swaggerDocument");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { initKeycloak } = require("./config/oidc");
const redisClient = require("./cache/redisClient");
const logger = require("./config/logger");
const errorHandler = require("./middlewares/errorHandler");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assetRoutes = require("./routes/assetRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
initKeycloak().catch(console.error);
app.use(cookieParser());
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret:
      process.env.SESSION_SECRET ||
      "uma_chave_super_secreta_para_desenvolvimento",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
      },
    },
  }),
);
app.use(express.json());
app.use(pinoHttp({ logger }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 });
app.use("/api", apiLimiter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerDocument));
app.use(errorHandler);

module.exports = app;
