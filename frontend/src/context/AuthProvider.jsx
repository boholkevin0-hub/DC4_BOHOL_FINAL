import { useEffect, useState } from "react";
import api from "../api";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    async function loadUser() {
      if (!localStorage.getItem("token")) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/user");
        if (active) setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setAuthError("Your session expired. Please sign in again.");
        } else {
          setAuthError("Unable to verify your session. Check the API connection and sign in again.");
        }
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  async function authenticate(path, credentials) {
    const { data } = await api.post(path, credentials);
    localStorage.setItem("token", data.token);
    setAuthError("");
    setUser(data.user);
  }

  async function login(credentials) {
    await authenticate("/login", credentials);
  }

  async function register(credentials) {
    await authenticate("/register", credentials);
  }

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      setAuthError("");
      setUser(null);
    }
  }

  const value = { user, loading, authError, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
