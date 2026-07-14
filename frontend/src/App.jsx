import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import keycloak from "./config/keycloak";
import Dashboard from "./components/Dashboard";
import StockComparator from './components/StockComparator'; // A sua importação aqui!

const queryClient = new QueryClient();

const keycloakInitOptions = {
  onLoad: "login-required",
  pkceMethod: "S256",
  checkLoginIframe: false,
  flow: "standard",
};

// Componente Wrapper para gerenciar a tela de Loading da Autenticação
const AppRouter = () => {
  const { initialized, keycloak } = useKeycloak();

  if (!initialized) {
    return (
      <div style={{ padding: "20px", color: "white" }}>Negociando chaves de segurança...</div>
    );
  }

  // Como usamos 'login-required', se passar do initialized, o usuário tem token
  return (
    <div style={{ padding: "10px" }}>
      {/* O Painel Macroeconômico (Bacen) */}
      <Dashboard />
      
      {/* O nosso novo Comparador de Ações recebendo a chave do Keycloak */}
      <StockComparator token={keycloak.token} />
    </div>
  );
};

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitOptions}
    >
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ReactKeycloakProvider>
  );
}

export default App;