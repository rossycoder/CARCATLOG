import api from './api';

export const bikeService = {
  // Get all bikes with filters
  getBikes: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.minYear) params.append('minYear', filters.minYear);
    if (filters.maxYear) params.append('maxYear', filters.maxYear);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.postcode) params.append('postcode', filters.postcode);
    if (filters.fuelType) params.append('fuelType', filters.fuelType);
    if (filters.transmission) params.append('transmission', filters.transmission);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.bikeType) params.append('bikeType', filters.bikeType);
    if (filters.minEngineCC) params.append('minEngineCC', filters.minEngineCC);
    if (filters.maxEngineCC) params.append('maxEngineCC', filters.maxEngineCC);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await api.get(`/bikes?${params.toString()}`);
    return response.data;
  },

  // Get single bike by ID
  getBikeById: async (id) => {
    const response = await api.get(`/bikes/${id}`);
    return response.data;
  },

  // Search bikes by postcode and radius
  searchBikesByPostcode: async (postcode, radius = 25, filters = {}) => {
    const params = new URLSearchParams();
    params.append('postcode', postcode);
    if (radius) params.append('radius', radius);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.bikeType) params.append('bikeType', filters.bikeType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    const response = await api.get(`/bikes/search?${params.toString()}`);
    
    // Transform response to match frontend expected format
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: {
          postcode: response.data.data.searchLocation?.postcode || postcode,
          coordinates: response.data.data.searchLocation,
          radius: radius,
          results: response.data.data.bikes || response.data.data.vehicles || [],
          count: response.data.data.total || 0
        }
      };
    }
    return response.data;
  },

  // Get total count of available bikes
  getBikeCount: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.condition) params.append('condition', filters.condition);
    
    const response = await api.get(`/bikes/count?${params.toString()}`);
    return response.data.count;
  },

  // Get used bikes
  getUsedBikes: async (filters = {}) => {
    return bikeService.getBikes({ ...filters, condition: 'used' });
  },

  // Get new bikes
  getNewBikes: async (filters = {}) => {
    return bikeService.getBikes({ ...filters, condition: 'new' });
  },

  // Create a new bike listing
  createBike: async (bikeData) => {
    const response = await api.post('/bikes', bikeData);
    return response.data;
  },

  // Update a bike listing
  updateBike: async (id, bikeData) => {
    const response = await api.put(`/bikes/${id}`, bikeData);
    return response.data;
  },

  // Delete a bike listing
  deleteBike: async (id) => {
    const response = await api.delete(`/bikes/${id}`);
    return response.data;
  }
};
