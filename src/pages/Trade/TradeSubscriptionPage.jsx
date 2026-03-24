import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import tradeSubscriptionService from '../../services/tradeSubscriptionService';
import './TradeSubscriptionPage.css';

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
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      setTimeout(() => setWelcomeMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const fetchPlansAndSubscription = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        tradeSubscriptionService.getPlans(),
        tradeSubscriptionService.getCurrentSubscription()
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planSlug) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeSubscriptionService.createCheckoutSession(planSlug);
      if (response.success) {
        if (response.url) {
          window.location.href = response.url;
        } else if (response.subscription) {
          alert(`${response.message}\n\nYou can now access your dashboard and start listing vehicles!`);
          await fetchPlansAndSubscription();
          navigate('/trade/dashboard');
        } else {
          setError('Unexpected response from server. Please try again.');
          setLoading(false);
        }
      } else {
        setError(response.message || 'Failed to activate subscription');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to activate subscription. Please try again.');
      setLoading(false);
    }
  };

  const formatPrice = (priceInPence) => `£${(priceInPence / 100).toFixed(0)}`;

  // Trial button label per plan
  const getTrialLabel = (plan) => {
    const trialMap = { bronze: '£50', silver: '£87.50', gold: '£150' };
    const amount = trialMap[plan.slug] || '—';
    return `Start today for just ${amount} + VAT`;
  };

  const getButtonLabel = (plan) => {
    const labelMap = { bronze: 'Get Started', silver: 'Start Selling Faster', gold: 'Go Premium' };
    return labelMap[plan.slug] || `Select ${plan.name}`;
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

  if (error && !plans.length) {
    return (
      <div className="trade-subscription-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPlansAndSubscription} className="retry-button">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-subscription-page">

      {welcomeMessage && (
        <div style={{
          padding: '14px 20px', background: '#3b82f6', color: 'white',
          textAlign: 'center', fontSize: '14px'
        }}>
          {welcomeMessage}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 20px', background: '#fef2f2', color: '#b91c1c',
          textAlign: 'center', fontSize: '14px', borderBottom: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {/* Active subscription view */}
      {currentSubscription && (currentSubscription.status === 'active' || currentSubscription.status === 'trialing') ? (
        <div className="subscription-header">
          <h1>You're All Set!</h1>
          <p>Your subscription is active. Start listing your vehicles now!</p>
          {currentSubscription.isTrialing && (
            <div className="trial-offer-banner">
              <div className="trial-content">
                <h3>Trial Period Active!</h3>
                <p>{currentSubscription.trialDaysLeft || 0} days remaining</p>
                <p>Full subscription starts after trial ends</p>
              </div>
            </div>
          )}
          <button className="continue-dashboard-btn" onClick={() => navigate('/trade/dashboard')}>
            Go to Dashboard →
          </button>
        </div>
      ) : (
        <>
          {/* ── Hero ── */}
          <div className="hero-section">
            <h1 className="hero-title">
              Sell More Cars. <span className="blue-text">For Less.</span>
            </h1>
            <p className="hero-subtitle">
              List your vehicles, reach more buyers, and manage your stock<br />
              — all with industry-leading pricing built for dealers.
            </p>

            <div className="hero-buttons">
              <button className="start-trial-btn">Start 30-Day Free Trial</button>
              <button className="compare-plans-btn">Compare Plans</button>
            </div>

            <div className="features-row">
              <div className="feature"><span className="check">✓</span> No hidden fees</div>
              <div className="feature"><span className="check">✓</span> Cancel anytime</div>
              <div className="feature"><span className="check">✓</span> Instant listings</div>
              <div className="feature"><span className="check">✓</span> Built for dealers</div>
            </div>
          </div>

          {/* ── Pricing heading ── */}
          <div className="pricing-section">
            <h2 className="pricing-title">Simple, Transparent Pricing</h2>
            <p className="pricing-subtitle">Start with a 30-day trial on any plan. Upgrade as you grow.</p>
          </div>

          {/* ── Plans ── */}
          <div className="subscription-plans-grid">
            {plans.map((plan) => (
              <div key={plan.slug} className={`subscription-plan-card ${plan.slug}`}>

                <div className={`plan-header ${plan.slug}-header`}>
                  {plan.isPopular && <span className="popular-badge">★ Most Popular</span>}
                  <h2>{plan.name.toUpperCase()}</h2>
                  {plan.slug === 'gold' && (
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>BEST VALUE</div>
                  )}
                </div>

                <div className="plan-content">
                  <div className="plan-price">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#555' }}>£</span>
                      <span className="price-amount">{(plan.price / 100).toFixed(0)}</span>
                      <span style={{ fontSize: '13px', color: '#888', marginLeft: '4px' }}>+ VAT</span>
                    </div>

                    {!currentSubscription?.hasUsedTrial && (
                      <div className="trial-pricing">
                        {getTrialLabel(plan)}
                      </div>
                    )}
                  </div>

                  <div className="plan-features">
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`select-plan-button ${plan.slug}-button`}
                    onClick={() => handleSelectPlan(plan.slug)}
                    disabled={loading || currentSubscription?.plan?.slug === plan.slug}
                  >
                    {loading ? 'Processing...' :
                     currentSubscription?.plan?.slug === plan.slug ? 'Current Plan' :
                     getButtonLabel(plan)}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Admin Fee ── */}
          <div className="admin-info" style={{ marginTop: '20px', marginBottom: '40px' }}>
            <span>ℹ️ Additional Info: A £2.50 admin fee applies per vehicle to cover HPI &amp; MOT checks.</span>
          </div>

          {/* ── Why Dealers Choose (from sample image) ── */}
          <div className="why-dealers-section">
            <h2>Why Dealers Choose CarCatalog</h2>
            <p className="why-subtitle">Start your 30-day trial today and see the difference.</p>
            <div className="why-grid">
              <div className="why-item">Reach more serious buyers</div>
              <div className="why-item">Manage everything in one place</div>
              <div className="why-item">Save money vs competitors</div>
              <div className="why-item">Built specifically for car traders</div>
              <div className="why-item">Manage everything in one place</div>
              <div className="why-item">Fast, simple listing process</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TradeSubscriptionPage;