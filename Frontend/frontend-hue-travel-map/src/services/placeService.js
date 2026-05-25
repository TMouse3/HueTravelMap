import api from './api';

export const placeService = {
  getAllPlaces: (categoryId = null) => {
    const url = categoryId ? `/places?categoryId=${categoryId}` : '/places';
    return api.get(url);
  },
  
  getPlaceById: (id) => {
    return api.get(`/places/${id}`);
  },

  getAllPlacesAdmin: (page = 0, size = 10, name = '', categoryId = '') => {
    let url = `/places/admin/all?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name.trim())}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return api.get(url);
  },

  getTopPlaces: (time) => api.get(`/places/top?time=${time}`),

  createPlace: (data) => api.post('/places', data),
  
  updatePlace: (id, data) => api.put(`/places/${id}`, data),
  
  toggleStatus: (id) => api.put(`/places/${id}/toggle-status`),
  
  deletePlace: (id) => api.delete(`/places/${id}`)
};