import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Request Interceptor: Attach JWT Token from localStorage if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tph_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common HTTP error codes (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto-logout if unauthorized (token expired or modified)
      if (status === 401) {
        localStorage.removeItem('tph_current_user');
        localStorage.removeItem('tph_token');
        
        // Redirect to login screen if not already on it
        if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/register')) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
