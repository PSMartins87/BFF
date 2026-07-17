const express = require("express");
const { getClient } = require("../config/oidc");
const router = express.Router();

router.get("/login", (req, res) => {
  const client = getClient();
  const authUrl = client.authorizationUrl({ scope: "openid profile email" });
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const client = getClient();
    const params = client.callbackParams(req);

    // Troca o código pelos Tokens
    const tokenSet = await client.callback(
      "http://localhost:3000/api/auth/callback",
      params,
    );

    // MÁGICA AQUI: Salva os tokens no cofre do Redis, atrelado à sessão do usuário!
    req.session.tokenSet = tokenSet;

    res.redirect("http://localhost:5173");
  } catch (err) {
    console.error("Erro no callback do Keycloak:", err);
    res.status(500).send("Falha na autenticação.");
  }
});

router.get("/me", (req, res) => {
  // O React só pergunta: "Minha sessão no Redis tem um token?"
  if (req.session && req.session.tokenSet) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// A ROTA DE LOGOUT OFICIAL
router.get("/logout", async (req, res) => {
  if (req.session.tokenSet) {
    const client = getClient();
    const logoutUrl = client.endSessionUrl({
      id_token_hint: req.session.tokenSet.id_token,
      post_logout_redirect_uri: "http://localhost:5173",
    });

    req.session.destroy(); // Destrói o cofre no Redis
    res.clearCookie("sessionId"); // Apaga o crachá do navegador

    res.redirect(logoutUrl); // Desloga lá no Keycloak também
  } else {
    res.redirect("http://localhost:5173");
  }
});

module.exports = router;
