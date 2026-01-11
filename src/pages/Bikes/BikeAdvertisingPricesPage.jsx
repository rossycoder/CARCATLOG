import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BikeAdvertisingPricesPage.css';

const BikeAdvertisingPricesPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { user } = useAuth();
  const [processingPackageId, setProcessingPackageId] = useState(null);
  const [error, setError] = useState(null);
  const [registration, setRegistration] = useState('');
  const [mileage, setMileage] = useState('');
  const [quickFormErrors, setQuickFormErrors] = useState({
    registration: '',
    mileage: ''
  });

  // Get data from navigation state (from BikeSellerContactPage)
  const advertId = locationState.state?.advertId;
  const advertData = locationState.state?.advertData;
  const vehicleData = locationState.state?.vehicleData;
  const contactDetails = locationState.state?.contactDetails;

  const packages = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: '£9.99',
      priceInPence: 999,
      duration: '2 weeks',
      durationWeeks: 2,
      durationDays: 14,
      color: '#CD7F32',
      description: 'Our Bronze package gets your bike listed for up to 2 weeks.',
      features: [
        'Attract buyers - Display your bike\'s best features with up to 100 photos.',
        'Stand out with photos in search results.',
        'Your listing will remain active for up to 2 weeks or less if sold within this time.'
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '£14.99',
      priceInPence: 1499,
      duration: '3 weeks',
      durationWeeks: 3,
      durationDays: 21,
      color: '#C0C0C0',
      description: 'Our second best package. Your bike listed for up to 3 weeks.',
      features: [
        'Attract buyers - Display your bike\'s best features with up to 100 photos.',
        'Stand out with photos in search results.',
        'Your listing will remain active for up to 3 weeks or less if sold within this time.'
      ],
      popular: true
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '£19.99',
      priceInPence: 1999,
      duration: '4 weeks',
      durationWeeks: 4,
      durationDays: 28,
      color: '#FFD700',
      description: 'Our Gold package keeps your bike listing live for up to 4 weeks.',
      features: [
        'Attract buyers - Display your bike\'s best features with up to 100 photos.',
        'Stand out with photos in search results.',
        'Your listing will remain active for up to 4 weeks or less if sold within this time.'
      ]
    }
  ];

  const handleSelectPackage = async (pkg) => {
    // Check if user is signed in
    if (!user) {
      navigate('/signin', { state: { from: locationState.pathname } });
      return;
    }

    try {
      setProcessingPackageId(pkg.id);
      setError(null);
      
      console.log('🚨 PROCESSING BIKE PAYMENT for package:', pkg.name);
      console.log('⚠️  This will charge:', pkg.price);
      
      // Create Stripe checkout session for bike advertising package
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const requestBody = {
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.priceInPence,
        duration: pkg.duration,
        advertId: advertId || null,
        advertData: advertData || {
          price: null,
          description: null,
          photos: []
        },
        vehicleData: vehicleData || {
          make: null,
          model: null,
          year: null,
          registrationNumber: registration || null,
          mileage: mileage || null
        },
        contactDetails: contactDetails || {
          phoneNumber: null,
          email: null,
          postcode: null,
          allowEmailContact: false
        }
      };
      
      console.log('📤 Sending bike payment request to:', `${API_BASE_URL}/payments/create-bike-checkout-session`);
      console.log('📦 Request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/payments/create-bike-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Payment request failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          if (response.status === 404) {
            errorMessage = 'Payment service not available. Please try again later.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success && data.data && data.data.url) {
        // Redirect to Stripe Checkout
        console.log('✅ Redirecting to Stripe Checkout:', data.data.url);
        window.location.href = data.data.url;
      } else {
        console.error('❌ Invalid response format:', data);
        throw new Error(data.error || 'Failed to create payment session');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      let userMessage = 'Payment processing failed. Please try again.';
      
      if (err.message.includes('Failed to fetch')) {
        userMessage = 'Unable to connect to payment service. Please check your internet connection and try again.';
      } else if (err.message.length < 100) {
        userMessage = err.message;
      }
      
      setError(userMessage);
      setProcessingPackageId(null);
    }
  };

  const handleCreateAd = () => {
    // Validate inputs
    const errors = {
      registration: '',
      mileage: ''
    };

    if (!registration.trim()) {
      errors.registration = 'Registration is required';
    }

    if (!mileage.trim()) {
      errors.mileage = 'Mileage is required';
    } else if (isNaN(mileage) || parseInt(mileage) <= 0) {
      errors.mileage = 'Please enter a valid mileage';
    }

    setQuickFormErrors(errors);

    // If there are errors, don't navigate
    if (errors.registration || errors.mileage) {
      return;
    }

    // Navigate with state
    navigate(`/bikes/sell-your-bike`, {
      state: {
        registrationNumber: registration,
        mileage: mileage
      }
    });
  };

  return (
    <div className="advertising-prices-page">
      <div className="container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <div className="page-header">
          <h1>Choose Your Bike Advertising Package</h1>
          <p className="page-subtitle">
            Get maximum exposure for your motorcycle with our tailored advertising packages. 
            Reach thousands of potential buyers across the UK.
          </p>
        </div>

        <div className="pricing-cards">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`pricing-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              <div 
                className="card-header" 
                style={{ backgroundColor: pkg.color }}
              >
                <h2>{pkg.name}</h2>
              </div>
              <div className="card-body">
                <div className="price-section">
                  <div className="price">{pkg.price}</div>
                  <p className="duration">for {pkg.duration}</p>
                  <p className="description">{pkg.description}</p>
                </div>
                
                <div className="features-section">
                  <h3>What's Included</h3>
                  <ul className="features-list">
                    {pkg.features.map((feature, index) => (
                      <li key={index}>
                        <span className="checkmark">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {user ? (
                  <button 
                    className="select-package-btn"
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={processingPackageId !== null}
                  >
                    {processingPackageId === pkg.id ? 'Processing...' : `Choose ${pkg.name}`}
                  </button>
                ) : (
                  <button 
                    className="select-package-btn login-required-btn"
                    onClick={() => navigate('/signin', { state: { returnTo: '/bikes/advertising-prices' } })}
                  >
                    Sign in to Select
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="promotion-section">
          <h2>Why Advertise Your Bike With Us?</h2>
          
          <div className="promotion-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5v2h12.76l1.68 1.68V15H5v2h14.44l.01.01c.31 0 .61-.13.83-.35.22-.22.35-.52.35-.83V9.86c0-.31-.13-.61-.35-.83-.22-.22-.52-.35-.84-.35zM8 11l-4 4 4 4v-3h8v-2H8v-3z"/>
                </svg>
              </div>
              <h3>Motorcycle Specialists</h3>
              <li>Dedicated platform for motorcycle enthusiasts</li>
              <li>Targeted audience reach</li>
              <li>Expert bike listings</li>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3>Massive Audience</h3>
              <li>Thousands of active bike buyers</li>
              <li>Daily searches for motorcycles</li>
              <li>UK-wide coverage</li>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
              </div>
              <h3>Mobile Optimized</h3>
              <li>Perfect on all devices</li>
              <li>Responsive design</li>
              <li>Easy to browse</li>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3>Secure Platform</h3>
              <li>Safe environment</li>
              <li>Verified listings</li>
              <li>Buyer protection</li>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M9 2l1.17 1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-6.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              </div>
              <h3>Great Photos</h3>
              <li>Up to 100 photos</li>
              <li>High quality display</li>
              <li>Gallery view</li>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h3>Quick Results</h3>
              <li>Fast listing approval</li>
              <li>Instant visibility</li>
              <li>Quick enquiries</li>
            </div>
          </div>
        </div>

        <div className="newsletter-section">
          <h2>Ready to sell? Quickly create your ad</h2>
          <div className="newsletter-form">
            <div className="input-group">
              <label className="input-label">Registration</label>
              <input 
                type="text" 
                placeholder="e.g. AB12 CDE"
                className={`registration-input ${quickFormErrors.registration ? 'input-error' : ''}`}
                value={registration}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegistration(value.toUpperCase());
                  if (quickFormErrors.registration) {
                    setQuickFormErrors(prev => ({ ...prev, registration: '' }));
                  }
                }}
              />
              {quickFormErrors.registration && (
                <span className="error-message-quick">{quickFormErrors.registration}</span>
              )}
            </div>
            <div className="input-group">
              <label className="input-label">Current mileage</label>
              <input 
                type="text" 
                placeholder="e.g. 15000"
                className={`mileage-input ${quickFormErrors.mileage ? 'input-error' : ''}`}
                value={mileage}
                onChange={(e) => {
                  setMileage(e.target.value.replace(/[^0-9]/g, ''));
                  if (quickFormErrors.mileage) {
                    setQuickFormErrors(prev => ({ ...prev, mileage: '' }));
                  }
                }}
              />
              {quickFormErrors.mileage && (
                <span className="error-message-quick">{quickFormErrors.mileage}</span>
              )}
            </div>
            <button className="create-ad-btn" onClick={handleCreateAd}>
              Create your ad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeAdvertisingPricesPage;
