import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import tradeSubscriptionService from '../../services/tradeSubscriptionService';
import './TradeSubscriptionSuccessPage.css';

const TradeSubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No payment session found');
        setLoading(false);
        return;
      }

      console.log('Verifying payment for session:', sessionId);

      // Verify payment with backend
      const response = await tradeSubscriptionService.verifyPayment(sessionId);
      
      if (response.success) {
        setSubscription(response.subscription);
        console.log('Payment verified successfully:', response.subscription);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/trade/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="trade-subscription-success-page">
        <div className="success-container">
          <div className="spinner"></div>
          <h2>Verifying your payment...</h2>
          <p>Please wait while we activate your subscription</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trade-subscription-success-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate('/trade/subscription')}
            className="retry-button"
          >
            Return to Subscription Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-subscription-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your subscription has been activated successfully
        </p>

        {subscription && (
          <div className="subscription-details">
            <h3>Subscription Details</h3>
            <div className="detail-row">
              <span className="label">Plan:</span>
              <span className="value">{subscription.plan?.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-active">{subscription.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Listings Limit:</span>
              <span className="value">
                {subscription.listingsLimit === -1 ? 'Unlimited' : subscription.listingsLimit}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Next Billing Date:</span>
              <span className="value">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        <div className="redirect-message">
          <p>Redirecting to your dashboard in 3 seconds...</p>
          <button 
            onClick={() => navigate('/trade/dashboard')}
            className="dashboard-button"
          >
            Go to Dashboard Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeSubscriptionSuccessPage;
