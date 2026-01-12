import api from './api';
import { getToken } from './tradeDealerService';

const API_URL = '/trade/inventory';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

/**
 * Trade Inventory Service
 * Handles all inventory management operations
 */

// Get all inventory
export const getInventory = async (params = {}) => {
  const response = await api.get(API_URL, {
    ...getAuthHeaders(),
    params
  });
  return response.data;
};

// Get inventory stats
export const getStats = async () => {
  const response = await api.get(`${API_URL}/stats`, getAuthHeaders());
  return response.data;
};

// Get single vehicle
export const getVehicle = async (id) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// Create vehicle
export const createVehicle = async (vehicleData) => {
  const response = await api.post(API_URL, vehicleData, getAuthHeaders());
  return response.data;
};

// Update vehicle
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`${API_URL}/${id}`, vehicleData, getAuthHeaders());
  return response.data;
};

// Delete vehicle
export const deleteVehicle = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// Mark as sold
export const markAsSold = async (id) => {
  const response = await api.patch(`${API_URL}/${id}/sold`, {}, getAuthHeaders());
  return response.data;
};

// Publish vehicle from sell flow (bypasses payment for trade dealers)
export const publishVehicle = async (vehicleData) => {
  const response = await api.post(`${API_URL}/publish`, vehicleData, getAuthHeaders());
  return response.data;
};

// Get bike inventory for trade dealer
export const getBikeInventory = async (params = {}) => {
  const response = await api.get('/bikes/dealer', {
    ...getAuthHeaders(),
    params
  });
  return response.data;
};

// Publish bike from sell flow (bypasses payment for trade dealers)
export const publishBike = async (bikeData) => {
  const response = await api.post('/bikes/publish', bikeData, getAuthHeaders());
  return response.data;
};

// Delete bike
export const deleteBike = async (id) => {
  const response = await api.delete(`/bikes/${id}`, getAuthHeaders());
  return response.data;
};

// Get van inventory for trade dealer
export const getVanInventory = async (params = {}) => {
  const response = await api.get('/vans/dealer', {
    ...getAuthHeaders(),
    params
  });
  return response.data;
};

// Publish van from sell flow (bypasses payment for trade dealers)
export const publishVan = async (vanData) => {
  const response = await api.post('/vans/publish', vanData, getAuthHeaders());
  return response.data;
};

// Delete van
export const deleteVan = async (id) => {
  const response = await api.delete(`/vans/${id}`, getAuthHeaders());
  return response.data;
};

// Alias for createVehicle
export const addVehicle = createVehicle;

export default {
  getInventory,
  getStats,
  getVehicle,
  createVehicle,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  markAsSold,
  publishVehicle,
  getBikeInventory,
  publishBike,
  deleteBike,
  getVanInventory,
  publishVan,
  deleteVan
};
