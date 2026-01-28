/**
 * Utility to clear authentication storage
 * Use this when you encounter 403 errors
 */

export const clearAuthStorage = () => {
  // Clear all auth-related items from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('tradeToken');
  localStorage.removeItem('user');
  localStorage.removeItem('dealer');
  
  // Clear sessionStorage
  sessionStorage.clear();
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const debugAuthState = () => {
  if (process.env.NODE_ENV === 'development') {
    // Only log in development
    return {
      token: localStorage.getItem('token') ? 'Present' : 'None',
      tradeToken: localStorage.getItem('tradeToken') ? 'Present' : 'None',
      user: localStorage.getItem('user') ? 'Present' : 'None',
      dealer: localStorage.getItem('dealer') ? 'Present' : 'None'
    };
  }
};

// Make available in browser console for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clearAuthStorage = clearAuthStorage;
  window.clearAllStorage = clearAllStorage;
  window.debugAuthState = debugAuthState;
}

export default {
  clearAuthStorage,
  clearAllStorage,
  debugAuthState
};
