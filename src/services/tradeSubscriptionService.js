import api from './api';
import { getToken } from './tradeDealerService';

const API_URL = '/trade/subscriptions';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

/**
 * Trade Subscription Service
 * Handles subscription management operations
 */

// Get all subscription plans (public)
export const getPlans = async () => {
  try {
    const response = await api.get(`${API_URL}/plans`);
    return response.data.plans || response.data; // Handle both formats
  } catch (error) {
    console.error('❌ getPlans error:', error);
    throw error;
  }
};

// Get current subscription
export const getCurrentSubscription = async () => {
  try {
    const response = await api.get(`${API_URL}/current`, getAuthHeaders());
    // Return full response data so caller can access hasUsedTrial
    return response.data;
  } catch (error) {
    console.error('❌ getCurrentSubscription error:', error);
    // Return null if no subscription found (not an error)
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Create subscription
export const createSubscription = async (planId, paymentMethodId) => {
  const response = await api.post(
    `${API_URL}/create`,
    { planId, paymentMethodId },
    getAuthHeaders()
  );
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (cancelAtPeriodEnd = true) => {
  const response = await api.post(
    `${API_URL}/cancel`,
    { cancelAtPeriodEnd },
    getAuthHeaders()
  );
  return response.data;
};

// Reactivate subscription
export const reactivateSubscription = async () => {
  const response = await api.post(`${API_URL}/reactivate`, {}, getAuthHeaders());
  return response.data;
};

// Create Stripe checkout session
export const createCheckoutSession = async (planSlug) => {
  
  try {
    const response = await api.post(
      `${API_URL}/create-checkout-session`,
      { planSlug },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('❌ createCheckoutSession error:', error);
    console.error('   Status:', error.response?.status);
    console.error('   Data:', error.response?.data);
    throw error;
  }
};

// Verify payment after Stripe redirect
export const verifyPayment = async (sessionId) => {
  const response = await api.post(
    `${API_URL}/verify-payment`,
    { sessionId },
    getAuthHeaders()
  );
  return response.data;
};

export default {
  getPlans,
  getCurrentSubscription,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  createCheckoutSession,
  verifyPayment
};
