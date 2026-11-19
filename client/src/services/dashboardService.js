import api from './api';

export const dashboardService = {
  getStats: async () => {
    return await api.get('/dashboard/stats');
  },

  getActivity: async () => {
    return await api.get('/dashboard/activity');
  },

  getCharts: async () => {
    return await api.get('/dashboard/charts');
  },
};
