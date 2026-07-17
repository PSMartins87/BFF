import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  // OBRIGATÓRIO NA NOVA ARQUITETURA:
  // Diz ao navegador para anexar o cookie HttpOnly em toda requisição feita para o backend
  withCredentials: true,
});

// A REDE DE SEGURANÇA (Opcional, mas altamente recomendada):
// Se o usuário ficar horas fora da tela e o cookie expirar lá no Backend,
// o Node.js vai devolver um erro 401. Esse interceptor pega o erro e manda pro Login automático.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn(
        "Sessão expirada. Redirecionando para autenticação segura...",
      );
      window.location.href = "http://localhost:3000/api/auth/login";
    }
    return Promise.reject(error);
  },
);

export default api;
