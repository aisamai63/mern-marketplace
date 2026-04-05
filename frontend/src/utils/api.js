import axios from "axios";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");
const backendOrigin = trimTrailingSlash(
  (import.meta.env.VITE_BACKEND_ORIGIN || "").trim(),
);

const api = axios.create({
  // Keep relative /api calls for local Vite proxy, but support explicit backend origin in production.
  baseURL: backendOrigin || undefined,
});

// Inject the auth token from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (_) {
    // ignore JSON parse errors
  }
  return config;
});

// On 401 redirect to login and clear stale auth data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
