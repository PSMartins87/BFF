const { createRemoteJWKSet } = require("jose");
const logger = require("./logger");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL; // Ex: http://localhost:8080/auth
const REALM = process.env.KEYCLOAK_REALM; // Ex: investment-hub

if (!KEYCLOAK_URL || !REALM) {
  logger.fatal("Configurações do Keycloak ausentes no .env");
  process.exit(1);
}

// Monta a URL padrão do OpenID Connect onde ficam as chaves públicas
const jwksUri = new URL(
  `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
);

// Cria um cliente que fará o fetch e o cache automático das chaves
const jwksClient = createRemoteJWKSet(jwksUri);

module.exports = jwksClient;
