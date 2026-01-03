import api from './api';

/**
 * Create Stripe checkout session for vehicle history report
 * @param {string} vrm - Vehicle Registration Mark
 * @param {string} customerEmail - Customer email (optional)
 * @returns {Promise<Object>} Checkout session data
 */
export const createCheckoutSession = async (vrm, customerEmail = null) => {
  try {
    const response = await api.post('/payments/create-checkout-session', {
      vrm,
      customerEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create Stripe checkout session for credit packages
 * @param {number} creditAmount - Number of credits to purchase
 * @param {string} customerEmail - Customer email (optional)
 * @returns {Promise<Object>} Checkout session data
 */
export const createCreditCheckoutSession = async (creditAmount, customerEmail = null) => {
  try {
    const response = await api.post('/payments/create-credit-session', {
      creditAmount,
      customerEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating credit checkout session:', error);
    throw error;
  }
};

/**
 * Get checkout session details
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Session details
 */
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/payments/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

/**
 * Get user credit balance
 * @returns {Promise<Object>} Credit balance data
 */
export const getCreditBalance = async () => {
  try {
    const response = await api.get('/payments/credits');
    return response.data;
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    throw error;
  }
};

/**
 * Use credit for vehicle check
 * @param {string} vrm - Vehicle Registration Mark
 * @returns {Promise<Object>} Vehicle check result
 */
export const useCreditForCheck = async (vrm) => {
  try {
    const response = await api.post('/payments/use-credit', {
      vrm,
    });
    return response.data;
  } catch (error) {
    console.error('Error using credit for check:', error);
    throw error;
  }
};

export default {
  createCheckoutSession,
  createCreditCheckoutSession,
  getSessionDetails,
  getCreditBalance,
  useCreditForCheck,
};