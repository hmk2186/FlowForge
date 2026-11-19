import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  register: async (name, email, password) => {
    return await api.post('/auth/register', { name, email, password });
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout network errors
    } finally {
      localStorage.removeItem('flowforge_token');
      localStorage.removeItem('flowforge_user');
    }
  },

  getProfile: async () => {
    return await api.get('/users/profile');
  },

  updateProfile: async (name) => {
    return await api.put('/users/profile', { name });
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/users/change-password', { currentPassword, newPassword });
  },
};
