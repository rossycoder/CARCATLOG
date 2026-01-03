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
      if (token) {
        const data = await tradeDealerService.getCurrentDealer();
        if (data.success) {
          setDealer(data.dealer);
          setSubscription(data.subscription);
          // Store subscription in localStorage for persistence
          if (data.subscription) {
            localStorage.setItem('tradeSubscription', JSON.stringify(data.subscription));
          } else {
            localStorage.removeItem('tradeSubscription');
          }
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await tradeDealerService.login(email, password);
    if (data.success) {
      setDealer(data.dealer);
      setIsAuthenticated(true);
      
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
