jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");

describe("Security & Authentication Layer", () => {
  it("Deve retornar 401 Unauthorized se nenhum token for fornecido", async () => {
    const response = await request(app).get("/api/dashboard/macro");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });

  it("Deve retornar 401 Unauthorized se um token mal formatado for fornecido", async () => {
    const response = await request(app)
      .get("/api/dashboard/macro")
      .set("Authorization", "Bearer token_invalido_123");

    expect(response.status).toBe(401);
  });
});
