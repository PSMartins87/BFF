const logger = require("../config/logger");

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.error("Usuário não autenticado tentou acessar rota protegida");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientRoles = req.user.resource_access?.[clientId]?.roles || [];

    if (!clientRoles.includes(requiredRole)) {
      logger.warn(
        `Acesso negado (Forbidden). Usuário tentou acessar sem a Client Role: ${requiredRole}`,
      );

      return res.status(403).json({
        error: "Forbidden",
        message: "Seu perfil não tem permissão para realizar esta operação.",
      });
    }

    next();
  };
};

module.exports = checkRole;
