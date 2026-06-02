import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTradeDealerContext } from '../context/TradeDealerContext';

const ProtectedRoute = ({ children, requireEmailVerification = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { dealer, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const location = useLocation();

  const isTradeDealer = isTradeAuthenticated && !!dealer;

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Allow trade dealers through without requiring regular user auth
  if (isTradeDealer) {
    return children;
  }

  if (!isAuthenticated) {
    // Store the current location to redirect back after login
    localStorage.setItem('redirectAfterAuth', location.pathname);
    return <Navigate to="/signin" replace />;
  }

  if (requireEmailVerification && !user?.isEmailVerified) {
    // Store the current location to redirect back after verification
    localStorage.setItem('redirectAfterVerification', location.pathname);
    return <Navigate to="/verify-email-required" replace />;
  }

  return children;
};

export default ProtectedRoute;