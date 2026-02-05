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
  },

  // Get filter options from database
  getFilterOptions: async () => {
    const response = await api.get('/bikes/filter-options');
    return response.data.data;
  },

  // Search bikes with comprehensive filters
  searchBikes: async (filterParams) => {
    const params = new URLSearchParams();
    
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/bikes/search-filtered?${params.toString()}`);
    return response.data;
  },

  // Lookup bike by registration number using optimized DVLA-first approach
  lookupBikeByRegistration: async (registrationNumber, mileage) => {
    try {
      // Use the new optimized bike lookup endpoint (FREE DVLA API first)
      const response = await api.get(`/bikes/basic-lookup/${registrationNumber}?mileage=${mileage}`);
      
      if (response.data.success && response.data.data) {
        // Map optimized response to bike-specific format
        const bikeData = response.data.data;
        return {
          success: true,
          data: {
            registration: bikeData.registration || registrationNumber.toUpperCase(),
            mileage: bikeData.mileage || mileage,
            make: bikeData.make || 'Unknown',
            model: bikeData.model || 'Unknown',
            year: bikeData.year || new Date().getFullYear(),
            color: bikeData.color || 'Not specified',
            fuelType: bikeData.fuelType || 'Petrol',
            engineSize: bikeData.engineSize || (bikeData.engineCC ? `${bikeData.engineCC}cc` : 'Unknown'),
            engineCC: bikeData.engineCC || null,
            bikeType: bikeData.bikeType || 'Other',
            transmission: 'Manual', // Most bikes are manual
            estimatedValue: bikeData.estimatedValue || null,
            
            // Additional data if available
            variant: bikeData.variant || null,
            bodyType: bikeData.bodyType || null,
            emissionClass: bikeData.emissionClass || null,
            co2Emissions: bikeData.co2Emissions || null,
            combinedMpg: bikeData.combinedMpg || null,
            urbanMpg: bikeData.urbanMpg || null,
            extraUrbanMpg: bikeData.extraUrbanMpg || null,
            annualTax: bikeData.annualTax || null,
            insuranceGroup: bikeData.insuranceGroup || null,
            
            // Legacy fields for compatibility
            previousOwners: 'Unknown',
            motDue: 'Unknown',
            taxDue: 'Unknown',
            taxStatus: 'Unknown',
            motStatus: 'Unknown'
          },
          metadata: response.data.metadata
        };
      }
      return response.data;
    } catch (error) {
      // If API call fails completely, return a user-friendly error
      console.error('Bike lookup API error:', error);
      
      // Don't throw error, return a structured response
      return {
        success: false,
        error: 'Unable to lookup bike details. Please check the registration number and try again.',
        data: null
      };
    }
  },

  // DVLA vehicle lookup (DEPRECATED - use lookupBikeByRegistration instead)
  dvlaLookup: async (registrationNumber, mileage) => {
    console.warn('⚠️ dvlaLookup is deprecated. Use lookupBikeByRegistration for optimized DVLA-first lookup.');
    return bikeService.lookupBikeByRegistration(registrationNumber, mileage);
  }
};

export const lookupBikeByRegistration = bikeService.lookupBikeByRegistration;
