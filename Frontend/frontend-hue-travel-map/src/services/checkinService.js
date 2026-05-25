import api from './api';

export const checkinService = {
  verifyLocation: (placeId, userLat, userLng) => 
    api.get('/checkins/verify-location', { params: { placeId, userLat, userLng } }),

  createCheckin: (data) => api.post('/checkins', data),

  getMyHistory: (page = 0, size = 10, placeName = '', rating = '') => {
    let url = `/checkins/my-history?page=${page}&size=${size}`;
    if (placeName && placeName.trim() !== '') url += `&placeName=${encodeURIComponent(placeName.trim())}`;
    if (rating && rating !== '') url += `&rating=${rating}`;
    return api.get(url);
  },

  getAllCheckinsAdmin: (page = 0, size = 10, placeId = '', rating = '') => {
    let url = `/checkins/admin/all?page=${page}&size=${size}`;
    if (placeId) url += `&placeId=${placeId}`;
    if (rating) url += `&rating=${rating}`;
    return api.get(url);
  },

  deleteCheckin: (id) => api.delete(`/checkins/${id}`)
};