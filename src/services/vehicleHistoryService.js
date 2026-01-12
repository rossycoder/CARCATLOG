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
    throw error;
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
    console.error('Error fetching MOT history:', error);
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
    console.error('Error fetching vehicle registration:', error);
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
    console.error('Error fetching vehicle specs:', error);
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
    console.error('Error fetching mileage history:', error);
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
    console.error('Error fetching comprehensive vehicle data:', error);
    throw error;
  }
};

export default {
  getVehicleHistory,
  checkVehicleHistory,
  getMOTHistory,
  getVehicleRegistration,
  getVehicleSpecs,
  getMileageHistory,
  getComprehensiveVehicleData,
};
