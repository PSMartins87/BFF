const redisClient = require("../cache/redisClient");
const logger = require("../config/logger");

const cacheMiddleware = (durationSec = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        logger.info(
          `[CACHE HIT - REDIS] Retornando dados rápidos para: ${key}`,
        );
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedResponse));
      }

      logger.debug(`[CACHE MISS - REDIS] Buscando na origem: ${key}`);
      const originalSend = res.json;

      res.json = (body) => {
        redisClient
          .set(key, JSON.stringify(body), { EX: durationSec })
          .catch((err) =>
            logger.error(`[REDIS ERROR] Falha ao salvar cache: ${err.message}`),
          );

        res.setHeader("X-Cache", "MISS");
        originalSend.call(res, body);
      };

      next();
    } catch (error) {
      logger.error(
        `[REDIS ERROR] Falha na consulta de cache para ${key}: ${error.message}`,
      );
      next();
    }
  };
};

module.exports = cacheMiddleware;
