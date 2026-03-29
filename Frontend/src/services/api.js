import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finchat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finchat_token');
      localStorage.removeItem('finchat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const expenseAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`)
};

export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics'),
  getAnalytics: (params) => api.get('/analytics', { params }),
  getWeeklyReport: () => api.get('/analytics/weekly-report')
};

export const groupAPI = {
  getGroups: () => api.get('/groups'),
  createGroup: (data) => api.post('/groups', data),
  joinGroup: (inviteCode) => api.post('/groups/join', { inviteCode }),
  getGroupDetails: (id) => api.get(`/groups/${id}`),
  addSharedExpense: (id, data) => api.post(`/groups/${id}/expenses`, data)
};

export const chatAPI = {
  sendMessage: (query) => api.post('/ai/finance', { query }),
  getHistory: () => Promise.resolve({ data: { messages: [] } }),
  clearHistory: () => Promise.resolve()
};

export default api;
