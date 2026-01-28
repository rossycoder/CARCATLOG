import api from './api';

/**
 * Validate UK registration number format
 * @param {string} registrationNumber - Vehicle registration number
 * @returns {Promise<Object>} Validation result
 */
export const validateRegistration = async (registrationNumber) => {
  try {
    const response = await api.post('/vehicles/validate-registration', {
      registrationNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lookup vehicle details from DVLA
 * @param {string} registrationNumber - Vehicle registration number
 * @param {number} mileage - Vehicle mileage (required by API)
 * @returns {Promise<Object>} Vehicle details
 */
export const lookupVehicle = async (registrationNumber, mileage = 0) => {
  try {
    const response = await api.post('/vehicles/dvla-lookup', {
      registrationNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  validateRegistration,
  lookupVehicle,
};