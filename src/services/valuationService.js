import api from './api';

/**
 * Get vehicle valuation
 * @param {string} vrm - Vehicle Registration Mark
 * @param {number} mileage - Current mileage
 * @param {boolean} forceRefresh - Force new valuation
 * @returns {Promise<Object>} Valuation data
 */
export const getValuation = async (vrm, mileage, forceRefresh = false) => {
  try {
    const response = await api.post('/vehicle-valuation', {
      vrm,
      mileage,
      forceRefresh,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching valuation:', error);
    throw error;
  }
};

/**
 * Get detailed valuation with DVLA data
 * @param {string} vrm - Vehicle Registration Mark
 * @param {number} mileage - Current mileage
 * @returns {Promise<Object>} Detailed valuation with vehicle info
 */
export const getDetailedValuation = async (vrm, mileage) => {
  try {
    const response = await api.post('/vehicle-valuation/detailed', {
      vrm,
      mileage,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed valuation:', error);
    throw error;
  }
};

export default {
  getValuation,
  getDetailedValuation,
};
