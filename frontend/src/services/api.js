import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const path = config.url || "";
  if (path.includes("/admin/") && !path.includes("/admin/login")) {
    try {
      const raw = localStorage.getItem("elif_admin");
      if (raw) {
        const { email } = JSON.parse(raw);
        if (email) {
          config.headers["X-Admin-Email"] = email;
        }
      }
    } catch {
      // ignore
    }
  }
  return config;
});

export default api;
