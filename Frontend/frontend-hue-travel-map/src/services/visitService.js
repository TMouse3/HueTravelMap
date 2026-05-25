import api from './api';

export const visitService = {
  recordVisit: () => api.post('/visits/record')
};