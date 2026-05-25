import api from './api';

export const fileService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadMultipleFiles: (files) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file); 
    });

    return api.post('/files/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};