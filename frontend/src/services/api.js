import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

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
