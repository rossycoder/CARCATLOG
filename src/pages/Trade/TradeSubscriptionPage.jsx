import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import tradeSubscriptionService from '../../services/tradeSubscriptionService';
import './TradeSubscriptionPage.css';

// FIXED: Infinite loop and loading issues - Version 2.1
const TradeSubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dealer } = useTradeDealerContext();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    fetchPlansAndSubscription();
  }, []); // Only fetch once on mount

  useEffect(() => {
    // Check for welcome message from navigation state
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      // Clear the message after showing it
      setTimeout(() => setWelcomeMessage(''), 5000);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]); // Only when message changes

  const fetchPlansAndSubscription = async () => {
    try {
      console.log('🔵 Fetching plans and subscription...');
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        tradeSubscriptionService.getPlans(),
        tradeSubscriptionService.getCurrentSubscription()
      ]);
      
      console.log('✅ Plans received:', plansData);
      console.log('✅ Subscription received:', subscriptionData);
      
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      console.error('❌ Error fetching subscription data:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const handleSelectPlan = async (planSlug) => {
    try {
      console.log('🔵 Starting plan selection:', planSlug);
      setLoading(true);
      setError(null);

      // Create checkout session
      console.log('🔵 Calling createCheckoutSession...');
      const response = await tradeSubscriptionService.createCheckoutSession(planSlug);
      console.log('🔵 Response received:', response);
      
      if (response.success) {
        // Check if we got a Stripe URL (production) or direct activation (development)
        if (response.url) {
          // Production: Redirect to Stripe checkout
          console.log('✅ Redirecting to Stripe checkout:', response.url);
          window.location.href = response.url;
          // Don't set loading to false - we're redirecting
        } else if (response.subscription) {
          // Development: Direct activation
          console.log('✅ Subscription activated directly:', response.subscription);
          alert(`${response.message}\n\nYou can now access your dashboard and start listing vehicles!`);
          
          // Refresh subscription data
          await fetchPlansAndSubscription();
          
          // Navigate to dashboard
          navigate('/trade/dashboard');
        } else {
          console.error('❌ Unexpected response format:', response);
          setError('Unexpected response from server. Please try again.');
          setLoading(false);
        }
      } else {
        console.error('❌ Request failed:', response.message);
        setError(response.message || 'Failed to activate subscription');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error selecting plan:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Failed to activate subscription. Please try again.');
      setLoading(false);
    }
  };

  const formatPrice = (priceInPence) => {
    return `£${(priceInPence / 100).toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="trade-subscription-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trade-subscription-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPlansAndSubscription} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-subscription-page">
      {welcomeMessage && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto 20px'
        }}>
          {welcomeMessage}
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto 20px'
        }}>
          {error}
        </div>
      )}
      
      {/* If user already has active subscription (including trial), redirect to dashboard */}
      {currentSubscription && (currentSubscription.status === 'active' || currentSubscription.status === 'trialing') ? (
        <div className="subscription-header">
          <h1>You're All Set!</h1>
          <p>Your subscription is active. Start listing your vehicles now!</p>
          
          {currentSubscription.isTrialing && (
            <div className="trial-offer-banner">
              <div className="trial-icon">🎉</div>
              <div className="trial-content">
                <h3>30-Day FREE Trial Active!</h3>
                <p>{currentSubscription.trialDaysLeft || 0} days remaining</p>
                <p className="trial-details">Only £2.50 per car during trial • Full charge starts after trial ends</p>
              </div>
            </div>
          )}
          
          <button 
            className="continue-dashboard-btn"
            onClick={() => navigate('/trade/dashboard')}
          >
            Go to Dashboard →
          </button>
        </div>
      ) : (
        <>
          <div className="subscription-header">
            <h1>Welcome{dealer?.dealershipName ? `, ${dealer.dealershipName}` : ''}!</h1>
            <p>Choose your subscription package - Start with 30 days FREE trial</p>
            
            {/* 30-Day Free Trial Banner */}
            <div className="trial-offer-banner">
              <div className="trial-icon">🎉</div>
              <div className="trial-content">
                <h3>30-Day FREE Trial on All Packages!</h3>
                <p><strong>How it works:</strong></p>
                <ul className="trial-steps">
                  <li>✓ Choose your package below (Bronze, Silver, or Gold)</li>
                  <li>✓ Enter your card details (you won't be charged the full amount yet)</li>
                  <li>✓ Start listing immediately - Pay only £2.50 per car during trial</li>
                  <li>✓ After 30 days, your chosen package activates at full price</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="subscription-plans-grid">
        {/* BRONZE PLAN */}
        <div className="subscription-plan-card bronze">
          <div className="plan-header bronze-header">
            <h2>BRONZE Package</h2>
          </div>
          
          <div className="plan-content">
            <div className="plan-price">
              <h3>Monthly Price:</h3>
              <p className="price-amount">£1000</p>
              <p className="vat-text">+ VAT</p>
              <p className="trial-pricing">During 30-day trial: Only £2.50 per car</p>
            </div>

            <div className="plan-summary">
              <p><strong>Summary:</strong> Our Bronze Subscription lets you list up to 20 cars.</p>
            </div>

            <div className="plan-features">
              <h4>What's Included:</h4>
              <ul>
                <li>Attract buyers – Display your vehicle's best features with upto 100 photos</li>
                <li>Attach a YouTube video for each vehicle to boost sales</li>
                <li>We will provide your listing with a free basic HPI check & MOT status</li>
                <li>A designated login area with a dealer dashboard to manage & update your stock</li>
                <li>Unlimited listing alterations to keep your ads upto date</li>
              </ul>
            </div>

            <button 
              className="select-plan-button bronze-button"
              onClick={() => handleSelectPlan('bronze')}
              disabled={loading || currentSubscription?.plan?.slug === 'bronze'}
            >
              {loading ? 'Processing...' : currentSubscription?.plan?.slug === 'bronze' ? 'Current Plan' : 'Select BRONZE Package'}
            </button>
          </div>
        </div>

        {/* SILVER PLAN */}
        <div className="subscription-plan-card silver">
          <div className="plan-header silver-header">
            <h2>SILVER Package</h2>
          </div>
          
          <div className="plan-content">
            <div className="plan-price">
              <h3>Monthly Price:</h3>
              <p className="price-amount">£1500</p>
              <p className="vat-text">+ VAT</p>
              <p className="trial-pricing">During 30-day trial: Only £2.50 per car</p>
            </div>

            <div className="plan-summary">
              <p><strong>Summary:</strong> Our Silver Subscription lets you list up to 35 cars.</p>
            </div>

            <div className="plan-features">
              <h4>What's Included:</h4>
              <ul>
                <li>Attract buyers – Display your vehicle's best features with upto 100 photos</li>
                <li>Attach a YouTube video for each vehicle to boost sales</li>
                <li>We will provide your listing with a free basic HPI check & MOT status</li>
                <li>A designated login area with a dealer dashboard to manage & update your stock</li>
                <li>Unlimited listing alterations to keep your ads upto date</li>
              </ul>
            </div>

            <button 
              className="select-plan-button silver-button"
              onClick={() => handleSelectPlan('silver')}
              disabled={loading || currentSubscription?.plan?.slug === 'silver'}
            >
              {loading ? 'Processing...' : currentSubscription?.plan?.slug === 'silver' ? 'Current Plan' : 'Select SILVER Package'}
            </button>
          </div>
        </div>

        {/* GOLD PLAN */}
        <div className="subscription-plan-card gold">
          <div className="plan-header gold-header">
            <h2>GOLD Package</h2>
          </div>
          
          <div className="plan-content">
            <div className="plan-price">
              <h3>Monthly Price:</h3>
              <p className="price-amount">£2000</p>
              <p className="vat-text">+ VAT</p>
              <p className="trial-pricing">During 30-day trial: Only £2.50 per car</p>
            </div>

            <div className="plan-summary">
              <p><strong>Summary:</strong> Our Gold Subscription has unlimited vehicle listings.</p>
            </div>

            <div className="plan-features">
              <h4>What's Included:</h4>
              <ul>
                <li>Attract buyers – Display your vehicle's best features with upto 100 photos</li>
                <li>Attach a YouTube video for each vehicle to boost sales</li>
                <li>We will provide your listing with a free basic HPI check & MOT status</li>
                <li>A designated login area with a dealer dashboard to manage & update your stock</li>
                <li>Unlimited listing alterations to keep your ads upto date</li>
              </ul>
            </div>

            <button 
              className="select-plan-button gold-button"
              onClick={() => handleSelectPlan('gold')}
              disabled={loading || currentSubscription?.plan?.slug === 'gold'}
            >
              {loading ? 'Processing...' : currentSubscription?.plan?.slug === 'gold' ? 'Current Plan' : 'Select GOLD Package'}
            </button>
          </div>
        </div>

        {/* End of plans grid */}
      </div>
        </>
      )}

      {!currentSubscription && currentSubscription?.status !== 'active' && currentSubscription?.status !== 'trialing' && (
        <div className="current-subscription-info">
          <h3>Your Current Subscription</h3>
          <div className="subscription-details">
            <p><strong>Plan:</strong> {currentSubscription.plan?.name}</p>
            <p><strong>Status:</strong> {currentSubscription.status}</p>
            <p><strong>Listings Used:</strong> {currentSubscription.listingsUsed} / {currentSubscription.listingsLimit || 'Unlimited'}</p>
            <p><strong>Next Billing Date:</strong> {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeSubscriptionPage;
