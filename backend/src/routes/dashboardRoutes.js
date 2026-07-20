const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/rbacMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(authenticate);

router.get(
  "/macro",
  checkRole("investimentos.visitante"),
  cacheMiddleware(300),
  dashboardController.getDashboardData,
);

module.exports = router;
