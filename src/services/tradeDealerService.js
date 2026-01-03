import api from './api';

const API_URL = '/trade';

/**
 * Trade Dealer Service
 * Handles all trade dealer authentication and profile operations
 */

// Register new trade dealer
export const register = async (dealerData) => {
  try {
    const response = await api.post(`${API_URL}/auth/register`, dealerData);
    return response.data;
  } catch (error) {
    // Extract error message from response
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Login trade dealer
export const login = async (email, password) => {
  const response = await api.post(`${API_URL}/auth/login`, { email, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem('tradeToken', response.data.token);
    localStorage.setItem('tradeDealer', JSON.stringify(response.data.dealer));
  }
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('tradeToken');
  localStorage.removeItem('tradeDealer');
};

// Get current dealer
export const getCurrentDealer = async () => {
  const token = localStorage.getItem('tradeToken');
  if (!token) return null;

  const response = await api.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Verify email
export const verifyEmail = async (token) => {
  const response = await api.post(`${API_URL}/auth/verify-email`, { token });
  if (response.data.success && response.data.token) {
    localStorage.setItem('tradeToken', response.data.token);
    localStorage.setItem('tradeDealer', JSON.stringify(response.data.dealer));
  }
  return response.data;
};

// Request password reset
export const forgotPassword = async (email) => {
  const response = await api.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, password) => {
  const response = await api.post(`${API_URL}/auth/reset-password`, { token, password });
  if (response.data.success && response.data.token) {
    localStorage.setItem('tradeToken', response.data.token);
  }
  return response.data;
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('tradeToken');
};

// Get stored dealer
export const getStoredDealer = () => {
  const dealer = localStorage.getItem('tradeDealer');
  return dealer ? JSON.parse(dealer) : null;
};

// Check if authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

export default {
  register,
  login,
  logout,
  getCurrentDealer,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getToken,
  getStoredDealer,
  isAuthenticated
};
