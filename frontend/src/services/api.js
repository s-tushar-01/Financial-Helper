import axios from "axios";

// ✅ ENV se base URL (Vercel friendly)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= INTERCEPTORS =================

// ✅ Request interceptor (token auto attach)
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

// ✅ Response interceptor (global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.log("Unauthorized ❌ - redirecting to login");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("/login");
    }

    if (status === 500) {
      console.error("Server error 🔥");
    }

    return Promise.reject(error);
  }
);


// ================= AUTH APIs =================
export const authAPI = {
  login: async (username, password) => {
    try {
      // ✅ Form data banana
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      params.append("grant_type", "password"); // 🔥 MOST IMPORTANT

      // ✅ Request with correct headers
      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data?.access_token;

      if (token) {
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      console.error("Login failed ❌", error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/login");
  },
};


// ================= TRANSACTION APIs =================
export const transactionAPI = {
  getAll: async (params) => {
    try {
      const res = await api.get("/transactions", { params });
      return res.data;
    } catch (err) {
      console.error("Fetch transactions failed ❌", err);
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/transactions/${id}`);
      return res.data;
    } catch (err) {
      console.error("Fetch transaction failed ❌", err);
      throw err;
    }
  },

  create: async (data) => {
    try {
      const res = await api.post("/transactions", data);
      return res.data;
    } catch (err) {
      console.error("Create transaction failed ❌", err);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/transactions/${id}`, data);
      return res.data;
    } catch (err) {
      console.error("Update transaction failed ❌", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/transactions/${id}`);
      return res.data;
    } catch (err) {
      console.error("Delete transaction failed ❌", err);
      throw err;
    }
  },
};


// ================= CATEGORY APIs =================
export const categoryAPI = {
  getAll: async () => {
    try {
      const res = await api.get("/categories/");
      return res.data;
    } catch (err) {
      console.error("Fetch categories failed ❌", err);
      throw err;
    }
  },
};


// ================= ANALYTICS APIs =================
export const analyticsAPI = {
  getSummary: async (params) => {
    try {
      const res = await api.get("/analytics/summary", { params });
      return res.data;
    } catch (err) {
      console.error("Fetch analytics failed ❌", err);
      throw err;
    }
  },
};


// ✅ Export instance
export default api;
