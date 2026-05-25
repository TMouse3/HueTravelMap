import axios from 'axios';

let isSessionExpiredAlertShown = false;

// Tạo instance Axios với cấu hình cơ bản
const api = axios.create({
  baseURL: 'http://localhost:8080/hue-travel-map',
  timeout: 15000,
});

// Interceptor để tự động thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi phản hồi từ server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (window.location.pathname === '/') {
          window.location.reload();
        } else{
          if (!isSessionExpiredAlertShown) {  
            isSessionExpiredAlertShown = true;
            alert("Phiên đăng nhập hết hạn!");
            window.location.href = '/'; 
          }
        }
      } else if (status === 423){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!isSessionExpiredAlertShown){
          isSessionExpiredAlertShown = true;
          alert("Tài khoản của bạn đã bị khóa");
          window.location.href = '/';
        }
      } else if (status === 403) {
        alert("Bạn không có quyền thực hiện thao tác này!");
      }
    }
    return Promise.reject(error);
  }
);

export default api;