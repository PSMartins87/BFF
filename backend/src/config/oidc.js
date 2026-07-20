const { Issuer, custom } = require("openid-client");
const https = require("https");
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000,
  rejectUnauthorized: false,
});

custom.setHttpOptionsDefaults({
  timeout: 15000,
  retry: 2,
  agent: httpsAgent,
});

let keycloakClient;

async function initKeycloak(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const keycloakIssuer = await Issuer.discover(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      );

      keycloakClient = new keycloakIssuer.Client({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        redirect_uris: ["http://localhost:3000/api/auth/callback"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
      });

      console.log("[OIDC] Cliente do Keycloak inicializado com sucesso.");
      return;
    } catch (error) {
      console.error(
        `[OIDC] Falha na rede ao conectar com o Keycloak (Tentativa ${i + 1} de ${retries}): ${error.message}`,
      );

      if (i === retries - 1) {
        console.error(
          "[OIDC] Falha Crítica: Não foi possível alcançar o Keycloak após várias tentativas.",
        );
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = {
  initKeycloak,
  getClient: () => keycloakClient,
};
