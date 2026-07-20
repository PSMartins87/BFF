const createClient = require("./baseClient");

const finnhubApi = createClient("https://finnhub.io/api/v1");
const API_KEY = process.env.FINNHUB_API_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let queuePromise = Promise.resolve();

const withThrottle = (fn) => {
  const task = queuePromise.then(async () => {
    await sleep(150);
    return fn();
  });
  queuePromise = task.catch(() => {});

  return task;
};

const getQuote = (ticker) => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/quote", {
      params: { symbol: ticker, token: API_KEY },
    });
    return response.data;
  });
};

const getProfile = (ticker) => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/stock/profile2", {
      params: { symbol: ticker, token: API_KEY },
    });
    return response.data;
  });
};

const getTrends = (ticker) => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/stock/recommendation", {
      params: { symbol: ticker, token: API_KEY },
    });
    return response.data;
  });
};

const getMetrics = (ticker) => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/stock/metric", {
      params: { symbol: ticker, metric: "all", token: API_KEY },
    });
    return response.data;
  });
};

const getMarketNews = () => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/news", {
      params: { category: "general", token: API_KEY },
    });
    return response.data;
  });
};

const getMarketStatus = (exchange = "US") => {
  return withThrottle(async () => {
    const response = await finnhubApi.get("/stock/market-status", {
      params: { exchange, token: API_KEY },
    });
    return response.data;
  });
};

module.exports = {
  getQuote,
  getProfile,
  getTrends,
  getMetrics,
  getMarketNews,
  getMarketStatus,
};
