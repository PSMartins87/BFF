const { getClient } = require("../config/oidc");
const { decodeJwt } = require("jose");
const logger = require("../config/logger");

const authenticate = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    if (!req.session || !req.session.tokenSet) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }
    let { tokenSet } = req.session;
    const client = getClient();
    if (Date.now() >= tokenSet.expires_at * 1000) {
      logger.info("Access token expirado. Iniciando Refresh silencioso...");

      try {
        const newTokenSet = await client.refresh(tokenSet.refresh_token);
        req.session.tokenSet = newTokenSet;
        tokenSet = newTokenSet;
        logger.info("Refresh token realizado com sucesso!");
      } catch (refreshErr) {
        const isNetworkError =
          ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED"].includes(
            refreshErr.code,
          ) ||
          (refreshErr.response && refreshErr.response.status >= 500);

        if (isNetworkError) {
          logger.error(
            `[ERRO DE REDE NO REFRESH] Falha temporária de comunicação com o Keycloak: ${refreshErr.message}`,
          );
          return res.status(503).json({
            message:
              "Serviço de autenticação temporariamente instável. Tente novamente.",
          });
        }
        logger.warn(
          `O Refresh Token expirou ou foi invalidado pelo Keycloak: ${refreshErr.message}`,
        );
        req.session.destroy();
        return res.status(401).json({ message: "Sessão totalmente expirada." });
      }
    }
    req.user = decodeJwt(tokenSet.access_token);

    next();
  } catch (error) {
    logger.error(`Erro no middleware de auth: ${error.message}`);
    return res.status(500).json({ message: "Erro interno de autenticação." });
  }
};

module.exports = authenticate;
