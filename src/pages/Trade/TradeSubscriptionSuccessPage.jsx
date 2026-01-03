
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import tradeSubscriptionService from '../../services/tradeSubscriptionService';
import './TradeSubscriptionSuccessPage.css';

const TradeSubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshDealer } = useTradeDealerContext();

  useEffect(() => {
    verifyAndRedirect();
  }, []);

  const verifyAndRedirect = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        navigate('/trade/dashboard', { replace: true });
        return;
      }

      // Verify payment with backend
      const verifyResponse = await tradeSubscriptionService.verifyPayment(sessionId);
      
      if (!verifyResponse.success) {
        throw new Error('Payment verification failed');
      }

      // Wait a moment for webhook to process (if needed)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Refresh dealer context to get updated subscription
      // This will fetch both dealer and subscription data atomically
      await refreshDealer();
      
      // Wait a bit more to ensure subscription is set in context
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard with success message
      navigate('/trade/dashboard', { 
        state: { message: '🎉 Subscription activated! You can now start adding vehicles to your inventory.' },
        replace: true
      });
    } catch (err) {
      console.error('Error verifying subscription:', err);
      
      // Even on error, go to dashboard and let it fetch fresh data
      // This ensures dealers can still access their dashboard
      navigate('/trade/dashboard', { 
        state: { message: 'Subscription processing. Please refresh if you don\'t see your plan.' },
        replace: true 
      });
    }
  };

  // Show loading while verifying and redirecting
  return (
    <div className="trade-success-page">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Activating your subscription...</p>
        <p style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default TradeSubscriptionSuccessPage;
