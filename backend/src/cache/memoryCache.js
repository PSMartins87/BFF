const NodeCache = require("node-cache");

// stdTTL: Tempo de vida padrão de 60 segundos.
// checkperiod: Limpa itens expirados a cada 120 segundos para liberar memória.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
