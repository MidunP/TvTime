import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch {
        // Token expired or invalid — try refresh
        try {
          await authService.refresh();
          const me = await authService.getMe();
          setUser(me);
        } catch {
          localStorage.removeItem('accessToken');
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (username, password) => {
    const userData = await authService.login(username, password);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
