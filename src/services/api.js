import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const IS_NGROK = API_BASE_URL.includes("ngrok-free.dev") || API_BASE_URL.includes("ngrok.io");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: IS_NGROK
    ? {
        "ngrok-skip-browser-warning": "true"
      }
    : undefined
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dealspot_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;