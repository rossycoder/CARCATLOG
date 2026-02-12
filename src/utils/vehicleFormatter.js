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
 * Shows the complete derivative/trim information in AutoTrader format
 * Format: "EngineSize Variant BodyStyle" for ICE vehicles
 * Format: "Variant BodyStyle" for electric vehicles
 * Example: "1.6 TDI S 5dr" or "M50 5dr" (BMW i4 M50)
 * 
 * @param {object} vehicle - Vehicle data object
 * @returns {string} - Formatted variant
 */
export const generateVariantDisplay = (vehicle) => {
  const parts = [];
  
  // Engine size (without 'L' suffix for AutoTrader style) - only for non-electric
  if (vehicle.engineSize && vehicle.fuelType !== 'Electric') {
    const size = parseFloat(vehicle.engineSize);
    if (!isNaN(size)) {
      parts.push(size.toFixed(1));
    }
  }
  
  // Variant/trim - this should contain fuel type + trim (e.g., "TDI S" or "320d M Sport" or "M50")
  if (vehicle.variant && 
      vehicle.variant !== 'null' && 
      vehicle.variant !== 'undefined' && 
      vehicle.variant !== vehicle.fuelType &&
      vehicle.variant.trim() !== '') {
    parts.push(vehicle.variant);
  } else if (vehicle.submodel && 
             vehicle.submodel !== 'null' && 
             vehicle.submodel !== 'undefined' && 
             vehicle.submodel !== vehicle.fuelType &&
             vehicle.submodel.trim() !== '') {
    // Use submodel if available and different from fuel type
    parts.push(vehicle.submodel);
  } else {
    // Fallback: build from fuel type if no variant (but not for electric)
    // Only add fuel type if it's not already obvious from engine size
    if (vehicle.fuelType && vehicle.fuelType !== 'Petrol' && vehicle.fuelType !== 'Electric') {
      parts.push(vehicle.fuelType);
    }
  }
  
  // Body style - convert to AutoTrader format (e.g., "5dr", "4dr", "Estate")
  if (vehicle.doors) {
    parts.push(`${vehicle.doors}dr`);
  } else if (vehicle.bodyType) {
    // Map body types to short form
    const bodyType = vehicle.bodyType.toLowerCase();
    if (bodyType.includes('hatchback') && vehicle.doors) {
      parts.push(`${vehicle.doors}dr`);
    } else if (bodyType.includes('saloon') || bodyType.includes('sedan')) {
      parts.push('Saloon');
    } else if (bodyType.includes('estate')) {
      parts.push('Estate');
    } else if (bodyType.includes('coupe')) {
      parts.push('Coupe');
    } else if (bodyType.includes('convertible') || bodyType.includes('cabriolet')) {
      parts.push('Convertible');
    } else if (bodyType.includes('suv')) {
      parts.push('SUV');
    }
  }
  
  return parts.join(' ');
};

/**
 * Extract town/city name from location string
 * Removes postcodes and extra descriptors like "unparished area"
 * @param {string} locationName - Full location string from API
 * @returns {string} Clean town/city name
 */
export const extractTownName = (locationName) => {
  if (!locationName) return '';
  
  // Remove "unparished area" and similar descriptors
  let cleanName = locationName
    .replace(/,?\s*unparished area/gi, '')
    .replace(/,?\s*\(unparished area\)/gi, '')
    .trim();
  
  // Split by comma to get parts
  const parts = cleanName.split(',').map(part => part.trim());
  
  // Remove parts that look like postcodes (e.g., SS11TH, SS1 1TH)
  const cleanParts = parts.filter(part => {
    // Skip if it looks like a postcode (alphanumeric with optional space)
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}$/i.test(part)) {
      return false;
    }
    // Skip if it's just a postcode without space (e.g., SS11TH)
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/i.test(part)) {
      return false;
    }
    // Skip empty parts
    if (!part) {
      return false;
    }
    return true;
  });
  
  // Return the first clean part (usually the town/city name)
  return cleanParts[0] || locationName;
};

export default {
  formatEngineSize,
  generateDisplayTitle,
  generateSubtitle,
  generateVariantDisplay,
  extractTownName
};

/**
 * Format color to proper case (Title Case)
 * Converts "GREY" to "Grey", "BLUE" to "Blue", etc.
 * Handles multi-word colors like "DARK BLUE" to "Dark Blue"
 * 
 * @param {string} color - Color string from database
 * @returns {string} - Formatted color in proper case
 */
export const formatColor = (color) => {
  if (!color || 
      color === 'Not specified' || 
      color === 'null' || 
      color === 'undefined' || 
      typeof color !== 'string' ||
      color.trim() === '') {
    return 'Not specified';
  }
  
  // Convert to proper case (Title Case)
  return color
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
