import api from './api';

export const aiService = {
  chatWithImage: (files, message) => {
    const formData = new FormData();
    
    // Nạp mảng file
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    // Nạp tin nhắn text
    if (message) {
      formData.append('message', message || '');
    }

    return api.post('/chatAI/chat-with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // Bắt buộc cho việc gửi File
    });
  }
};