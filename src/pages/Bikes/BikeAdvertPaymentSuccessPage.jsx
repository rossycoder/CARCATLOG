import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './BikeAdvertPaymentSuccessPage.css';

const BikeAdvertPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState(null);
  const [error, setError] = useState(null);
  
  const sessionId = searchParams.get('session_id');
  const packageName = searchParams.get('package');
  const advertId = searchParams.get('advertId');

  useEffect(() => {
    if (sessionId) {
      fetchPurchaseDetails();
    } else {
      setIsLoading(false);
    }
    
    // Auto-activate bike if advertId is present (fallback for webhook)
    if (advertId && sessionId) {
      activateBikeFromPayment();
    }
  }, [sessionId, advertId]);

  const activateBikeFromPayment = async () => {
    try {
      console.log('🔄 Attempting to activate bike from payment success page...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/bikes/activate-from-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          advertId,
          sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Bike activated successfully:', data.data);
      } else {
        console.warn('⚠️  Bike activation failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Error activating bike:', err);
      // Don't show error to user - webhook might have already activated it
    }
  };

  const fetchPurchaseDetails = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/payments/purchase/${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setPurchaseData(data.data);
        console.log('Purchase details loaded:', data.data);
      } else {
        console.error('Failed to load purchase details:', data.error);
      }
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      setError('Could not load purchase details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAd = () => {
    navigate('/bikes/sell-your-bike');
  };

  const handleViewBikes = () => {
    navigate('/bikes');
  };

  if (isLoading) {
    return (
      <div className="bike-advert-payment-success-page">
        <div className="container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bike-advert-payment-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="#4CAF50">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Your {packageName || 'bike advertising package'} has been purchased successfully.
          </p>
          
          <div className="payment-details">
            <div className="detail-row">
              <span className="label">Transaction ID:</span>
              <span className="value">{sessionId?.substring(0, 20)}...</span>
            </div>
            <div className="detail-row">
              <span className="label">Package:</span>
              <span className="value">{purchaseData?.packageName || packageName || 'Advertising Package'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Duration:</span>
              <span className="value">{purchaseData?.duration || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount Paid:</span>
              <span className="value">{purchaseData?.amountFormatted || 'N/A'}</span>
            </div>
            {purchaseData?.registration && (
              <div className="detail-row">
                <span className="label">Vehicle:</span>
                <span className="value">{purchaseData.registration}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-paid">{purchaseData?.packageStatus === 'active' ? 'Active' : 'Paid'}</span>
            </div>
            {purchaseData?.expiresAt && (
              <div className="detail-row">
                <span className="label">Expires:</span>
                <span className="value">{new Date(purchaseData.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="next-steps">
            <h2>What's Next?</h2>
            <ul>
              <li>Your listing will go live shortly</li>
              <li>You can edit your listing at any time</li>
              <li>You'll receive email notifications for buyer enquiries</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button className="primary-button" onClick={() => navigate('/my-listings')}>
              View My Ad
            </button>
          </div>

          <div className="support-info">
            <p>Need help? Contact our support team at support@carcatalog.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeAdvertPaymentSuccessPage;
