import React, { useState } from "react";
import axios from "axios"; // Ou importe a sua api.js personalizada

export default function StockComparator({ token }) {
  const [ticker1, setTicker1] = useState("");
  const [ticker2, setTicker2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!ticker1 || !ticker2) {
      setError("Por favor, digite os dois ativos (ex: PETR4 e VALE3)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fazendo a chamada para o seu BFF Node.js
      // A rota exata depende de como está o seu assetRoutes.js no backend
      const response = await axios.get(
        "http://localhost:3000/api/assets/compare",
        {
          params: {
            symbol1: ticker1.toUpperCase(),
            symbol2: ticker2.toUpperCase(),
          },
          headers: {
            Authorization: `Bearer ${token}`, // O seu token do Keycloak vai aqui
          },
        },
      );

      setComparisonData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Erro ao buscar dados das ações. Verifique os códigos e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderTop: "1px solid #333",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: "1rem" }}>
        Comparador de Ações
      </h2>

      {/* Formulário de Busca */}
      <form
        onSubmit={handleCompare}
        style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          placeholder="Ativo 1 (ex: PETR4)"
          value={ticker1}
          onChange={(e) => setTicker1(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #555",
            background: "#222",
            color: "#fff",
          }}
        />
        <span style={{ color: "#888", alignSelf: "center" }}>X</span>
        <input
          type="text"
          placeholder="Ativo 2 (ex: VALE3)"
          value={ticker2}
          onChange={(e) => setTicker2(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #555",
            background: "#222",
            color: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Buscando..." : "Comparar"}
        </button>
      </form>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {/* Resultados do Finnhub e News API */}
      {comparisonData && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Card do Ativo 1 */}
          <div
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "1rem",
              border: "1px solid #444",
              borderRadius: "8px",
              background: "#1a1a1a",
            }}
          >
            <h3 style={{ color: "#60a5fa", margin: "0 0 0.5rem 0" }}>
              {ticker1.toUpperCase()}
            </h3>
            <p style={{ color: "#fff", fontSize: "1.5rem", margin: "0" }}>
              R$ {comparisonData.asset1?.price?.toFixed(2) || "---"}
            </p>
            {/* Aqui você pode mapear as notícias da News API para este ativo */}
            <h4 style={{ color: "#aaa", marginTop: "1rem" }}>
              Últimas Notícias:
            </h4>
            <ul
              style={{ color: "#ccc", fontSize: "0.9rem", paddingLeft: "1rem" }}
            >
              {comparisonData.asset1?.news
                ?.slice(0, 3)
                .map((newsItem, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60a5fa", textDecoration: "none" }}
                    >
                      {newsItem.title}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Card do Ativo 2 */}
          <div
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "1rem",
              border: "1px solid #444",
              borderRadius: "8px",
              background: "#1a1a1a",
            }}
          >
            <h3 style={{ color: "#60a5fa", margin: "0 0 0.5rem 0" }}>
              {ticker2.toUpperCase()}
            </h3>
            <p style={{ color: "#fff", fontSize: "1.5rem", margin: "0" }}>
              R$ {comparisonData.asset2?.price?.toFixed(2) || "---"}
            </p>
            <h4 style={{ color: "#aaa", marginTop: "1rem" }}>
              Últimas Notícias:
            </h4>
            <ul
              style={{ color: "#ccc", fontSize: "0.9rem", paddingLeft: "1rem" }}
            >
              {comparisonData.asset2?.news
                ?.slice(0, 3)
                .map((newsItem, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60a5fa", textDecoration: "none" }}
                    >
                      {newsItem.title}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
