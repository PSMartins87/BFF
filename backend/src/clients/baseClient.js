const axios = require("axios");
const logger = require("../config/logger");

const createClient = (baseURL, defaultTimeout = 5000) => {
  const client = axios.create({
    baseURL,
    timeout: defaultTimeout,
  });

  // Interceptor de Requisição (Registra o início)
  client.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    logger.debug(
      `[${config.method.toUpperCase()}] Requesting ${baseURL}${config.url}`,
    );
    return config;
  });

  // Interceptor de Resposta (Calcula o tempo e loga o sucesso/falha)
  client.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata.startTime;
      logger.info(
        `[${response.config.method.toUpperCase()}] ${baseURL}${response.config.url} - ${response.status} (${duration}ms)`,
      );
      return response;
    },
    (error) => {
      const duration = error.config
        ? Date.now() - error.config.metadata.startTime
        : "unknown";
      const status = error.response ? error.response.status : "NETWORK_ERROR";
      const url = error.config ? `${baseURL}${error.config.url}` : baseURL;

      logger.error(
        `[${error.config?.method.toUpperCase()}] ${url} - Falha: ${status} (${duration}ms) - ${error.message}`,
      );

      // Rejeita a promise padronizando o erro para a camada de Service
      return Promise.reject(error);
    },
  );

  return client;
};

module.exports = createClient;
