import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("sesion");
  if (raw) {
    try {
      const sesion = JSON.parse(raw);
      if (sesion?.token)

        config.headers.Authorization = `Bearer ${sesion.token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data?.message;
    // NestJS puede mandar `message` como string o como array (validaciones): normalizamos.
    const msg = Array.isArray(data) ? data.join(", ") : (data ?? "Error en la petición");
    const status: number | undefined = err.response?.status;
    if (status === 401) {
      const hadSession = !!localStorage.getItem("sesion");
      localStorage.removeItem("sesion");
      if (hadSession) window.location.href = "/login";
    }
    // Conservamos el status HTTP en el Error para que las pantallas puedan reaccionar
    // distinto según el código (ej. 409 conflicto, 400 cancha no disponible).
    const error = new Error(msg) as Error & { status?: number };
    error.status = status;
    return Promise.reject(error);
  },
);

export default api;
