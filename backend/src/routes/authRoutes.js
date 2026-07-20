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
    const tokenSet = await client.callback(
      "http://localhost:3000/api/auth/callback",
      params,
      { session_state: req.query.session_state },
    );
    req.session.tokenSet = tokenSet;

    req.session.save((err) => {
      if (err) throw new Error("Falha ao gravar sessão no Redis.");
      res.redirect("http://localhost:5173");
    });
  } catch (err) {
    console.error("[AUTH CALLBACK ERRO Crítico]:", err.message);
    req.session.destroy(() => {
      res.clearCookie("sessionId");
      res.redirect("http://localhost:5173/login?error=callback_failed");
    });
  }
});

router.get("/me", (req, res) => {
  if (req.session && req.session.tokenSet) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.get("/logout", async (req, res) => {
  if (req.session && req.session.tokenSet) {
    const client = getClient();
    const logoutUrl = client.endSessionUrl({
      id_token_hint: req.session.tokenSet.id_token,
      post_logout_redirect_uri: "http://localhost:5173",
    });

    req.session.destroy();
    res.clearCookie("sessionId");
    res.redirect(logoutUrl);
  } else {
    res.redirect("http://localhost:5173");
  }
});

module.exports = router;
