import api from './api';

/**
 * Get analytics data for the authenticated dealer
 * @param {string} timeRange - '7days', '30days', or '90days'
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalytics = async (timeRange = '30days') => {
  try {
    const response = await api.get(`/trade/analytics?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.error || 'Failed to load analytics data',
      error: error.message,
      status: error.response?.status
    };
  }
};
