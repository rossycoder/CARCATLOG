import api from './api';

/**
 * Get vehicle history by VRM
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Vehicle history data
 */
export const getVehicleHistory = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get cached vehicle history (no API calls)
 * @param {string} vrm - Vehicle registration mark
 * @returns {Promise<Object>} Cached vehicle history data
 */
export const getCachedVehicleHistory = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/cached/${vrm}`);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    const enhancedError = new Error(errorData.error || error.message || 'No cached vehicle history available');
    enhancedError.status = error.response?.status;
    throw enhancedError;
  }
};

/**
 * Check vehicle history (makes API call - use sparingly)
 * @param {string} vrm - Vehicle registration mark
 * @param {boolean} forceRefresh - Force new API call (admin only)
 * @returns {Promise<Object>} Vehicle history data
 */
export const checkVehicleHistory = async (vrm, forceRefresh = false) => {
  try {
    // For regular users, always use cached data to avoid API charges
    if (!forceRefresh) {
      return await getCachedVehicleHistory(vrm);
    }

    // Admin-only API call with special header
    const response = await api.post('/vehicle-history/check', {
      vrm,
      forceRefresh: true
    }, {
      headers: {
        'x-admin-request': 'true' // Required for API calls
      }
    });
    
    return response.data;
  } catch (error) {
    // Extract error details from response
    const errorData = error.response?.data || {};
    const enhancedError = new Error(errorData.error || error.message || 'Failed to check vehicle history');
    enhancedError.status = error.response?.status;
    enhancedError.nextSteps = errorData.nextSteps || [];
    enhancedError.timestamp = errorData.timestamp;
    enhancedError.isServiceUnavailable = errorData.isServiceUnavailable || false;
    enhancedError.message = errorData.message || enhancedError.message;
    
    throw enhancedError;
  }
};

/**
 * Get MOT history for a vehicle
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} MOT history data
 */
export const getMOTHistory = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/mot/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get vehicle registration details
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Vehicle registration data
 */
export const getVehicleRegistration = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/registration/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get vehicle specifications
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Vehicle specifications
 */
export const getVehicleSpecs = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/specs/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get mileage history
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Mileage history
 */
export const getMileageHistory = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/mileage/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get comprehensive vehicle data (all data points)
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Comprehensive vehicle data
 */
export const getComprehensiveVehicleData = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-history/comprehensive/${vrm}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getVehicleHistory,
  getCachedVehicleHistory,
  checkVehicleHistory,
  getMOTHistory,
  getVehicleRegistration,
  getVehicleSpecs,
  getMileageHistory,
  getComprehensiveVehicleData,
};
