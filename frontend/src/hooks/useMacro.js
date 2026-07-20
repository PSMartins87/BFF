import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchMacroEconomics = async () => {
  const response = await api.get("/dashboard/macro");
  return response.data.data;
};

export const useMacroEconomics = () => {
  return useQuery({
    queryKey: ["macroEconomics"],
    queryFn: fetchMacroEconomics,
    staleTime: 1000 * 60 * 5,
  });
};
