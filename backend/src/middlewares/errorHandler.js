const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
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

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      type: statusCode === 500 ? "InternalServerError" : "OperationalError",
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
