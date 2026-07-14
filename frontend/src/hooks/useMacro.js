import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Função que bate no nosso BFF e extrai apenas o payload
const fetchMacroEconomics = async () => {
  const response = await api.get("/dashboard/macro");
  // Nosso BFF sempre retorna { success: true, data: {...}, metadata: {...} }
  return response.data.data;
};

export const useMacroEconomics = () => {
  return useQuery({
    queryKey: ["macroEconomics"], // Chave única para o cache do React Query
    queryFn: fetchMacroEconomics,
    // Opcional de Alta Performance: O React Query não fará requisições de fundo
    // repetidas por 5 minutos, poupando rede, pois sabemos que a Selic não muda toda hora.
    staleTime: 1000 * 60 * 5,
  });
};
