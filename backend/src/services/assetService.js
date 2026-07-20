const finnhubClient = require("../clients/finnhubClient");
const logger = require("../config/logger");

const getMarketOverview = async () => {
  logger.info(
    "Iniciando orquestração do panorama de mercado (Market Overview)...",
  );

  const topAtivos = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "NVDA",
    "META",
    "NFLX",
  ];

  const quotesPromises = topAtivos.map(async (symbol) => {
    const [quoteData, metricData] = await Promise.all([
      finnhubClient.getQuote(symbol).catch(() => ({})),
      finnhubClient.getMetrics(symbol).catch(() => ({})),
    ]);

    return {
      symbol: symbol,
      price: quoteData?.c || 0,
      change: quoteData?.dp || 0,
      high52: metricData?.metric?.["52WeekHigh"] || null,
      low52: metricData?.metric?.["52WeekLow"] || null,
      beta: metricData?.metric?.["beta"] || null,
    };
  });

  const exchanges = [
    { code: "US", name: "Nova York (EUA)" },
    { code: "L", name: "Londres (UK)" },
    { code: "T", name: "Tóquio (JP)" },
    { code: "HK", name: "Hong Kong (HK)" },
  ];

  const marketStatusPromises = exchanges.map(async (ex) => {
    try {
      const status = await finnhubClient.getMarketStatus(ex.code);
      return { ...status, displayName: ex.name };
    } catch (err) {
      logger.warn(`Falha ao buscar status da bolsa ${ex.code}: ${err.message}`);
      return {
        isOpen: false,
        session: "Desconhecida",
        displayName: ex.name,
      };
    }
  });

  const [quotesData, newsData, marketStatuses] = await Promise.all([
    Promise.all(quotesPromises),
    finnhubClient.getMarketNews().catch(() => []),
    Promise.all(marketStatusPromises),
  ]);

  return {
    stocks: quotesData,
    news: Array.isArray(newsData) ? newsData.slice(0, 5) : [],
    marketStatuses: marketStatuses,
  };
};

const getAssetDetails = async (ticker) => {
  const upperTicker = ticker.toUpperCase();
  logger.info(`Iniciando orquestração de dados para o ativo: ${upperTicker}`);

  const [quote, profile, trends] = await Promise.all([
    finnhubClient.getQuote(upperTicker).catch((err) => {
      logger.error(`Erro ao buscar cotação de ${upperTicker}: ${err.message}`);
      return {};
    }),
    finnhubClient.getProfile(upperTicker).catch((err) => {
      logger.error(`Erro ao buscar perfil de ${upperTicker}: ${err.message}`);
      return {};
    }),
    finnhubClient.getTrends(upperTicker).catch((err) => {
      logger.error(
        `Erro ao buscar tendências de ${upperTicker}: ${err.message}`,
      );
      return [];
    }),
  ]);

  if (quote.c === undefined || quote.c === null || quote.c === 0) {
    throw new Error(
      `Ativo ${upperTicker} não encontrado ou sem dados de cotação no momento.`,
    );
  }

  const recommendation =
    trends && trends.length > 0
      ? trends[0].strongBuy > trends[0].sell
        ? "STRONG BUY"
        : "HOLD"
      : "N/A";

  return {
    ticker: upperTicker,
    financials: {
      currentPrice: quote.c,
      changePercent: quote.dp,
      highOfDay: quote.h,
      lowOfDay: quote.l,
    },
    company: {
      name: profile.name || upperTicker,
      sector: profile.finnhubIndustry || "Unknown",
      marketCap: profile.marketCapitalization || null,
      currency: profile.currency || "BRL",
    },
    recommendation: recommendation,
    recentNews: [],
  };
};

module.exports = {
  getMarketOverview,
  getAssetDetails,
};
