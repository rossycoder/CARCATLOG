import api from './api';

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
      const response = await api.get('/vehicles/filter-options');
      return response.data.data;
    } catch (error) {
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
      return [];
    }
  }

  /**
   * Get list of models for a specific make
   * Uses a fast dedicated endpoint instead of fetching all filter options
   * @param {string} make - The make to get models for
   * @returns {Promise<Array<string>>} Array of model names
   */
  async getModelsForMake(make) {
    try {
      const response = await api.get(`/vehicles/models-for-make?make=${encodeURIComponent(make)}`);
      return response.data.data || [];
    } catch (error) {
      // Fallback: try the full filter-options endpoint
      try {
        const filterOptions = await this.getFilterOptions();
        return filterOptions.modelsByMake?.[make] || [];
      } catch {
        return [];
      }
    }
  }
}

export const filterService = new FilterService();
