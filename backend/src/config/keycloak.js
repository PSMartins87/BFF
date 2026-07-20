const { createRemoteJWKSet } = require("jose");
const logger = require("./logger");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL; // Ex: http://localhost:8080/auth
const REALM = process.env.KEYCLOAK_REALM; // Ex: investment-hub

if (!KEYCLOAK_URL || !REALM) {
  logger.fatal("Configurações do Keycloak ausentes no .env");
  process.exit(1);
}

const jwksUri = new URL(
  `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
);

const jwksClient = createRemoteJWKSet(jwksUri);

module.exports = jwksClient;
