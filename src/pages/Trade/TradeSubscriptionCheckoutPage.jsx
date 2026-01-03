import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import tradeSubscriptionService from '../../services/tradeSubscriptionService';
import './TradeSubscriptionCheckoutPage.css';

const TradeSubscriptionCheckoutPage = () => {
  const { planSlug } = useParams();
  const navigate = useNavigate();
  const { dealer } = useTradeDealerContext();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [planSlug]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const plans = await tradeSubscriptionService.getPlans();
      const selectedPlan = plans.find(p => p.slug === planSlug);
      
      if (!selectedPlan) {
        setError('Plan not found');
        return;
      }
      
      setPlan(selectedPlan);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Create Stripe checkout session
      const response = await tradeSubscriptionService.createCheckoutSession(planSlug);
      
      if (response.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  const getPlanColor = (slug) => {
    switch(slug) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      default: return '#007bff';
    }
  };

  if (loading) {
    return (
      <div className="trade-checkout-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="trade-checkout-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/trade/subscription')} className="btn-secondary">
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Complete Your Subscription</h1>
          <p>Review your plan and proceed to payment</p>
        </div>

        <div className="checkout-content">
          <div className="plan-summary-card" style={{ borderColor: getPlanColor(plan.slug) }}>
            <div className="plan-badge" style={{ backgroundColor: getPlanColor(plan.slug) }}>
              {plan.name.toUpperCase()} PACKAGE
            </div>
            
            <div className="plan-details">
              <div className="price-section">
                <h2>£{plan.price / 100}</h2>
                <p className="vat-text">+ VAT per month</p>
              </div>

              <div className="plan-info">
                <h3>What You Get:</h3>
                <ul>
                  {plan.slug === 'bronze' && (
                    <>
                      <li>List up to 20 cars</li>
                      <li>Up to 100 photos per vehicle</li>
                      <li>YouTube video attachment</li>
                      <li>Free basic HPI check & MOT status</li>
                      <li>Dealer dashboard access</li>
                      <li>Unlimited listing alterations</li>
                    </>
                  )}
                  {plan.slug === 'silver' && (
                    <>
                      <li>List up to 35 cars</li>
                      <li>Up to 100 photos per vehicle</li>
                      <li>YouTube video attachment</li>
                      <li>Free basic HPI check & MOT status</li>
                      <li>Dealer dashboard access</li>
                      <li>Unlimited listing alterations</li>
                    </>
                  )}
                  {plan.slug === 'gold' && (
                    <>
                      <li>Unlimited vehicle listings</li>
                      <li>Up to 100 photos per vehicle</li>
                      <li>YouTube video attachment</li>
                      <li>Free basic HPI check & MOT status</li>
                      <li>Dealer dashboard access</li>
                      <li>Unlimited listing alterations</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="dealer-info-card">
            <h3>Billing Information</h3>
            <div className="dealer-details">
              <p><strong>Business Name:</strong> {dealer?.businessName}</p>
              <p><strong>Email:</strong> {dealer?.email}</p>
              <p><strong>Contact:</strong> {dealer?.contactPerson}</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="checkout-actions">
            <button 
              onClick={() => navigate('/trade/subscription')} 
              className="btn-secondary"
              disabled={processing}
            >
              Change Plan
            </button>
            <button 
              onClick={handlePayment} 
              className="btn-primary"
              disabled={processing}
              style={{ backgroundColor: getPlanColor(plan.slug) }}
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>

          <div className="checkout-footer">
            <p className="secure-payment">
              🔒 Secure payment powered by Stripe
            </p>
            <p className="terms-text">
              By proceeding, you agree to our Terms of Service and Privacy Policy. 
              Your subscription will renew automatically each month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSubscriptionCheckoutPage;
