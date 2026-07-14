const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(
    `BFF Server rodando na porta ${PORT} no modo ${process.env.NODE_ENV}`,
  );
});


