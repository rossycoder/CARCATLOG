import { createContext, useState, useContext, useEffect } from 'react';
import * as tradeDealerService from '../services/tradeDealerService';
import * as tradeSubscriptionService from '../services/tradeSubscriptionService';

const TradeDealerContext = createContext();

export const useTradeDealerContext = () => {
  const context = useContext(TradeDealerContext);
  if (context === undefined) {
    throw new Error('useTradeDealerContext must be used within TradeDealerProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useTradeDealer = useTradeDealerContext;

export const TradeDealerProvider = ({ children }) => {
  const [dealer, setDealer] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tradeDealerService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Try to get dealer from localStorage first (instant load)
      const localDealer = localStorage.getItem('tradeDealer');
      const localSubscription = localStorage.getItem('tradeSubscription');
      
      if (localDealer) {
        try {
          setDealer(JSON.parse(localDealer));
          if (localSubscription) {
            setSubscription(JSON.parse(localSubscription));
          }
          setIsAuthenticated(true);
          setLoading(false);
          
          // Verify with backend in background
          tradeDealerService.getCurrentDealer()
            .then(data => {
              if (data.success) {
                setDealer(data.dealer);
                setSubscription(data.subscription);
                if (data.subscription) {
                  localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
                } else {
                  localStorage.removeItem('tradeSubscription');
                }
              }
            })
            .catch(error => {
              console.error('Background dealer verification failed:', error);
              // Only logout on 401 (invalid token)
              if (error.response?.status === 401 || error.status === 401) {
                console.warn('Trade token is invalid - logging out');
                logout();
              }
            });
        } catch (e) {
          console.error('Failed to parse local dealer data:', e);
          // Fetch from backend if local data is corrupted
          const data = await tradeDealerService.getCurrentDealer();
          if (data.success) {
            setDealer(data.dealer);
            setSubscription(data.subscription);
            if (data.subscription) {
              localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
            }
            setIsAuthenticated(true);
          } else {
            logout();
          }
          setLoading(false);
        }
      } else {
        // No local dealer data - fetch from backend
        const data = await tradeDealerService.getCurrentDealer();
        if (data.success) {
          setDealer(data.dealer);
          setSubscription(data.subscription);
          if (data.subscription) {
            localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
          }
          setIsAuthenticated(true);
        } else {
          logout();
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only logout on 401, not on network errors
      if (error.response?.status === 401 || error.status === 401) {
        logout();
      }
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await tradeDealerService.login(email, password);
    if (data.success) {
      setDealer(data.dealer);
      setIsAuthenticated(true);
      
      // Store dealer in localStorage for persistence
      localStorage.setItem('tradeDealer', JSON.stringify(data.dealer));
      
      // Set subscription from login response
      if (data.subscription) {
        setSubscription(data.subscription);
        localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
      } else {
        setSubscription(null);
        localStorage.removeItem('tradeSubscription');
      }
    }
    return data;
  };

  const register = async (dealerData) => {
    const data = await tradeDealerService.register(dealerData);
    return data;
  };

  const logout = () => {
    tradeDealerService.logout();
    setDealer(null);
    setSubscription(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tradeDealer');
    localStorage.removeItem('tradeSubscription');
  };

  const refreshSubscription = async () => {
    try {
      const data = await tradeSubscriptionService.getCurrentSubscription();
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  };

  const refreshDealer = async () => {
    setIsLoadingSubscription(true);
    try {
      const data = await tradeDealerService.getCurrentDealer();
      if (data.success) {
        setDealer(data.dealer);
        // Use subscription data from getCurrentDealer endpoint (includes subscription)
        if (data.subscription) {
          setSubscription(data.subscription);
          // Also store in localStorage for persistence
          localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
        } else {
          setSubscription(null);
          localStorage.removeItem('tradeSubscription');
        }
      }
    } catch (error) {
      console.error('Failed to refresh dealer:', error);
      setSubscription(null);
      localStorage.removeItem('tradeSubscription');
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const value = {
    dealer,
    subscription,
    loading,
    isLoadingSubscription,
    isAuthenticated,
    login,
    register,
    logout,
    refreshSubscription,
    refreshDealer
  };

  return (
    <TradeDealerContext.Provider value={value}>
      {children}
    </TradeDealerContext.Provider>
  );
};

export default TradeDealerContext;
