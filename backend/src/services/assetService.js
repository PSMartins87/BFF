const finnhubClient = require("../clients/finnhubClient");
const newsClient = require("../clients/newsClient");
const createBreaker = require("../utils/circuitBreaker");
const logger = require("../config/logger");

// Protegendo a API de notícias com Circuit Breaker (Fallback: Array vazio)
const newsBreaker = createBreaker(newsClient.getNewsByTicker, [], "NewsAPI");

const getAssetDetails = async (ticker) => {
  const upperTicker = ticker.toUpperCase();
  logger.info(`Iniciando orquestração de dados para o ativo: ${upperTicker}`);

  // Disparamos todas as requisições simultaneamente
  const [quote, profile, trends, news] = await Promise.all([
    // Se a cotação falhar, retornamos um objeto vazio para não quebrar o Promise.all
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

    // O Circuit Breaker já encapsula o catch() internamente
    newsBreaker.fire(upperTicker),
  ]);

  // Se não veio preço atual (c), o ativo provavelmente não existe ou a API primária caiu
  if (quote.c === undefined || quote.c === null || quote.c === 0) {
    throw new Error(
      `Ativo ${upperTicker} não encontrado ou sem dados de cotação no momento.`,
    );
  }

  // Transformação (Mapper): Convertendo os payloads externos para o nosso contrato corporativo
  const recommendation =
    trends && trends.length > 0
      ? trends[0].strongBuy > trends[0].sell
        ? "STRONG BUY"
        : "HOLD"
      : "N/A";

  return {
    ticker: upperTicker,
    financials: {
      currentPrice: quote.c, // Preço atual
      changePercent: quote.dp, // Variação em %
      highOfDay: quote.h, // Máxima do dia
      lowOfDay: quote.l, // Mínima do dia
    },
    company: {
      name: profile.name || upperTicker,
      sector: profile.finnhubIndustry || "Unknown",
      marketCap: profile.marketCapitalization || null,
      currency: profile.currency || "BRL",
    },
    recommendation: recommendation,
    recentNews: news, // Array de notícias (pode vir vazio se o Circuit Breaker abrir)
  };
};

/**
 * Compara múltiplos ativos. Se um ativo falhar, ele retorna um objeto de erro
 * para aquele ativo específico, preservando os demais (Partial Response).
 */
const compareAssets = async (tickers) => {
  logger.info(`Iniciando comparação para os ativos: ${tickers.join(", ")}`);

  // Promise.allSettled executa tudo em paralelo e não quebra se um falhar
  const results = await Promise.allSettled(
    tickers.map((ticker) => getAssetDetails(ticker)),
  );

  // Mapeamos os resultados para o contrato esperado pelo frontend
  const comparisons = results.map((result, index) => {
    if (result.status === "fulfilled") {
      const data = result.value;
      return {
        ticker: data.ticker,
        price: data.financials.currentPrice,
        variationPercent: data.financials.changePercent,
        recommendation: data.recommendation,
        sector: data.company.sector,
        marketCap: data.company.marketCap,
      };
    } else {
      // Falha isolada em um ativo específico
      logger.warn(
        `Falha ao buscar dados para comparação do ativo: ${tickers[index]}. Motivo: ${result.reason.message}`,
      );
      return {
        ticker: tickers[index].toUpperCase(),
        error: "Não foi possível obter dados para este ativo no momento.",
      };
    }
  });

  return comparisons;
};

// Não esqueça de exportar a nova função!
module.exports = {
  getAssetDetails,
  compareAssets,
};
