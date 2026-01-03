import api from './api';

/**
 * Generate a simple UUID (fallback when backend is unavailable)
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Create a new advert with vehicle data
 * @param {Object} vehicleData - Vehicle details from DVLA lookup
 * @returns {Promise<Object>} Created advert with UUID
 */
export const createAdvert = async (vehicleData) => {
  try {
    const response = await api.post('/adverts', { vehicleData });
    return response.data;
  } catch (error) {
    console.error('Error creating advert:', error);
    // Fallback to local storage if backend is unavailable
    const advertId = generateUUID();
    const advertData = {
      id: advertId,
      vehicleData,
      advertData: {
        price: vehicleData.estimatedValue || '',
        description: '',
        photos: [],
        contactPhone: '',
        contactEmail: '',
        location: ''
      },
      status: 'incomplete',
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage as fallback
    localStorage.setItem(`advert_${advertId}`, JSON.stringify(advertData));
    
    return {
      success: true,
      data: advertData
    };
  }
};

/**
 * Get advert by ID
 * @param {string} advertId - Advert UUID
 * @returns {Promise<Object>} Advert data
 */
export const getAdvert = async (advertId) => {
  // First check for pending advert data (from Find Your Car page)
  const pendingData = localStorage.getItem('pendingAdvertData');
  if (pendingData) {
    try {
      const parsed = JSON.parse(pendingData);
      if (parsed.advertId === advertId) {
        // Clear the pending data after reading
        localStorage.removeItem('pendingAdvertData');
        
        // Return formatted data
        return {
          success: true,
          data: {
            advertId: parsed.advertId,
            vehicleData: {
              ...parsed.vehicleData,
              registrationNumber: parsed.vehicleData.registration,
              estimatedValue: parsed.vehicleData.estimatedValue || 16670
            },
            advertData: {
              price: parsed.vehicleData.estimatedValue || '',
              description: '',
              photos: [],
              contactPhone: '',
              contactEmail: '',
              location: ''
            },
            status: 'incomplete'
          }
        };
      }
    } catch (e) {
      console.error('Error parsing pending advert data:', e);
    }
  }

  try {
    const response = await api.get(`/adverts/${advertId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advert:', error);
    
    // Try to get from localStorage as fallback
    const localData = localStorage.getItem(`advert_${advertId}`);
    if (localData) {
      return {
        success: true,
        data: JSON.parse(localData)
      };
    }
    
    // Return mock data for demo purposes
    return {
      success: true,
      data: {
        advertId,
        vehicleData: {
          registrationNumber: 'AB12CDE',
          make: 'BMW',
          model: 'M6 Gran Coupe',
          year: 2014,
          color: 'Black',
          fuelType: 'Petrol',
          transmission: 'Automatic',
          engineSize: '4.4L',
          mileage: 83119,
          doors: 4,
          seats: 5,
          bodyType: 'Saloon',
          motDue: '05/06/2026',
          estimatedValue: 16670
        },
        advertData: {
          price: 16870,
          description: '',
          photos: [],
          contactPhone: '',
          contactEmail: '',
          location: ''
        },
        status: 'incomplete'
      }
    };
  }
};

/**
 * Update advert data
 * @param {string} advertId - Advert UUID
 * @param {Object} advertData - Updated advert data
 * @param {Object} vehicleData - Updated vehicle data
 * @param {Object} contactDetails - Seller contact details (optional)
 * @returns {Promise<Object>} Updated advert
 */
export const updateAdvert = async (advertId, advertData, vehicleData, contactDetails = null) => {
  try {
    const payload = { advertData, vehicleData };
    if (contactDetails) {
      payload.contactDetails = contactDetails;
    }
    
    const response = await api.put(`/adverts/${advertId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating advert:', error);
    
    // Fallback to localStorage
    const localData = localStorage.getItem(`advert_${advertId}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      parsed.advertData = { ...parsed.advertData, ...advertData };
      parsed.vehicleData = { ...parsed.vehicleData, ...vehicleData };
      if (contactDetails) {
        parsed.contactDetails = contactDetails;
      }
      parsed.updatedAt = new Date().toISOString();
      localStorage.setItem(`advert_${advertId}`, JSON.stringify(parsed));
      
      return {
        success: true,
        data: parsed
      };
    }
    
    throw error;
  }
};

/**
 * Publish advert
 * @param {string} advertId - Advert UUID
 * @param {Object} advertData - Advert data
 * @param {Object} vehicleData - Vehicle data
 * @returns {Promise<Object>} Published advert
 */
export const publishAdvert = async (advertId, advertData, vehicleData) => {
  try {
    const response = await api.post(`/adverts/${advertId}/publish`, { advertData, vehicleData });
    return response.data;
  } catch (error) {
    console.error('Error publishing advert:', error);
    
    // Fallback to localStorage
    const localData = localStorage.getItem(`advert_${advertId}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      parsed.advertData = { ...parsed.advertData, ...advertData };
      parsed.vehicleData = { ...parsed.vehicleData, ...vehicleData };
      parsed.status = 'published';
      parsed.publishedAt = new Date().toISOString();
      localStorage.setItem(`advert_${advertId}`, JSON.stringify(parsed));
      
      return {
        success: true,
        data: parsed
      };
    }
    
    throw error;
  }
};

export default {
  createAdvert,
  getAdvert,
  updateAdvert,
  publishAdvert
};
