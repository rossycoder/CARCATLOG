import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout for large uploads
  maxContentLength: 50 * 1024 * 1024, // 50MB max
  maxBodyLength: 50 * 1024 * 1024, // 50MB max
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for trade dealer token first, then regular user token
    const tradeToken = localStorage.getItem('tradeToken');
    const userToken = localStorage.getItem('token');
    const token = tradeToken || userToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If the data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
