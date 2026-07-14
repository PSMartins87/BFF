const { jwtVerify } = require("jose");
const jwksClient = require("../config/keycloak");
const logger = require("../config/logger");

const authenticate = async (req, res, next) => {
  // A TRAVA: Se for uma requisição de preflight (OPTIONS), deixa passar direto.
  // Quem vai cuidar disso é o middleware de CORS.
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    

    // 1. Validação de Presença: Se não tem header ou não começa com Bearer, bloqueia (401)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token ausente ou mal formatado.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Validação Criptográfica: Tenta decodificar usando as chaves do Keycloak
    const { payload } = await jwtVerify(token, jwksClient);

    // 3. Sucesso: Injeta os dados no request e prossegue
    req.user = payload;
    next();
  } catch (error) {
    // 4. Captura Graciosa: Qualquer erro de validação (expirado, inválido, mal formado) vira um 401.
    logger.warn(`Falha na autenticação JWT: ${error.message}`);
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Token inválido ou expirado." });
  }
};

module.exports = authenticate;
