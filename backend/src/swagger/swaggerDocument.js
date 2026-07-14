const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Investment Intelligence Hub - BFF API",
    version: "1.0.0",
    description:
      "Backend for Frontend (BFF) responsável por orquestrar, agregar e formatar dados financeiros e macroeconômicos para o SPA em React.",
    contact: {
      name: "Time de Arquitetura",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de Desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT gerado pelo Keycloak",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "integer", example: 404 },
              type: { type: "string", example: "OperationalError" },
              message: { type: "string", example: "Ativo não localizado." },
            },
          },
          metadata: {
            type: "object",
            properties: {
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/api/assets/compare": {
      get: {
        summary: "Compara múltiplos ativos financeiros",
        description:
          "Consulta cotação e dados de mercado de vários ativos em paralelo. Retorna respostas parciais (fallback) caso um ativo específico falhe.",
        tags: ["Assets"],
        parameters: [
          {
            in: "query",
            name: "symbols",
            required: true,
            schema: { type: "string" },
            description:
              "Lista de tickers separados por vírgula (ex: PETR4.SA,VALE3.SA)",
            example: "PETR4.SA,VALE3.SA",
          },
        ],
        responses: {
          200: {
            description: "Comparação realizada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        comparisons: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              ticker: { type: "string" },
                              price: { type: "number" },
                              variationPercent: { type: "number" },
                              recommendation: { type: "string" },
                              error: {
                                type: "string",
                                description:
                                  "Presente apenas se o ativo falhar",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/schemas/ErrorResponse" },
          401: { description: "Token ausente ou inválido" },
          403: { description: "Permissão (Role) insuficiente" },
        },
      },
    },
    "/api/assets/{ticker}": {
      get: {
        summary: "Obtém dados detalhados de um ativo",
        description:
          "Agrega cotação, perfil da empresa, recomendação e últimas notícias.",
        tags: ["Assets"],
        parameters: [
          {
            in: "path",
            name: "ticker",
            required: true,
            schema: { type: "string" },
            description: "Símbolo do ativo (ex: PETR4.SA)",
            example: "PETR4.SA",
          },
        ],
        responses: {
          200: {
            description: "Dados do ativo agregados com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        ticker: { type: "string", example: "PETR4.SA" },
                        financials: { type: "object" },
                        company: { type: "object" },
                        recommendation: { type: "string" },
                        recentNews: { type: "array" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: "#/components/schemas/ErrorResponse" },
          500: { $ref: "#/components/schemas/ErrorResponse" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
