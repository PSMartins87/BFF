const { getClient } = require('../config/oidc');
const { decodeJwt } = require('jose'); // Importamos a função para ler o token
const logger = require("../config/logger");

const authenticate = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    // 1. O cofre do Redis está vazio?
    if (!req.session || !req.session.tokenSet) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    let { tokenSet } = req.session;
    const client = getClient();

    // 2. O access_token está expirado?
    if (Date.now() >= tokenSet.expires_at * 1000) {
      logger.info("Access token expirado. Iniciando Refresh silencioso...");
      
      try {
        const newTokenSet = await client.refresh(tokenSet.refresh_token);
        req.session.tokenSet = newTokenSet;
        tokenSet = newTokenSet; 
        logger.info("Refresh token realizado com sucesso!");
      } catch (refreshErr) {
        logger.warn("O Refresh Token expirou. Forçando novo login.");
        req.session.destroy();
        return res.status(401).json({ message: "Sessão totalmente expirada." });
      }
    }

    // 3. Sucesso! Decodificamos o token e passamos os dados (roles, email, etc) para a rota
    // Não precisamos usar jwtVerify porque a biblioteca openid-client JÁ validou a criptografia na origem.
    req.user = decodeJwt(tokenSet.access_token); 
    
    next();
  } catch (error) {
    logger.error(`Erro no middleware de auth: ${error.message}`);
    return res.status(500).json({ message: "Erro interno de autenticação." });
  }
};

module.exports = authenticate;