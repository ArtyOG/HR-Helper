import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setAuthError('Your session has expired. Please sign in again.');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

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
    setIsLoggingOut(true);
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout
    }
    navigate('/', { replace: true });
    setUser(null);
    setAuthError(null);
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 500);
  };

  const value = { user, loading, authError, isLoggingOut, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}