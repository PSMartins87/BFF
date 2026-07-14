const dashboardService = require("../services/dashboardService");
const logger = require("../config/logger");

const getDashboardData = async (req, res, next) => {
  try {
    const macroData = await dashboardService.getMacroEconomics();

    return res.status(200).json({
      success: true,
      data: macroData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      `[DashboardController] Erro ao carregar dashboard: ${error.message}`,
    );
    next(error);
  }
};

module.exports = {
  getDashboardData,
};
