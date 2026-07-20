const dashboardService = require("../services/dashboardService");
const bacenClient = require("../clients/bacenClient");

jest.mock("../clients/bacenClient");

describe("Dashboard Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deve agregar SELIC, IPCA e PTAX com sucesso", async () => {
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
    bacenClient.fetchLastValue.mockImplementation(async (code) => {
      if (code === 432) throw new Error("Internal Server Error no Bacen");
      if (code === 13522) return { data: "01/01/2026", valor: "4.50" };
      if (code === 1) return { data: "01/01/2026", valor: "5.20" };
    });

    const result = await dashboardService.getMacroEconomics();

    expect(result.indicators.selic).toBeNull();
    expect(result.indicators.ipca).toBe(4.5);
    expect(result.indicators.ptax).toBe(5.2);
  });
});
