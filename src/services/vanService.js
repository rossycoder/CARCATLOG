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

  // Lookup van by registration number using optimized DVLA-first approach
  lookupVanByRegistration: async (registrationNumber, mileage) => {
    try {
      // Use the new optimized van lookup endpoint (FREE DVLA API first)
      const response = await api.get(`/vans/basic-lookup/${registrationNumber}?mileage=${mileage}`);
      
      if (response.data.success && response.data.data) {
        // Map optimized response to van-specific format
        const vanData = response.data.data;
        return {
          success: true,
          data: {
            registration: vanData.registration || registrationNumber.toUpperCase(),
            mileage: vanData.mileage || mileage,
            make: vanData.make || 'Unknown',
            model: vanData.model || 'Unknown',
            year: vanData.year || new Date().getFullYear(),
            color: vanData.color || 'Not specified',
            fuelType: vanData.fuelType || 'Diesel',
            vanType: vanData.vanType || vanData.bodyType || 'Panel Van',
            transmission: vanData.transmission || 'Manual',
            engineSize: vanData.engineSize || 'Unknown',
            estimatedValue: vanData.estimatedValue || null,
            
            // Van-specific fields
            payloadCapacity: vanData.payloadCapacity || 'Unknown',
            loadLength: vanData.loadLength || null,
            loadWidth: vanData.loadWidth || null,
            loadHeight: vanData.loadHeight || null,
            wheelbase: vanData.wheelbase || null,
            roofHeight: vanData.roofHeight || null,
            
            // Additional data if available
            variant: vanData.variant || null,
            bodyType: vanData.bodyType || null,
            doors: vanData.doors || null,
            seats: vanData.seats || 2,
            emissionClass: vanData.emissionClass || null,
            co2Emissions: vanData.co2Emissions || null,
            urbanMpg: vanData.urbanMpg || null,
            extraUrbanMpg: vanData.extraUrbanMpg || null,
            combinedMpg: vanData.combinedMpg || null,
            annualTax: vanData.annualTax || null,
            insuranceGroup: vanData.insuranceGroup || null,
            
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
      throw error;
    }
  },

  // DVLA vehicle lookup (DEPRECATED - use lookupVanByRegistration instead)
  dvlaLookup: async (registrationNumber, mileage) => {
    console.warn('⚠️ dvlaLookup is deprecated. Use lookupVanByRegistration for optimized DVLA-first lookup.');
    return vanService.lookupVanByRegistration(registrationNumber, mileage);
  }
};

export const lookupVanByRegistration = vanService.lookupVanByRegistration;
