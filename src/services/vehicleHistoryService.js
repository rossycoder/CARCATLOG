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
    console.error('Error fetching vehicle history:', error);
    throw error;
  }
};

/**
 * Perform new vehicle history check
 * @param {string} vrm - Vehicle Registration Mark
 * @param {boolean} forceRefresh - Force new check
 * @returns {Promise<Object>} Vehicle history data
 */
export const checkVehicleHistory = async (vrm, forceRefresh = false) => {
  try {
    const response = await api.post('/vehicle-history/check', {
      vrm,
      forceRefresh,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking vehicle history:', error);
    throw error; // Throw error instead of returning mock data
  }
};

export default {
  getVehicleHistory,
  checkVehicleHistory,
};
