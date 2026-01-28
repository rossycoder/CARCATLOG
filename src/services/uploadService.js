import api from './api';

/**
 * Upload single image to Cloudinary via backend
 * @param {string} imageData - Base64 encoded image
 * @param {string} advertId - Optional advert ID for folder organization
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (imageData, advertId = null) => {
  try {
    const response = await api.post('/upload/image', {
      image: imageData,
      advertId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary via backend
 * @param {Array<string>} images - Array of base64 encoded images
 * @param {string} advertId - Optional advert ID for folder organization
 * @returns {Promise<Object>} Upload results
 */
export const uploadMultipleImages = async (images, advertId = null) => {
  try {
    const response = await api.post('/upload/images', {
      images,
      advertId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await api.delete(`/upload/image/${encodeURIComponent(publicId)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Convert File to base64 string
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  fileToBase64
};
