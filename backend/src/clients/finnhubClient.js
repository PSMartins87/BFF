const createClient = require("./baseClient");

// Instancia o cliente com a URL base do Finnhub
const finnhubApi = createClient("https://finnhub.io/api/v1");

const API_KEY = process.env.FINNHUB_API_KEY;

// Funções específicas que expõem apenas o que o Service precisa saber
const getQuote = async (ticker) => {
  const response = await finnhubApi.get("/quote", {
    params: { symbol: ticker, token: API_KEY },
  });
  return response.data;
};

const getProfile = async (ticker) => {
  const response = await finnhubApi.get("/stock/profile2", {
    params: { symbol: ticker, token: API_KEY },
  });
  return response.data;
};

const getTrends = async (ticker) => {
  const response = await finnhubApi.get("/stock/recommendation", {
    params: { symbol: ticker, token: API_KEY },
  });
  return response.data;
};

module.exports = {
  getQuote,
  getProfile,
  getTrends,
};
