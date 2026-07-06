import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { mockAuthService } from '../services/mockAuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from token or mock
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Mock token — restore from localStorage session directly
      if (token.startsWith('mock_token_')) {
        try {
          const me = mockAuthService.getMe();
          setUser(me);
        } catch {
          localStorage.removeItem('accessToken');
        }
        setLoading(false);
        return;
      }

      // Real token — try backend
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch {
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

  const register = useCallback(async (username, password, displayName) => {
    const userData = await authService.register(username, password, displayName);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
