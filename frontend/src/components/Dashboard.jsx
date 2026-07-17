import React from "react";
import { useMacroEconomics } from "../hooks/useMacro";

const Dashboard = () => {
  const { data: macro, isLoading, isError, refetch } = useMacroEconomics();

  if (isLoading) {
    return <div>Carregando indicadores macroeconômicos...</div>;
  }

  if (isError) {
    return (
      <div style={{ color: "red" }}>
        <p>Erro ao carregar o cenário econômico.</p>
        <button onClick={() => refetch()}>Tentar Novamente</button>
      </div>
    );
  }

  const handleLogout = () => {
    // Redireciona para o Backend, que fará a destruição do Cookie e da sessão
    window.location.href = "http://localhost:3000/api/auth/logout";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "white" }}>{macro?.summary || "Cenário Macroeconômico"}</h2>

        {/* Botão de Logout enviando para o Node.js */}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sair da Conta
        </button>
      </header>

      <p style={{ color: "gray", fontSize: "14px" }}>Fonte: {macro?.source}</p>

      {/* Grid simples para os Cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Card title="Taxa SELIC" value={`${macro?.indicators?.selic}%`} />
        <Card title="IPCA (12m)" value={`${macro?.indicators?.ipca}%`} />
        <Card title="Dólar (PTAX)" value={`R$ ${macro?.indicators?.ptax}`} />
      </div>
    </div>
  );
};

// Sub-componente visual (Card)
const Card = ({ title, value }) => (
  <div
    style={{
      padding: "20px",
      border: "1px solid #333", // Ajustado levemente para o modo escuro
      backgroundColor: "#222",
      borderRadius: "8px",
      minWidth: "150px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    }}
  >
    <h4 style={{ margin: "0 0 10px 0", color: "#aaa" }}>{title}</h4>
    <p
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        margin: 0,
        color: "#60a5fa",
      }}
    >
      {value !== "null%" && value !== "R$ null" ? value : "Indisponível"}
    </p>
  </div>
);

export default Dashboard;
