import api from './api';

export const dashboardService = {
  getSummary: () => api.get('/admin/dashboard/summary'),

  getVisitChart: (year) => api.get(`/admin/dashboard/charts/visits?year=${year}`),

  getUserChart: (year) => api.get(`/admin/dashboard/charts/users?year=${year}`),
  
  getCheckinChart: (year) => api.get(`/admin/dashboard/charts/checkins?year=${year}`)
};