const assetService = require("../services/assetService");
const logger = require("../config/logger");

const getMarketData = async (req, res) => {
  try {
    const data = await assetService.getMarketOverview();
    res.json(data);
  } catch (error) {
    logger.error(`Erro ao orquestrar painel de mercado: ${error.message}`);
    res.status(500).json({ message: "Erro ao carregar os dados do mercado." });
  }
};

module.exports = {
  getMarketData,
};
