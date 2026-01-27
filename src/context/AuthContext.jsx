import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const token = authService.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // First try to get user from localStorage (instant load)
        const localUser = authService.getCurrentUser();
        if (localUser) {
          setUser(localUser);
          setLoading(false);
          
          // Then verify with backend in background (don't block UI)
          authService.getMe()
            .then(response => {
              if (response.success && response.data.user) {
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
              }
            })
            .catch(error => {
              console.error('Background user verification failed:', error);
              // Only logout if it's a 401 error (invalid token)
              // Don't logout on network errors or other issues
              if (error.response?.status === 401 || error.status === 401) {
                console.warn('Token is invalid - logging out');
                authService.logout();
                setUser(null);
              }
            });
        } else {
          // No user in localStorage but token exists - fetch from backend
          try {
            const response = await authService.getMe();
            if (response.success && response.data.user) {
              const userData = response.data.user;
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            } else {
              authService.logout();
              setUser(null);
            }
          } catch (error) {
            console.error('Failed to fetch user from backend:', error);
            // Only logout on 401, not on network errors
            if (error.response?.status === 401 || error.status === 401) {
              authService.logout();
              setUser(null);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials.email, credentials.password);
      if (data.success && data.data.user) {
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData.email, userData.password, userData.name);
      if (data.success && data.data.user) {
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      console.error('Register error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setAuthToken = async (token) => {
    localStorage.setItem('token', token);
    try {
      const response = await authService.getMe();
      if (response.success && response.data.user) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user after token set:', error);
      authService.logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setAuthToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
