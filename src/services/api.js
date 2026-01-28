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
    // Determine which token to use based on the request URL
    const url = config.url || '';
    const tradeToken = localStorage.getItem('tradeToken');
    const userToken = localStorage.getItem('token');
    
    let token = null;
    
    // Use trade token for trade-specific endpoints
    if (url.includes('/trade') || url.includes('/dealer') || url.includes('/subscription')) {
      token = tradeToken;
    } 
    // Use user token for user-specific endpoints
    else if (url.includes('/vehicles/my-listings') || url.includes('/auth/me') || url.includes('/user')) {
      token = userToken;
    }
    // For other endpoints, prefer the token based on current path
    else {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/trade')) {
        token = tradeToken || userToken;
      } else {
        token = userToken || tradeToken;
      }
    }
    
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
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      
      // Don't redirect if already on signin/signup/auth pages
      if (currentPath.includes('/signin') || 
          currentPath.includes('/signup') || 
          currentPath.includes('/auth')) {
        return Promise.reject(error);
      }
      
      const hasUserToken = !!localStorage.getItem('token');
      const hasTradeToken = !!localStorage.getItem('tradeToken');
      
      // Determine which authentication failed based on request URL
      const isTradeRequest = requestUrl.includes('/trade') || 
                            requestUrl.includes('/dealer') || 
                            requestUrl.includes('/subscription') ||
                            currentPath.includes('/trade');
      
      // Only clear and redirect if we had a token (meaning it's invalid/expired)
      if (hasUserToken || hasTradeToken) {
        // Clear only the relevant auth data
        if (isTradeRequest && hasTradeToken) {
          // Trade authentication failed
          localStorage.removeItem('tradeToken');
          localStorage.removeItem('tradeDealer');
          localStorage.removeItem('tradeSubscription');
          
          // Store the current path to redirect back after signin
          localStorage.setItem('redirectAfterAuth', currentPath);
          
          window.location.href = '/trade/signin';
        } else if (!isTradeRequest && hasUserToken) {
          // User authentication failed
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Store the current path to redirect back after signin
          localStorage.setItem('redirectAfterAuth', currentPath);
          
          window.location.href = '/signin';
        } else {
          // Unclear which auth failed, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tradeToken');
          localStorage.removeItem('tradeDealer');
          localStorage.removeItem('tradeSubscription');
          
          localStorage.setItem('redirectAfterAuth', currentPath);
          
          if (currentPath.includes('/trade')) {
            window.location.href = '/trade/signin';
          } else {
            window.location.href = '/signin';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
