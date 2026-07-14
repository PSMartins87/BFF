import axios from "axios";
import keycloak from "../config/keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      try {
        // Se o token expirar em menos de 30 segundos, faz o refresh ativo antes de bater na API
        await keycloak.updateToken(30);

        // Injeta o token (novo ou o atual válido) no header
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error("Falha na renovação do token. Sessão expirada.");
        // Se o refresh token também expirou (ex: usuário ficou dias fora), limpa e força o login
        keycloak.clearToken();
        keycloak.login();
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
