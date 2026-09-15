import { createContext, useContext, useEffect, useState } from 'react';
import { checkAuth, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let active = true;
    checkAuth()
      .then((data) => {
        if (!active) return;
        setUser(data.authenticated ? { authenticated: true } : null);
        setAuthError(null);
      })
      .catch((err) => {
        if (!active) return;
        setUser(null);
        setAuthError(err.message || 'Unable to verify session');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setAuthError(null);
  };

  const value = { user, loading, authError, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}