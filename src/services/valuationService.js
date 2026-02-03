import api from './api';

/**
 * Get cached valuation data (no API calls)
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Cached valuation data
 */
export const getCachedValuation = async (vrm) => {
  try {
    const response = await api.get(`/vehicle-valuation/cached/${vrm}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('No valuation data available for this vehicle');
    }
    throw error;
  }
};

/**
 * Get vehicle valuation (uses cached data to avoid API charges)
 * @param {string} vrm - Vehicle Registration Mark
 * @param {number} mileage - Current mileage
 * @param {boolean} forceRefresh - Force new valuation (admin only)
 * @returns {Promise<Object>} Valuation data
 */
export const getValuation = async (vrm, mileage, forceRefresh = false) => {
  try {
    // First try to get cached data
    if (!forceRefresh) {
      try {
        return await getCachedValuation(vrm);
      } catch (cacheError) {
        // If no cached data, continue to API call
        console.log('No cached valuation found, proceeding with API call');
      }
    }
    
    // For regular users, never force refresh to avoid API charges
    const shouldForceRefresh = forceRefresh && window.location.pathname.includes('/admin');
    
    const response = await api.post('/vehicle-valuation', {
      vrm,
      mileage,
      forceRefresh: shouldForceRefresh
    }, shouldForceRefresh ? {
      headers: {
        'x-admin-request': 'true'
      }
    } : {});
    
    return response.data;
  } catch (error) {
    // If no cached data available, return helpful error
    if (error.response?.status === 404) {
      throw new Error('No valuation data available. Please create a vehicle listing first.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Valuation data not available. API access restricted to prevent charges.');
    }
    
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
    throw error;
  }
};

export default {
  getCachedValuation,
  getValuation,
  getDetailedValuation,
};
