import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './AdvertPaymentSuccessPage.css';

const AdvertPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState(null);
  const [error, setError] = useState(null);
  const [isCompletingTest, setIsCompletingTest] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  const packageName = searchParams.get('package');
  const advertId = searchParams.get('advertId');

  useEffect(() => {
    if (sessionId) {
      fetchPurchaseDetails();
      // AUTO-COMPLETE: Automatically activate car after payment success
      // This bypasses webhook requirement for now
      autoCompletePurchase();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const autoCompletePurchase = async () => {
    try {
      console.log('🚀 Auto-completing purchase for session:', sessionId);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Wait a bit for purchase record to be created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`${API_BASE_URL}/payments/auto-complete-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Purchase auto-completed successfully!');
      } else {
        console.warn('⚠️ Auto-complete failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error auto-completing purchase:', error);
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
    navigate('/find-your-car');
  };

  const handleViewPricing = () => {
    navigate('/sell-my-car/advertising-prices');
  };

  const handleCompleteTestPayment = async () => {
    if (!purchaseData?._id) {
      alert('Purchase ID not found');
      return;
    }

    try {
      setIsCompletingTest(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/payments/test-complete-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseId: purchaseData._id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Test payment completed! Car created successfully.');
        // Refresh purchase data
        await fetchPurchaseDetails();
        
        // Navigate to my listings after 2 seconds
        setTimeout(() => {
          navigate('/my-listings');
        }, 2000);
      } else {
        alert('Failed to complete test payment: ' + data.error);
      }
    } catch (error) {
      console.error('Error completing test payment:', error);
      alert('Error completing test payment');
    } finally {
      setIsCompletingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="advert-payment-success-page">
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
    <div className="advert-payment-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="#4CAF50">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Your {packageName || 'advertising package'} has been purchased successfully.
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
              <li>Create your car advertisement with photos and details</li>
              <li>Your listing will go live immediately after submission</li>
              <li>You'll receive email notifications for buyer inquiries</li>
              <li>Track your ad performance in your dashboard</li>
            </ul>
          </div>

          <div className="action-buttons">
            {purchaseData?.paymentStatus === 'pending' && (
              <button 
                className="test-button" 
                onClick={handleCompleteTestPayment}
                disabled={isCompletingTest}
                style={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isCompletingTest ? 'not-allowed' : 'pointer',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                {isCompletingTest ? 'Completing...' : '🧪 Complete Test Payment & Create Car'}
              </button>
            )}
            <button className="primary-button" onClick={handleCreateAd}>
              Create Your Ad Now
            </button>
            <button className="secondary-button" onClick={handleViewPricing}>
              View Pricing
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

export default AdvertPaymentSuccessPage;
