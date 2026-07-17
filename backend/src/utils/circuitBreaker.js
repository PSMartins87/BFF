const CircuitBreaker = require("opossum");
const logger = require("../config/logger");

const createBreaker = (
  asyncFunction,
  fallbackValue,
  serviceName = "Serviço Externo",
) => {
  const options = {
    timeout: 3000, // Tempo máximo de espera: 3 segundos
    errorThresholdPercentage: 50, // Abre o circuito se 50% das requisições falharem
    resetTimeout: 30000, // Aguarda 30 segundos antes de tentar (Meio-Aberto)
  };

  const breaker = new CircuitBreaker(asyncFunction, options);

  // Se falhar, retorna o valor padrão em vez de quebrar a requisição
  breaker.fallback((ticker, error) => {
    logger.warn(
      `Fallback acionado para ${serviceName} (Ativo: ${ticker}). Motivo: ${error.message}`,
    );
    return fallbackValue;
  });

  // Observabilidade (Logs de estado do circuito)
  breaker.on("open", () =>
    logger.error(
      `[CIRCUIT BREAKER] ABERTO para ${serviceName}. Requisições suspensas.`,
    ),
  );
  breaker.on("halfOpen", () =>
    logger.info(
      `[CIRCUIT BREAKER] MEIO-ABERTO para ${serviceName}. Testando estabilidade...`,
    ),
  );
  breaker.on("close", () =>
    logger.info(
      `[CIRCUIT BREAKER] FECHADO para ${serviceName}. Operação normalizada.`,
    ),
  );

  return breaker;
};

module.exports = createBreaker;
