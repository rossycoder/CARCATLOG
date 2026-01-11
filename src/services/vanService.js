import api from './api';

export const vanService = {
  // Get all vans with filters
  getVans: async (filters = {}) => {
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
    if (filters.vanType) params.append('vanType', filters.vanType);
    if (filters.minPayload) params.append('minPayload', filters.minPayload);
    if (filters.maxPayload) params.append('maxPayload', filters.maxPayload);
    if (filters.wheelbase) params.append('wheelbase', filters.wheelbase);
    if (filters.roofHeight) params.append('roofHeight', filters.roofHeight);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await api.get(`/vans?${params.toString()}`);
    return response.data;
  },

  // Get single van by ID
  getVanById: async (id) => {
    const response = await api.get(`/vans/${id}`);
    return response.data;
  },

  // Search vans by postcode and radius
  searchVansByPostcode: async (postcode, radius = 25, filters = {}) => {
    const params = new URLSearchParams();
    params.append('postcode', postcode);
    if (radius) params.append('radius', radius);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.vanType) params.append('vanType', filters.vanType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    const response = await api.get(`/vans/search?${params.toString()}`);
    
    // Transform response to match frontend expected format
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: {
          postcode: response.data.data.searchLocation?.postcode || postcode,
          coordinates: response.data.data.searchLocation,
          radius: radius,
          results: response.data.data.vans || response.data.data.vehicles || [],
          count: response.data.data.total || 0
        }
      };
    }
    return response.data;
  },

  // Get total count of available vans
  getVanCount: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.condition) params.append('condition', filters.condition);
    
    const response = await api.get(`/vans/count?${params.toString()}`);
    return response.data.count;
  },

  // Get used vans
  getUsedVans: async (filters = {}) => {
    return vanService.getVans({ ...filters, condition: 'used' });
  },

  // Get new vans
  getNewVans: async (filters = {}) => {
    return vanService.getVans({ ...filters, condition: 'new' });
  },

  // Create a new van listing
  createVan: async (vanData) => {
    const response = await api.post('/vans', vanData);
    return response.data;
  },

  // Update a van listing
  updateVan: async (id, vanData) => {
    const response = await api.put(`/vans/${id}`, vanData);
    return response.data;
  },

  // Delete a van listing
  deleteVan: async (id) => {
    const response = await api.delete(`/vans/${id}`);
    return response.data;
  },

  // Get filter options from database
  getFilterOptions: async () => {
    const response = await api.get('/vans/filter-options');
    return response.data.data;
  },

  // Search vans with comprehensive filters
  searchVans: async (filterParams) => {
    const params = new URLSearchParams();
    
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/vans/search-filtered?${params.toString()}`);
    return response.data;
  },

  // DVLA vehicle lookup (works for vans too)
  dvlaLookup: async (registrationNumber, mileage) => {
    const response = await api.post('/vehicles/dvla-lookup', {
      registrationNumber,
      mileage
    });
    return response.data;
  },

  // Lookup van by registration number
  lookupVanByRegistration: async (registrationNumber, mileage) => {
    try {
      const response = await api.post('/vehicles/dvla-lookup', {
        registrationNumber,
        mileage
      });
      
      if (response.data.success && response.data.data) {
        // Map DVLA data to van-specific format
        const dvlaData = response.data.data;
        return {
          success: true,
          data: {
            registration: dvlaData.registrationNumber || registrationNumber.toUpperCase(),
            mileage: mileage,
            make: dvlaData.make || 'Unknown',
            model: dvlaData.model || 'Unknown',
            year: dvlaData.year || dvlaData.yearOfManufacture || new Date().getFullYear(),
            color: dvlaData.color || dvlaData.colour || 'Not specified',
            fuelType: dvlaData.fuelType || 'Diesel',
            vanType: dvlaData.vanType || dvlaData.bodyType || 'Panel Van',
            payloadCapacity: dvlaData.payloadCapacity || dvlaData.grossWeight || 'Unknown',
            previousOwners: dvlaData.previousOwners || 'Unknown',
            motDue: dvlaData.motExpiryDate || dvlaData.motDue || 'Unknown',
            taxDue: dvlaData.taxDueDate || dvlaData.taxDue || 'Unknown',
            taxStatus: dvlaData.taxStatus || 'Unknown',
            motStatus: dvlaData.motStatus || 'Unknown'
          }
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error looking up van:', error);
      throw error;
    }
  }
};

export const lookupVanByRegistration = vanService.lookupVanByRegistration;
