import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTradeDealerContext } from '../context/TradeDealerContext';
import * as tradeInventoryService from '../services/tradeInventoryService';
import './SellerContactDetailsPage.css';

const SellerContactDetailsPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { dealer, subscription, isAuthenticated, loading } = useTradeDealerContext();

  // Check if user is a trade dealer (subscription not required for publishing)
  const isTradeDealer = isAuthenticated && dealer;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Trade Dealer Detection Debug:', {
      isAuthenticated,
      dealer: dealer ? { id: dealer._id, name: dealer.businessName } : null,
      subscription: subscription ? { status: subscription.status, plan: subscription.plan?.name } : null,
      isTradeDealer,
      token: localStorage.getItem('tradeDealerToken') ? 'EXISTS' : 'MISSING'
    });
  }, [isAuthenticated, dealer, subscription, isTradeDealer]);

  // Get advert data from navigation state
  const advertData = location.state?.advertData;
  const vehicleData = location.state?.vehicleData;

  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: user?.email || 'shahzad872@live.com',
    allowEmailContact: false,
    postcode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If no advert data, redirect back
    if (!advertId) {
      navigate('/find-your-car');
    }
  }, [advertId, navigate]);

  const validatePhone = (phone) => {
    // UK phone number validation
    const ukPhoneRegex =
      /^(\+44|0)[\s]?[1-9][\d]{2,4}[\s]?[\d]{3,4}[\s]?[\d]{3,4}$/;
    return ukPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePostcode = (postcode) => {
    // UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing - remove the key entirely
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid UK phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!validatePostcode(formData.postcode)) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTradePublish = async () => {
    if (!validateForm()) {
      return;
    }

    // Wait for dealer context to load
    if (loading) {
      alert('Loading dealer information. Please wait a moment and try again.');
      return;
    }

    // Ensure dealer is loaded
    if (!dealer || !dealer.id) {
      console.error('Dealer not loaded:', { dealer, isAuthenticated, loading });
      alert('Error: Dealer information not loaded. Please log in again or refresh the page.');
      // Redirect to login if dealer info is missing
      navigate('/trade/login');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Publishing vehicle as trade dealer:', {
        advertId,
        dealerId: dealer.id,
        hasVehicleData: !!vehicleData,
        hasAdvertData: !!advertData,
        contactDetails: formData
      });

      // Publish vehicle directly for trade dealers
      const response = await tradeInventoryService.publishVehicle({
        advertId,
        vehicleData,
        advertData,
        contactDetails: formData,
        dealerId: dealer.id
      });

      console.log('✅ Publish response:', response);

      if (response.success) {
        // Navigate to trade dashboard with success message
        navigate('/trade/dashboard', {
          state: { 
            message: 'Vehicle published successfully!',
            vehicleId: response.data.vehicleId
          }
        });
      } else {
        throw new Error(response.message || 'Failed to publish vehicle');
      }
    } catch (error) {
      console.error('❌ Error publishing vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      // Get the actual error message from the API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to publish vehicle';
      
      // Simple error message without redirecting
      alert(`Error: ${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save contact details to database
      const advertServiceModule = await import('../services/advertService');
      const advertServiceInstance = advertServiceModule.default;
      
      const response = await advertServiceInstance.updateAdvert(advertId, advertData, vehicleData, formData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save contact details');
      }
      
      // Navigate to advertising prices page with all data
      navigate('/sell-my-car/advertising-prices', {
        state: {
          advertId,
          advertData,
          vehicleData,
          contactDetails: formData,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate short advert ID for display
  const shortAdvertId = advertId ? `906 674 205` : '';

  return (
    <div className="seller-contact-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-container">
          <div className="header-left">
            <button
              className="back-link"
              onClick={() => navigate(`/selling/advert/edit/${advertId}`)}
            >
              ← Back to advert
            </button>
            <h1>Seller contact details</h1>
          </div>
          <div className="header-right">
            <p className="user-email">{formData.email}</p>
            <p className="not-you">
              Not you? <a href="#">Sign in</a>
            </p>
            <p className="advert-id">Advert ID: {shortAdvertId}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <div className="contact-form-container">
          <p className="form-intro">
            Please complete your contact details so that buyers will be able to
            get in touch with you.
          </p>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <div className="notice-icon">i</div>
            <div className="notice-content">
              <h3>We will keep your contact details private</h3>
              <p>
                You need to provide a phone number for your advert, and you can
                add an email address if you want. We'll always hide these
                details on your advert.
              </p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-field">
            <label htmlFor="phoneNumber">
              Phone number<span className="required">*</span>
            </label>
            <p className="field-hint">
              This should be a valid UK mobile or landline number. We'll check
              it with the network.
            </p>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder=""
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && (
              <span className="error-message">{errors.phoneNumber}</span>
            )}
            <a href="#" className="add-another-link">
              Add another number
            </a>
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">
              Email<span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Email Contact Preference */}
          <div className="form-field">
            <p className="field-label">
              Do you want to let buyers contact you by email?
            </p>
            <p className="field-hint">Your email will be protected</p>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${!formData.allowEmailContact ? 'active' : ''}`}
                onClick={() => handleInputChange('allowEmailContact', false)}
              >
                No
              </button>
              <button
                type="button"
                className={`toggle-btn ${formData.allowEmailContact ? 'active' : ''}`}
                onClick={() => handleInputChange('allowEmailContact', true)}
              >
                Yes
              </button>
            </div>
          </div>

          {/* Good to Know */}
          <div className="good-to-know">
            <strong>Good to know:</strong> We will block emails that contain
            personal details to protect your privacy.{' '}
            <a href="#">Learn more about replying to emails</a>
          </div>

          {/* Postcode */}
          <div className="form-field">
            <label htmlFor="postcode">
              Postcode<span className="required">*</span>
            </label>
            <p className="field-hint">
              Your postcode will be hidden. We will only show your town.
            </p>
            <input
              type="text"
              id="postcode"
              value={formData.postcode}
              onChange={(e) =>
                handleInputChange('postcode', e.target.value.toUpperCase())
              }
              placeholder=""
              className={errors.postcode ? 'error' : ''}
            />
          </div>

          {/* Validation Error Message */}
          {Object.values(errors).filter(Boolean).length > 0 && (
            <div className="validation-message">
              {errors.postcode || errors.phoneNumber || errors.email}
            </div>
          )}

          {/* Debug Info - Remove after testing */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '12px' }}>
              <strong>Debug Info:</strong><br/>
              loading: {loading ? 'YES' : 'NO'}<br/>
              isAuthenticated: {isAuthenticated ? 'YES' : 'NO'}<br/>
              subscription status: {subscription?.status || 'NONE'}<br/>
              isTradeDealer: {isTradeDealer ? 'YES' : 'NO'}<br/>
              dealer: {dealer ? dealer.businessName : 'NONE'}<br/>
              dealerId: {dealer?.id || 'NONE'}
            </div>
          )}

          {/* Submit Button - Conditional based on user type */}
          <button
            className={`submit-button ${isTradeDealer ? 'publish-button' : ''}`}
            onClick={isTradeDealer ? handleTradePublish : handleSubmit}
            disabled={isSubmitting || loading || Object.values(errors).filter(Boolean).length > 0}
          >
            {loading ? 'Loading...' : (isSubmitting ? 'Processing...' : (isTradeDealer ? 'Publish Vehicle' : 'Continue to package selection'))}
          </button>

          {/* Trade dealer info */}
          {isTradeDealer && (
            <p className="trade-info">
              As a trade dealer, your car will be published immediately without payment.
            </p>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default SellerContactDetailsPage;
