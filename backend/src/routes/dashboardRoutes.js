const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/rbacMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(authenticate);

// Rota protegida pela Client Role 'investimentos.visitor' (ou superior)
// Como esses dados do BCB mudam apenas 1x ao dia, podemos usar um cache generoso de 5 minutos (300s)
router.get(
  "/macro",
  checkRole("investimentos.visitante"),
  cacheMiddleware(300),
  dashboardController.getDashboardData,
);

module.exports = router;
