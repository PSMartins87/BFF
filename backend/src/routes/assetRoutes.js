const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/rbacMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const assetController = require("../controllers/assetController");

const router = express.Router();

router.use(authenticate);

router.get(
  "/market",
  checkRole("investimentos.investidor"),
  cacheMiddleware(60),
  assetController.getMarketData,
);

module.exports = router;
