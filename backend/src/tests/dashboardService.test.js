const dashboardService = require("../services/dashboardService");
const bacenClient = require("../clients/bacenClient");

jest.mock("../clients/bacenClient");

describe("Dashboard Service", () => {
  // Limpa os mocks antes de cada teste para evitar poluição
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deve agregar SELIC, IPCA e PTAX com sucesso", async () => {
    // Simulando que a API do Bacen respondeu perfeitamente
    bacenClient.fetchLastValue.mockImplementation(async (code) => {
      if (code === 432) return { data: "01/01/2026", valor: "10.50" };
      if (code === 13522) return { data: "01/01/2026", valor: "4.50" };
      if (code === 1) return { data: "01/01/2026", valor: "5.20" };
    });

    const result = await dashboardService.getMacroEconomics();

    expect(result.indicators.selic).toBe(10.5);
    expect(result.indicators.ipca).toBe(4.5);
    expect(result.indicators.ptax).toBe(5.2);
    expect(result).toHaveProperty("summary");
  });

  it("Deve aplicar Fallback Parcial se um indicador falhar", async () => {
    // Simulando que o IPCA e PTAX funcionaram, mas a SELIC deu erro 500 no Governo
    bacenClient.fetchLastValue.mockImplementation(async (code) => {
      if (code === 432) throw new Error("Internal Server Error no Bacen");
      if (code === 13522) return { data: "01/01/2026", valor: "4.50" };
      if (code === 1) return { data: "01/01/2026", valor: "5.20" };
    });

    const result = await dashboardService.getMacroEconomics();

    // A SELIC deve voltar null (tratamento do erro isolado)
    expect(result.indicators.selic).toBeNull();
    // IPCA e PTAX devem continuar intactos
    expect(result.indicators.ipca).toBe(4.5);
    expect(result.indicators.ptax).toBe(5.2);
  });
});
