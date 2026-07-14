const redisClient = require("../cache/redisClient");
const logger = require("../config/logger");

const cacheMiddleware = (durationSec = 60) => {
  // O middleware agora é 'async'
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      // Tenta buscar do Redis
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        logger.info(
          `[CACHE HIT - REDIS] Retornando dados rápidos para: ${key}`,
        );
        res.setHeader("X-Cache", "HIT");

        // Retorna o JSON parseado
        return res.json(JSON.parse(cachedResponse));
      }

      logger.debug(`[CACHE MISS - REDIS] Buscando na origem: ${key}`);
      const originalSend = res.json;

      res.json = (body) => {
        // Salva no Redis (EX = Expire in Seconds) de forma assíncrona, sem travar a thread
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
      // Degradação Graciosa (Resiliência Corporativa):
      // Se o container do Redis cair, nós não derrubamos o BFF.
      // Apenas logamos o erro e repassamos para o Controller bater na API externa normalmente.
      logger.error(
        `[REDIS ERROR] Falha na consulta de cache para ${key}: ${error.message}`,
      );
      next();
    }
  };
};

module.exports = cacheMiddleware;
