/**
 * Safely format a date to UK format
 * @param {string|Date|null|undefined} dateValue - Date value to format
 * @param {string} fallback - Fallback text if date is invalid (default: 'Not available')
 * @returns {string} Formatted date or fallback text
 */
export const formatDateUK = (dateValue, fallback = 'Not available') => {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`);
      return fallback;
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Safely format a date to short UK format (DD/MM/YYYY)
 * @param {string|Date|null|undefined} dateValue - Date value to format
 * @param {string} fallback - Fallback text if date is invalid (default: 'Not available')
 * @returns {string} Formatted date or fallback text
 */
export const formatDateShortUK = (dateValue, fallback = 'Not available') => {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`);
      return fallback;
    }

    return date.toLocaleDateString('en-GB');
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Check if a date value is valid
 * @param {string|Date|null|undefined} dateValue - Date value to check
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
