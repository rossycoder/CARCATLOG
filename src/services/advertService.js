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
    console.log('🚀 Creating advert via API...');
    
    // Try to create via API with longer timeout (15 seconds for API calls)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
    });
    
    const response = await Promise.race([
      api.post('/adverts', { vehicleData }),
      timeoutPromise
    ]);
    
    console.log('✅ Advert created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating advert via API:', error.message);
    console.error('Error details:', error.response?.data || error);
    console.log('⚠️  Falling back to localStorage');
    
    // Fallback to local storage if backend is unavailable
    const advertId = generateUUID();
    const advertData = {
      id: advertId,
      advertId: advertId,
      vehicleData: {
        ...vehicleData,
        registrationNumber: vehicleData.registration || vehicleData.registrationNumber
      },
      advertData: {
        price: vehicleData.estimatedValue || '',
        description: '',
        photos: [],
        contactPhone: '',
        contactEmail: '',
        location: '',
        features: [],
        runningCosts: {
          fuelEconomy: { urban: '', extraUrban: '', combined: '' },
          annualTax: '',
          insuranceGroup: '',
          co2Emissions: vehicleData.co2Emissions || ''
        },
        videoUrl: ''
      },
      status: 'incomplete',
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage as fallback
    localStorage.setItem(`advert_${advertId}`, JSON.stringify(advertData));
    
    // Also store as pending data for immediate access
    localStorage.setItem('pendingAdvertData', JSON.stringify({
      advertId: advertId,
      vehicleData: advertData.vehicleData
    }));
    
    return {
      success: true,
      data: advertData
    };
  }
};

/**
 * Get advert by ID with timeout
 * @param {string} advertId - Advert UUID
 * @returns {Promise<Object>} Advert data
 */
export const getAdvert = async (advertId) => {
  console.log('🔍 Fetching advert:', advertId);
  
  // First check for pending advert data (from Find Your Car page)
  const pendingData = localStorage.getItem('pendingAdvertData');
  if (pendingData) {
    try {
      const parsed = JSON.parse(pendingData);
      console.log('📦 Found pending advert data:', parsed);
      
      if (parsed.advertId === advertId) {
        // Clear the pending data after reading
        localStorage.removeItem('pendingAdvertData');
        
        console.log('✅ Using pending advert data');
        // Return formatted data
        return {
          success: true,
          data: {
            advertId: parsed.advertId,
            vehicleData: {
              ...parsed.vehicleData,
              registrationNumber: parsed.vehicleData.registration || parsed.vehicleData.registrationNumber,
              estimatedValue: parsed.vehicleData.estimatedValue || 0
            },
            advertData: {
              price: parsed.vehicleData.estimatedValue || '',
              description: '',
              photos: [],
              contactPhone: '',
              contactEmail: '',
              location: '',
              features: [],
              runningCosts: {
                fuelEconomy: { urban: '', extraUrban: '', combined: '' },
                annualTax: '',
                insuranceGroup: '',
                co2Emissions: parsed.vehicleData.co2Emissions || ''
              },
              videoUrl: ''
            },
            status: 'incomplete'
          }
        };
      }
    } catch (e) {
      console.error('❌ Error parsing pending advert data:', e);
    }
  }

  // Try to fetch from backend API with timeout
  try {
    console.log('🌐 Fetching from API: /adverts/' + advertId);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });
    
    // Race between API call and timeout
    const response = await Promise.race([
      api.get(`/adverts/${advertId}`),
      timeoutPromise
    ]);
    
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.log('Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
    
    // Try to get from localStorage as fallback
    const localData = localStorage.getItem(`advert_${advertId}`);
    if (localData) {
      console.log('📦 Using localStorage fallback');
      return {
        success: true,
        data: JSON.parse(localData)
      };
    }
    
    // If API fails and no local data, throw error instead of returning mock data
    console.error('❌ No data found for advert:', advertId);
    throw new Error('Advert not found. Please create a new advert from the Find Your Car page.');
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
