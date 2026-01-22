/**
 * Vehicle Formatter Utility
 * AutoTrader-compliant formatting for vehicle data
 */

/**
 * Format engine size for display
 * @param {number} engineSize - Engine size in litres
 * @returns {string} - Formatted string (e.g., "2.0L")
 */
export const formatEngineSize = (engineSize) => {
  if (!engineSize || engineSize === 0) return '';
  
  // Ensure it's a number
  const size = parseFloat(engineSize);
  if (isNaN(size)) return '';
  
  // Format with 1 decimal place
  return `${size.toFixed(1)}L`;
};

/**
 * Generate AutoTrader-style display title
 * Format: "Make Model EngineSize Variant Transmission"
 * Example: "BMW 3 Series 2.0L 320d M Sport Manual"
 * 
 * @param {object} vehicle - Vehicle data object
 * @returns {string} - Formatted display title
 */
export const generateDisplayTitle = (vehicle) => {
  // If backend already sent displayTitle, use it
  if (vehicle.displayTitle) {
    return vehicle.displayTitle;
  }
  
  const parts = [];
  
  // Make (required)
  if (vehicle.make) {
    parts.push(vehicle.make);
  }
  
  // Model (required)
  if (vehicle.model) {
    parts.push(vehicle.model);
  }
  
  // Engine size with L suffix
  if (vehicle.engineSize) {
    const formatted = formatEngineSize(vehicle.engineSize);
    if (formatted) parts.push(formatted);
  }
  
  // Variant (trim) - prefer variant over submodel
  if (vehicle.variant && vehicle.variant !== 'null' && vehicle.variant !== 'undefined' && vehicle.variant.trim() !== '') {
    parts.push(vehicle.variant);
  } else if (vehicle.submodel && vehicle.submodel !== 'null' && vehicle.submodel !== 'undefined') {
    // Only use submodel if it doesn't contain fuel/transmission keywords
    const submodel = vehicle.submodel.toLowerCase();
    const hasFuelOrTrans = /petrol|diesel|manual|automatic|auto|electric|hybrid/.test(submodel);
    if (!hasFuelOrTrans) {
      parts.push(vehicle.submodel);
    }
  }
  
  // Transmission
  if (vehicle.transmission) {
    const trans = vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1);
    parts.push(trans);
  }
  
  return parts.join(' ');
};

/**
 * Generate subtitle for vehicle card
 * Format: "EngineSize Variant" OR "EngineSize FuelType Transmission"
 * Example: "2.2L i-CTDi Type S GT" OR "2.0L Diesel Manual"
 * 
 * @param {object} vehicle - Vehicle data object
 * @returns {string} - Formatted subtitle
 */
export const generateSubtitle = (vehicle) => {
  const parts = [];
  
  // Engine size
  if (vehicle.engineSize) {
    const formatted = formatEngineSize(vehicle.engineSize);
    if (formatted) parts.push(formatted);
  }
  
  // Variant (if available and clean)
  if (vehicle.variant && vehicle.variant !== 'null' && vehicle.variant !== 'undefined' && vehicle.variant.trim() !== '') {
    parts.push(vehicle.variant);
    return parts.join(' '); // Return early with variant
  }
  
  // Fallback: If no variant, show fuel + transmission
  if (vehicle.fuelType) {
    parts.push(vehicle.fuelType);
  }
  
  if (vehicle.transmission) {
    const trans = vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1);
    parts.push(trans);
  }
  
  return parts.join(' ');
};

/**
 * Generate variant display for detail page
 * Shows the complete derivative/trim information
 * 
 * @param {object} vehicle - Vehicle data object
 * @returns {string} - Formatted variant
 */
export const generateVariantDisplay = (vehicle) => {
  // If we have a variant field, use it (but check it's not "null" string or empty)
  if (vehicle.variant && vehicle.variant !== 'null' && vehicle.variant !== 'undefined' && vehicle.variant.trim() !== '') {
    return vehicle.variant;
  }
  
  // Otherwise build from available data
  const parts = [];
  
  // Engine size
  if (vehicle.engineSize) {
    const formatted = formatEngineSize(vehicle.engineSize);
    if (formatted) parts.push(formatted);
  }
  
  // Submodel (if it's actually a trim, not fuel/transmission)
  if (vehicle.submodel && vehicle.submodel !== 'null' && vehicle.submodel !== 'undefined') {
    const submodel = vehicle.submodel.toLowerCase();
    const hasFuelOrTrans = /petrol|diesel|manual|automatic|auto|electric|hybrid/.test(submodel);
    if (!hasFuelOrTrans) {
      parts.push(vehicle.submodel);
    }
  }
  
  // Fuel type
  if (vehicle.fuelType) {
    parts.push(vehicle.fuelType);
  }
  
  // Transmission
  if (vehicle.transmission) {
    const trans = vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1);
    parts.push(trans);
  }
  
  return parts.join(' ');
};

export default {
  formatEngineSize,
  generateDisplayTitle,
  generateSubtitle,
  generateVariantDisplay
};
