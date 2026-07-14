const createClient = require("./baseClient");

const newsApi = createClient("https://newsapi.org/v2");
const API_KEY = process.env.NEWS_API_KEY;

const getNewsByTicker = async (ticker) => {
  const response = await newsApi.get("/everything", {
    params: {
      q: ticker,
      apiKey: API_KEY,
      language: "pt",
      sortBy: "publishedAt",
      pageSize: 3, // Trazemos apenas as 3 últimas para não pesar o payload
    },
  });

  // Transformação inicial no client para já limpar dados desnecessários da NewsAPI
  return response.data.articles.map((article) => ({
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    source: article.source.name,
  }));
};

module.exports = {
  getNewsByTicker,
};
