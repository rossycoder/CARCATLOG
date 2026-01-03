import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import './VanSellerContactPage.css';

const VanSellerContactPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dealer, isAuthenticated: isDealerAuthenticated } = useTradeDealerContext();

  const [advertData, setAdvertData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  const [formData, setFormData] = useState({
    phoneNumber: dealer?.phone || '',
    email: dealer?.email || user?.email || '',
    allowEmailContact: false,
    postcode: dealer?.businessAddress?.postcode || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem(`vanAdvert_${advertId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setAdvertData(parsed.advertData);
      setVehicleData(parsed.vehicleData);
      
      if (parsed.advertData?.contactEmail) {
        setFormData(prev => ({ ...prev, email: parsed.advertData.contactEmail }));
      }
      if (parsed.advertData?.contactPhone) {
        setFormData(prev => ({ ...prev, phoneNumber: parsed.advertData.contactPhone }));
      }
      if (parsed.advertData?.location) {
        setFormData(prev => ({ ...prev, postcode: parsed.advertData.location }));
      }
    } else {
      navigate('/vans/sell-your-van');
    }
  }, [advertId, navigate]);

  const validatePhone = (phone) => {
    const ukPhoneRegex = /^(\+44|0)[\s]?[1-9][\d]{2,4}[\s]?[\d]{3,4}[\s]?[\d]{3,4}$/;
    return ukPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePostcode = (postcode) => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setPublishError(null);

    try {
      const updatedAdvertData = {
        ...advertData,
        contactPhone: formData.phoneNumber,
        contactEmail: formData.email,
        location: formData.postcode,
        allowEmailContact: formData.allowEmailContact
      };

      const vanAdvertData = {
        id: advertId,
        vehicleData: vehicleData,
        advertData: updatedAdvertData,
        status: 'pending',
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
      
      // Navigate to van advertising prices page
      navigate('/vans/advertising-prices', {
        state: {
          advertId,
          advertData: updatedAdvertData,
          vehicleData,
          contactDetails: formData
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishVehicle = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setPublishError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('tradeDealerToken');

      const updatedAdvertData = {
        ...advertData,
        contactPhone: formData.phoneNumber,
        contactEmail: formData.email,
        location: formData.postcode,
        allowEmailContact: formData.allowEmailContact
      };

      const response = await fetch(`${API_BASE_URL}/vans/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          advertId,
          vehicleData,
          advertData: updatedAdvertData,
          contactDetails: formData,
          dealerId: dealer?._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish van');
      }

      localStorage.removeItem(`vanAdvert_${advertId}`);

      navigate('/trade/dashboard', {
        state: {
          message: `Your ${vehicleData?.make || 'van'} ${vehicleData?.model || ''} has been published successfully!`
        }
      });
    } catch (error) {
      console.error('Publish error:', error);
      setPublishError(error.message || 'Failed to publish van. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shortAdvertId = advertId ? advertId.substring(0, 8) : '';


  return (
    <div className="van-seller-contact-page">
      <div className="page-header">
        <div className="header-container">
          <div className="header-left">
            <button
              className="back-link"
              onClick={() => navigate(`/vans/selling/advert/edit/${advertId}`)}
            >
              ← Back to advert
            </button>
            <h1>Seller contact details</h1>
          </div>
          <div className="header-right">
            <p className="user-email">{formData.email}</p>
            <p className="not-you">
              Not you? <a href="/signin">Sign in</a>
            </p>
            <p className="advert-id">Advert ID: {shortAdvertId}</p>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="contact-form-container">
          <p className="form-intro">
            Please complete your contact details so that buyers will be able to
            get in touch with you about your van.
          </p>

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

          <div className="form-field">
            <label htmlFor="phoneNumber">
              Phone number<span className="required">*</span>
            </label>
            <p className="field-hint">
              This should be a valid UK mobile or landline number.
            </p>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && (
              <span className="error-message">{errors.phoneNumber}</span>
            )}
            <a href="#" className="add-another-link">Add another number</a>
          </div>

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

          <div className="good-to-know">
            <strong>Good to know:</strong> We will block emails that contain
            personal details to protect your privacy.
          </div>

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
              onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
              className={errors.postcode ? 'error' : ''}
            />
            {errors.postcode && (
              <span className="error-message">{errors.postcode}</span>
            )}
          </div>

          {publishError && (
            <div className="error-message publish-error">{publishError}</div>
          )}

          {isDealerAuthenticated && dealer ? (
            <button
              className="submit-button publish-button"
              onClick={handlePublishVehicle}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Vehicle'}
            </button>
          ) : (
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Continue to package selection'}
            </button>
          )}

          {isDealerAuthenticated && dealer && (
            <p className="trade-info">
              As a trade dealer, your van will be published immediately without payment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VanSellerContactPage;
