import api from './api';

export const categoryService = {
  // Dùng cho bản đồ và modal người dùng (không phân trang)
  getAllCategories: () => api.get('/categories'),

  // Dùng cho Admin (có phân trang, tìm kiếm)
  getAllCategoriesAdmin: (page = 0, size = 10, name = '') => {
    let url = `/categories/admin/all?page=${page}&size=${size}`;
    if (name && name.trim() !== '') {
      url += `&name=${encodeURIComponent(name.trim())}`;
    }
    return api.get(url);
  },

  createCategory: (data) => api.post('/categories', data),
  
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};