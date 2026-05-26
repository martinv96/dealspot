import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./auth-context";

function isExpiredJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return true;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  async function refreshUser() {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  }

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("dealspot_token");

      if (!token || isExpiredJwt(token)) {
        localStorage.removeItem("dealspot_token");
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        localStorage.removeItem("dealspot_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  async function register(payload) {
    return api.post("/auth/register", payload);
  }

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("dealspot_token", data.token);
    setUser(data.user);
  }

  async function updateProfile(payload) {
    const { data } = await api.put("/auth/me", payload);
    setUser(data.user);
    return data;
  }

  async function changePassword(payload) {
    const { data } = await api.put("/auth/me/password", payload);
    return data;
  }

  function logout() {
    localStorage.removeItem("dealspot_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      register,
      login,
      logout,
      refreshUser,
      updateProfile,
      changePassword
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}