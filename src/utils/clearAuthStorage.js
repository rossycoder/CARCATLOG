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
  
  console.log('✅ Authentication storage cleared');
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ All storage cleared');
};

export const debugAuthState = () => {
  console.log('🔍 Current Auth State:');
  console.log('  Token:', localStorage.getItem('token') ? 'Present' : 'None');
  console.log('  Trade Token:', localStorage.getItem('tradeToken') ? 'Present' : 'None');
  console.log('  User:', localStorage.getItem('user') ? 'Present' : 'None');
  console.log('  Dealer:', localStorage.getItem('dealer') ? 'Present' : 'None');
};

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  window.clearAuthStorage = clearAuthStorage;
  window.clearAllStorage = clearAllStorage;
  window.debugAuthState = debugAuthState;
  
  console.log('🛠️ Auth utilities loaded. Available commands:');
  console.log('  - clearAuthStorage() - Clear auth tokens');
  console.log('  - clearAllStorage() - Clear all storage');
  console.log('  - debugAuthState() - Show current auth state');
}

export default {
  clearAuthStorage,
  clearAllStorage,
  debugAuthState
};
