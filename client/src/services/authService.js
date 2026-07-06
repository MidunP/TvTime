import api from './api';
import { mockAuthService } from './mockAuthService';

// Cache backend availability so we don't check on every call
let _backendAvailable = null;
let _checkPromise = null;

async function checkBackend() {
  if (_backendAvailable !== null) return _backendAvailable;
  if (_checkPromise) return _checkPromise;

  _checkPromise = (async () => {
    try {
      const res = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      _backendAvailable = res.ok;
    } catch {
      _backendAvailable = false;
    }
    _checkPromise = null;
    return _backendAvailable;
  })();

  return _checkPromise;
}

// Reset cache (useful if backend comes online later)
export function resetBackendCache() {
  _backendAvailable = null;
}

export const authService = {
  async register(username, password, displayName) {
    const hasBackend = await checkBackend();

    if (hasBackend) {
      try {
        const { data } = await api.post('/auth/register', { username, password, displayName });
        localStorage.setItem('accessToken', data.accessToken);
        return data.user;
      } catch (err) {
        // Backend exists but no register endpoint — fall through to mock
        if (err.response?.status === 404 || err.response?.status === 405) {
          return mockAuthService.register(username, password, displayName);
        }
        throw err;
      }
    }

    // Backend not available — use localStorage mock
    return mockAuthService.register(username, password, displayName);
  },

  async login(username, password) {
    const hasBackend = await checkBackend();

    if (hasBackend) {
      // Try real backend login — also try mock as fallback for users created locally
      try {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('accessToken', data.accessToken);
        return data.user;
      } catch (err) {
        // If 401 (wrong creds), also try mock in case it's a local-only account
        if (err.response?.status === 401 || err.response?.status === 400) {
          try {
            return mockAuthService.login(username, password);
          } catch {
            // Re-throw the original backend error for better error messages
            throw err;
          }
        }
        throw err;
      }
    }

    // Backend not available — use localStorage mock
    return mockAuthService.login(username, password);
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore backend errors on logout
    }
    mockAuthService.logout();
    localStorage.removeItem('accessToken');
    resetBackendCache(); // Re-check backend on next action
  },

  async getMe() {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No token');

    // Mock token — restore from localStorage
    if (token.startsWith('mock_token_')) {
      return mockAuthService.getMe();
    }

    // Real token — call backend
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  async refresh() {
    const token = localStorage.getItem('accessToken');
    if (token?.startsWith('mock_token_')) {
      // Mock sessions never expire
      return token;
    }
    const { data } = await api.post('/auth/refresh');
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  },
};
