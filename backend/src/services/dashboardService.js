const bacenClient = require("../clients/bacenClient");
const logger = require("../config/logger");

const getMacroEconomics = async () => {
  logger.info("Iniciando busca de indicadores macroeconômicos do Bacen...");

  // Dispara as 3 chamadas simultaneamente para a API do Governo
  const results = await Promise.allSettled([
    bacenClient.fetchLastValue(432), // Índice 0: SELIC
    bacenClient.fetchLastValue(13522), // Índice 1: IPCA (12m)
    bacenClient.fetchLastValue(1), // Índice 2: PTAX
  ]);

  // Função utilitária para extrair o valor ou retornar null caso o serviço do governo falhe
  const extractValue = (promiseResult) => {
    if (promiseResult.status === "fulfilled" && promiseResult.value) {
      return parseFloat(promiseResult.value.valor);
    }
    return null;
  };

  // Montagem do contrato para o Frontend
  return {
    indicators: {
      selic: extractValue(results[0]),
      ipca: extractValue(results[1]),
      ptax: extractValue(results[2]),
    },
    // Exemplo de como agregar uma regra de negócio de apresentação no BFF
    summary: "Cenário Econômico Atualizado",
    source: "Banco Central do Brasil (SGS)",
  };
};

module.exports = {
  getMacroEconomics,
};
