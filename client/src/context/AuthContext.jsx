import { createContext, useState, useEffect, useContext } from "react";
import {
  getCurrentUser as getCurrentUserService,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await getCurrentUserService();
        setUser(response.user ?? null);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  async function login(formData) {
    const response = await loginService(formData);
    const user = response.user;
    setUser(user);

    return response;
  }

  async function register(formData) {
    const response = await registerService(formData);
    const user = response.user;
    setUser(user);

    return response;
  }

  async function logout() {
    setUser(null);
    await logoutService();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
