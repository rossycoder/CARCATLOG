import api from './api';

/**
 * Get analytics data for the authenticated dealer
 * @param {string} timeRange - '7days', '30days', or '90days'
 * @returns {Promise<Object>} Analytics data
 */
export const getAnalytics = async (timeRange = '30days') => {
  try {
    console.log('[Analytics Service] Fetching analytics with timeRange:', timeRange);
    const response = await api.get(`/trade/analytics?timeRange=${timeRange}`);
    console.log('[Analytics Service] Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Analytics Service] Error fetching analytics:', error);
    console.error('[Analytics Service] Error response:', error.response?.data);
    console.error('[Analytics Service] Error status:', error.response?.status);
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.error || 'Failed to load analytics data',
      error: error.message,
      status: error.response?.status
    };
  }
};
