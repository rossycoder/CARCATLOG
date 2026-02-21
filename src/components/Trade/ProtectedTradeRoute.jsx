import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTradeDealerContext } from '../../context/TradeDealerContext';

const ProtectedTradeRoute = ({ children, requireSubscription = false }) => {
  const { isAuthenticated, subscription, loading, isLoadingSubscription, refreshDealer } = useTradeDealerContext();
  const location = useLocation();

  // Refresh subscription data when entering routes that require subscription
  useEffect(() => {
    if (isAuthenticated && requireSubscription) {
      // Always refresh dealer data when entering protected routes that require subscription
      // This ensures we have the latest subscription status
      refreshDealer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAuthenticated, requireSubscription]); // Removed refreshDealer from deps to prevent infinite loop

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/trade/login" replace />;
  }

  // Show loading while subscription is being fetched for routes that require it
  if (requireSubscription && isLoadingSubscription) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading subscription...</div>
      </div>
    );
  }

  // Check subscription requirement for certain routes
  if (requireSubscription && !subscription) {
    // Redirect to subscription page if trying to access inventory/analytics without subscription
    return <Navigate to="/trade/subscription" replace state={{ message: 'Please subscribe to access this feature' }} />;
  }

  // If dealer has subscription but tries to access subscription selection page, redirect to dashboard
  if (subscription && location.pathname === '/trade/subscription') {
    return <Navigate to="/trade/dashboard" replace />;
  }

  return children;
};

export default ProtectedTradeRoute;
