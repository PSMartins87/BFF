const createClient = require("./baseClient");

// Recuamos a URL base para permitir a concatenação correta do ponto
const bacenApi = createClient("https://api.bcb.gov.br/dados/serie/");

/**
 * Busca o último valor válido de uma série histórica do Bacen.
 * @param {number} seriesCode Código da série no BCB
 */
const fetchLastValue = async (seriesCode) => {
  // Aplicamos a nova regra do Banco Central: 'bcdata.sgs.{codigo}' (com ponto, sem barra)
  const response = await bacenApi.get(
    `bcdata.sgs.${seriesCode}/dados/ultimos/1`,
    {
      params: { formato: "json" },
    },
  );

  // A API do BCB retorna um array com um objeto: [{ "data": "DD/MM/YYYY", "valor": "10.50" }]
  return response.data[0];
};

module.exports = {
  fetchLastValue,
};
