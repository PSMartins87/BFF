const axios = require("axios");
const http = require("http");
const https = require("https");
const logger = require("../config/logger");

const createClient = (baseURL, defaultTimeout = 5000) => {
  const client = axios.create({
    baseURL,
    timeout: defaultTimeout,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
  });

  client.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    logger.debug(
      `[${config.method.toUpperCase()}] Requesting ${baseURL}${config.url}`,
    );
    return config;
  });

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
      return Promise.reject(error);
    },
  );

  return client;
};

module.exports = createClient;
