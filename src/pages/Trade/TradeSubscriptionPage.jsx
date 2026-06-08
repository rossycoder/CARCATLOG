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
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
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
      // Fetch plans and subscription independently so a failed subscription
      // fetch doesn't block the plans from rendering
      const [plansResult, subscriptionResult] = await Promise.allSettled([
        tradeSubscriptionService.getPlans(),
        tradeSubscriptionService.getCurrentSubscription()
      ]);

      if (plansResult.status === 'fulfilled') {
        setPlans(plansResult.value || []);
      } else {
        console.error('Failed to load plans:', plansResult.reason);
        setError('Failed to load subscription plans');
      }

      if (subscriptionResult.status === 'fulfilled') {
        const subData = subscriptionResult.value;
        // API returns { subscription, hasUsedTrial } or just the subscription object
        if (subData && typeof subData === 'object' && 'hasUsedTrial' in subData) {
          setCurrentSubscription(subData.subscription);
          setHasUsedTrial(subData.hasUsedTrial || false);
        } else {
          setCurrentSubscription(subData);
          // If subscription exists with trial data, mark hasUsedTrial
          if (subData?.isTrialing || subData?.trialEnd) {
            setHasUsedTrial(true);
          }
        }
      }
      // subscription fetch failing is non-fatal — just means no active sub
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
          // Stripe checkout redirect
          window.location.href = response.url;
        } else if (response.subscription) {
          // Direct activation (dev mode) - redirect to dashboard
          await fetchPlansAndSubscription();
          navigate('/trade/dashboard', { state: { message: response.message || 'Subscription activated! You can now start listing vehicles.' } });
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

  // Correct pricing table — source of truth for display
  // Trial = one-off fee paid today; Actual = recurring monthly after trial
  const PRICING = {
    bronze: { trial: 50,    actual: 1000, cars: 10  },
    silver: { trial: 87.50, actual: 1500, cars: 25  },
    gold:   { trial: 125,   actual: 2000, cars: 50  },
  };

  const getTrialPrice  = (plan) => `£${PRICING[plan.slug]?.trial  ?? (plan.trialPrice ? plan.trialPrice / 100 : '—')}`;
  const getActualPrice = (plan) => `£${PRICING[plan.slug]?.actual ?? (plan.price / 100)}`;
  const getCarLimit    = (plan) => PRICING[plan.slug]?.cars ?? plan.listingLimit ?? '—';

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

            {/* Trial Information Box - Always Visible */}
            <div className="trial-info-box-permanent">
              <h2>🎉 30-Day Trial on All Packages!</h2>
              <h3>How it works:</h3>
              <ul>
                <li>✓ Choose your package below (Bronze, Silver, or Gold)</li>
                <li>✓ Pay a small one-off trial fee today to start listing immediately</li>
                <li>✓ Your card is saved — no monthly charge for 30 days</li>
                <li>✓ After 30 days, your full monthly subscription begins automatically</li>
                <li>✓ Cancel anytime before trial ends to avoid the monthly charge</li>
              </ul>

              <div className="trial-warning">
                <span className="warning-icon">⚠️</span>
                <p>
                  <strong>Important:</strong> There will be a one-off £2.50 admin fee per car per your 
                  selected package. This covers the API costs for each vehicle's 5-point HPI 
                  check, MOT Status Check &amp; Vehicle Information Check used to populate each listing.
                </p>
              </div>
            </div>

            <div className="features-row">
              <div className="feature"><span className="check">✓</span> No hidden fees</div>
              <div className="feature"><span className="check">✓</span> Instant listings</div>
              <div className="feature"><span className="check">✓</span> Built for dealers</div>
            </div>
          </div>

          {/* ── Pricing heading ── */}
          <div className="pricing-section">
            <h2 className="pricing-title">Simple, Transparent Pricing</h2>
            <p className="pricing-subtitle">Start with a 30-day trial on any plan. Upgrade as you grow.</p>
            
            {/* Mobile swipe indicator */}
            <div className="mobile-swipe-indicator">
              <span className="swipe-icon">👉</span>
              <span className="swipe-text">Swipe to see more packages</span>
              <span className="swipe-icon">👈</span>
            </div>
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
                  {/* Summary Line */}
                  <div className="plan-summary">
                    <strong>Summary:</strong> Our {plan.name} Subscription lets you list up to{' '}
                    <strong>{getCarLimit(plan)} cars</strong>
                  </div>

                  <div className="plan-price">
                    {!hasUsedTrial ? (
                      /* ── New user: show trial price + what comes after ── */
                      <>
                        <div className="trial-today-label">Start today for just</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: '#34a853' }}>£</span>
                          <span className="price-amount trial-price-amount">
                            {PRICING[plan.slug]?.trial ?? '—'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#888', marginLeft: '4px' }}>+ VAT</span>
                        </div>
                        <div className="trial-one-off-note">one-off fee, paid today</div>
                        <div className="trial-then-full-price">
                          Then <strong>{getActualPrice(plan)}/month + VAT</strong> after 30-day trial
                        </div>
                      </>
                    ) : (
                      /* ── Returning user: show actual monthly price only ── */
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: '#555' }}>£</span>
                          <span className="price-amount">{PRICING[plan.slug]?.actual ?? (plan.price / 100)}</span>
                          <span style={{ fontSize: '13px', color: '#888', marginLeft: '4px' }}>/month + VAT</span>
                        </div>
                      </>
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

          {/* ── Why Dealers Should Choose CarCatalog ── */}
          <div className="why-dealers-section">
            <h2>Why Dealers Should Choose CarCatalog</h2>
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