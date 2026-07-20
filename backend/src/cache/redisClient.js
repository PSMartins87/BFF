const { createClient } = require("redis");
const logger = require("../config/logger");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => logger.error(`[REDIS ERROR] ${err.message}`));
redisClient.on("connect", () =>
  logger.info("[REDIS] Cliente conectado com sucesso."),
);
redisClient.on("reconnecting", () =>
  logger.warn("[REDIS] Tentando reconectar..."),
);

redisClient
  .connect()
  .catch((err) => logger.error(`Falha ao iniciar Redis: ${err.message}`));

module.exports = redisClient;
