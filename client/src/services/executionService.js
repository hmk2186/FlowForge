import api from './api';

export const executionService = {
  executeWorkflow: async (workflowId, initialPayload = {}) => {
    return await api.post(`/workflows/${workflowId}/execute`, { initialPayload });
  },

  getExecutions: async (params = {}) => {
    return await api.get('/executions', { params });
  },

  getExecutionById: async (id) => {
    return await api.get(`/executions/${id}`);
  },

  cancelExecution: async (id) => {
    return await api.post(`/executions/${id}/cancel`);
  },
};
