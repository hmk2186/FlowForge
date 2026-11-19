import api from './api';

export const workflowService = {
  getWorkflows: async (params = {}) => {
    return await api.get('/workflows', { params });
  },

  createWorkflow: async (data) => {
    return await api.post('/workflows', data);
  },

  getWorkflowById: async (id) => {
    return await api.get(`/workflows/${id}`);
  },

  updateWorkflow: async (id, data) => {
    return await api.put(`/workflows/${id}`, data);
  },

  deleteWorkflow: async (id) => {
    return await api.delete(`/workflows/${id}`);
  },

  duplicateWorkflow: async (id) => {
    return await api.post(`/workflows/${id}/duplicate`);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`/workflows/${id}/status`, { status });
  },

  validateWorkflow: async (id, graph = null) => {
    return await api.post(`/workflows/${id}/validate`, graph || {});
  },
};
