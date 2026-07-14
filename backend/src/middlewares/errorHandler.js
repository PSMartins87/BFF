const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  // Se o erro já tem um status definido, usamos. Se não, assumimos 500 (Erro Interno).
  const statusCode = err.statusCode || 500;

  // Log corporativo detalhado (Fica apenas no servidor)
  logger.error(
    {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    },
    "[GlobalErrorHandler] Falha na aplicação",
  );

  // Contrato de resposta para o Frontend (Padronizado e seguro)
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      type: statusCode === 500 ? "InternalServerError" : "OperationalError",
      // Em produção, escondemos o motivo real de erros 500 para não expor a infraestrutura
      message:
        process.env.NODE_ENV === "production" && statusCode === 500
          ? "Ocorreu um erro interno no servidor. Nossa equipe já foi notificada."
          : err.message,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = errorHandler;
