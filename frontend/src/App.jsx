import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import StockComparator from "./components/StockComparator";

const queryClient = new QueryClient();

// OBRIGATÓRIO: Garante que todos os axios.get enviem os cookies silenciosamente
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Pergunta pro backend se a gente tem um cookie válido
    axios
      .get("http://localhost:3000/api/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        Verificando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1 style={{ color: "white" }}>Bem-vindo ao Sistema</h1>
        {/* O botão não usa React-Router, ele manda o navegador direto pro Node.js */}
        <a
          href="http://localhost:3000/api/auth/login"
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Fazer Login com Segurança
        </a>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: "10px" }}>
        <Dashboard />
        {/* Note que nem passamos mais o 'token' via prop, o Axios cuida de tudo com o cookie! */}
        <StockComparator />
      </div>
    </QueryClientProvider>
  );
}

export default App;
