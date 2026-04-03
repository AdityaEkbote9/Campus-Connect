import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("campus-connect-token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.user);
      } catch (_error) {
        localStorage.removeItem("campus-connect-token");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const loginWithGoogle = async (credential) => {
    const response = await api.post("/auth/google", { credential });
    localStorage.setItem("campus-connect-token", response.token);
    setUser(response.user);
    return response.user;
  };

  const refreshUser = async () => {
    const response = await api.get("/auth/me");
    setUser(response.user);
    return response.user;
  };

  const signOut = async () => {
    try {
      await api.post("/auth/signout", {});
    } catch (_error) {
      // Ignore sign-out failures and clear local state anyway.
    }

    localStorage.removeItem("campus-connect-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginWithGoogle, refreshUser, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
