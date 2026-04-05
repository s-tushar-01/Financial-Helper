import axios from "axios";

// ✅ ENV se URL lo (important for Vercel)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://financial-helper-production-6395.up.railway.app";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Request interceptor (token attach karega)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (401 handle karega)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized ❌ - redirecting to login");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ✅ APIs
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post(
      "/auth/login",
      new URLSearchParams({ username, password })
    );

    // 🔥 IMPORTANT: token save karo
    localStorage.setItem("token", response.data.access_token);

    return response;
  },
};

export const transactionAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get("/categories"),
};

export const analyticsAPI = {
  getSummary: (params) => api.get("/analytics/summary", { params }),
};

export default api;
