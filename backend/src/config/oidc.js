const { Issuer } = require("openid-client");

let keycloakClient;

async function initKeycloak() {
  const keycloakIssuer = await Issuer.discover(
    `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
  );
  keycloakClient = new keycloakIssuer.Client({
    client_id: process.env.KEYCLOAK_CLIENT_ID,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/api/auth/callback"],
    response_types: ["code"],
  });
  console.log("[OIDC] Cliente do Keycloak inicializado.");
}

module.exports = {
  initKeycloak,
  getClient: () => keycloakClient,
};
