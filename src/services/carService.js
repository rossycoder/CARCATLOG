import api from './api';

export const carService = {
  // Get all cars with filters
  getCars: async (filters = {}) => {
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
    
    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  // Get single car by ID
  getCarById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Create new car (admin only)
  createCar: async (carData) => {
    const response = await api.post('/vehicles', carData);
    return response.data;
  },

  // Update car (admin only)
  updateCar: async (id, carData) => {
    const response = await api.put(`/vehicles/${id}`, carData);
    return response.data;
  },

  // Delete car (admin only)
  deleteCar: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Search cars by postcode and radius
  searchCarsByPostcode: async (postcode, radius = 25) => {
    const params = new URLSearchParams();
    params.append('postcode', postcode);
    if (radius) params.append('radius', radius);
    
    const response = await api.get(`/postcode/search?${params.toString()}`);
    return response.data;
  },

  // Get total count of available cars
  getCarCount: async () => {
    const response = await api.get('/vehicles/count');
    console.log('API response:', response);
    return response.data.count;
  },

  // Get filter options from database
  getFilterOptions: async () => {
    const response = await api.get('/vehicles/filter-options');
    return response.data.data;
  },

  // Search cars with comprehensive filters
  searchCars: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'relevance' && value !== 'national') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/vehicles/search?${params.toString()}`);
    return response.data;
  },

  // DVLA vehicle lookup
  dvlaLookup: async (registrationNumber, mileage) => {
    const response = await api.post('/vehicles/dvla-lookup', {
      registrationNumber,
      mileage
    });
    return response.data;
  },

  // Enhanced vehicle lookup (CheckCarDetails + Valuation)
  enhancedLookup: async (registrationNumber, mileage) => {
    const response = await api.get(`/vehicles/enhanced-lookup/${registrationNumber}?mileage=${mileage}`);
    return response.data;
  },
};
