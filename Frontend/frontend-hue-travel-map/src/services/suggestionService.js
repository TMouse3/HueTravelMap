import api from './api';

export const suggestionService = {
  createSuggestion: (data) => api.post('/placesuggestions', data),

  getMySuggestions: (page = 0, size = 10, name = '', status = '') => {
    let url = `/placesuggestions/my-history?page=${page}&size=${size}`;
    
    if (name && name.trim() !== '') {
      url += `&name=${encodeURIComponent(name.trim())}`;
    }
    if (status && status !== '') {
      url += `&status=${status}`;
    }

    return api.get(url);
  },

  getAllSuggestionsForAdmin: (page = 0, size = 10, name = '', status = '') => {
    let url = `/placesuggestions/admin/all?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name.trim())}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },

  approveSuggestion: (id) => api.put(`/placesuggestions/admin/${id}/approve`),
  
  rejectSuggestion: (id) => api.put(`/placesuggestions/admin/${id}/reject`),

  deleteSuggestion: (id) => api.delete(`/placesuggestions/${id}`)
};