import api from './api';

export const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('accessToken', data.accessToken);
    return data.user;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  },
};
