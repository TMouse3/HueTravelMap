import api from './api';

export const userService = {
  getMyProfile: () => api.get('/users/my-profile'),
  
  updateProfile: (data) => api.put('/users/my-profile', data),
  
  changePassword: (data) => api.put('/users/my-password', data),

  getAllUsersAdmin: (page = 0, size = 10, search = '', isActive = '') => {
    let url = `/users?page=${page}&size=${size}`;
    if (search && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (isActive !== '') {
      url += `&isActive=${isActive}`;
    }
    return api.get(url);
  },

  toggleUserStatus: (id) => api.put(`/users/admin/${id}/toggle-status`)
};