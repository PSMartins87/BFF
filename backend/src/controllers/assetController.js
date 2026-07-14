const assetService = require("../services/assetService");
const logger = require("../config/logger");

const getAsset = async (req, res) => {
  try {
    const { ticker } = req.params;

    if (!ticker) {
      return res.status(400).json({
        error: "Bad Request",
        message: "O parâmetro ticker é obrigatório.",
      });
    }

    // Chama o nosso Service que já tem a inteligência paralela e circuit breaker
    const assetData = await assetService.getAssetDetails(ticker);

    // Contrato de resposta padronizado (Envelope Pattern)
    return res.status(200).json({
      success: true,
      data: assetData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      `[AssetController] Erro ao processar ticker ${req.params.ticker}: ${error.message}`,
    );

    // Mapeamento de Erros de Negócio para Status HTTP
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({
        error: "Not Found",
        message: "Ativo não localizado ou sem liquidez no momento.",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Ocorreu um erro interno ao processar a consulta do ativo.",
    });
  }
};

const compareAssets = async (req, res, next) => {
  try {
    const symbolsQuery = req.query.symbols;

    if (!symbolsQuery) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          'O parâmetro de query "symbols" é obrigatório. Ex: ?symbols=PETR4,VALE3',
      });
    }

    // Transforma a string "PETR4, VALE3 " em um array limpo ['PETR4', 'VALE3']
    const tickers = symbolsQuery
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (tickers.length < 2) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Forneça pelo menos 2 ativos para comparação.",
      });
    }

    const comparisonData = await assetService.compareAssets(tickers);

    return res.status(200).json({
      success: true,
      data: {
        comparisons: comparisonData,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        count: tickers.length,
      },
    });
  } catch (error) {
    logger.error(
      `[AssetController] Erro na comparação de ativos: ${error.message}`,
    );
    // Opcionalmente, delegamos para o ErrorHandler global
    next(error);
  }
};

module.exports = {
  getAsset,
  compareAssets,
};
