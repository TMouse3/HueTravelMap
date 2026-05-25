import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  
  register: (data) => api.post('/users/register', data),
  
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (data) => api.post('/auth/reset-password', data),
};