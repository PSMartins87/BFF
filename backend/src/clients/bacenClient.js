const createClient = require("./baseClient");
const bacenApi = createClient("https://api.bcb.gov.br/dados/serie/");

const fetchLastValue = async (seriesCode) => {
  const response = await bacenApi.get(
    `bcdata.sgs.${seriesCode}/dados/ultimos/12`,
    {
      params: { formato: "json" },
    },
  );
  return response.data[0];
};

module.exports = {
  fetchLastValue,
};
