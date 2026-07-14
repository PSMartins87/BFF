const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/rbacMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const assetController = require("../controllers/assetController");

const router = express.Router();

router.use(authenticate);

// 1. Rota de Comparação (Estática) VEM ANTES
router.get(
  "/compare",
  checkRole("investimentos.investidor"),
  cacheMiddleware(60),
  assetController.compareAssets,
);

// 2. Rota de Consulta Individual (Dinâmica) VEM DEPOIS
router.get(
  "/:ticker",
  checkRole("investimentos.investidor"),
  cacheMiddleware(60),
  assetController.getAsset,
);

module.exports = router;
