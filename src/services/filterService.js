import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Service for fetching filter options from the database
 */
class FilterService {
  /**
   * Fetch all filter options including makes, models, and other filters
   * @returns {Promise<Object>} Filter options data
   */
  async getFilterOptions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicles/filter-options`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }

  /**
   * Get list of all available makes
   * @returns {Promise<Array<string>>} Array of make names
   */
  async getMakes() {
    try {
      const filterOptions = await this.getFilterOptions();
      return filterOptions.makes || [];
    } catch (error) {
      console.error('Error fetching makes:', error);
      return [];
    }
  }

  /**
   * Get list of models for a specific make
   * @param {string} make - The make to get models for
   * @returns {Promise<Array<string>>} Array of model names
   */
  async getModelsForMake(make) {
    try {
      const filterOptions = await this.getFilterOptions();
      return filterOptions.modelsByMake?.[make] || [];
    } catch (error) {
      console.error(`Error fetching models for ${make}:`, error);
      return [];
    }
  }
}

export const filterService = new FilterService();
