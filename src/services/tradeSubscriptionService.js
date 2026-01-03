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
  const response = await api.get(`${API_URL}/plans`);
  return response.data;
};

// Get current subscription
export const getCurrentSubscription = async () => {
  const response = await api.get(`${API_URL}/current`, getAuthHeaders());
  return response.data;
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
  const response = await api.post(
    `${API_URL}/create-checkout-session`,
    { planSlug },
    getAuthHeaders()
  );
  return response.data;
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
