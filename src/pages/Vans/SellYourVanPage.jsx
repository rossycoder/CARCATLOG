import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import './SellYourVanPage.css';

const StepCard = ({ icon, title, description }) => (
  <div className="step-card">
    <div className="step-icon-wrapper">
      <div className="step-icon-emoji">{icon}</div>
    </div>
    <h4 className="step-title">{title}</h4>
    <p className="step-description">{description}</p>
  </div>
);

const GuideCard = ({ icon, title, description }) => (
  <div className="guide-card">
    <div className="guide-icon-wrapper">
      <div className="guide-icon-emoji">{icon}</div>
    </div>
    <h4 className="guide-card-title">{title}</h4>
    <p className="guide-card-description">{description}</p>
  </div>
);

const SellYourVanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dealer, isAuthenticated } = useTradeDealerContext();
  const isTradeDealer = isAuthenticated && dealer;
  
  // Get passed state from navigation (from advertising prices page)
  const passedRegistration = location.state?.registrationNumber || '';
  const passedMileage = location.state?.mileage || '';
  
  const [registration, setRegistration] = useState(passedRegistration);
  const [mileage, setMileage] = useState(passedMileage);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVanDetails, setShowVanDetails] = useState(false);
  const [fetchedVanData, setFetchedVanData] = useState(null);

  // Update form when passed state changes
  useEffect(() => {
    if (passedRegistration) setRegistration(passedRegistration);
    if (passedMileage) setMileage(passedMileage);
  }, [passedRegistration, passedMileage]);

  const validateRegistration = (value) => {
    if (!value.trim()) {
      return 'Registration number is required';
    }
    const ukRegPattern = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[0-9]{1,4}[A-Z]{1,2}$|^[0-9]{1,3}[A-Z]{1,3}$|^[A-Z]{1,2}[0-9]{1,4}$|^[A-Z]{1,3}[0-9]{1,3}$/i;
    if (!ukRegPattern.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid UK registration number';
    }
    return '';
  };

  const validateMileage = (value) => {
    if (!value.trim()) {
      return 'Mileage is required';
    }
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid mileage';
    }
    return '';
  };

  const generateMockVanData = (reg, miles) => {
    const yearMatch = reg.match(/[A-Z]{2}(\d{2})/i);
    let year = 2020;
    if (yearMatch) {
      const regYear = parseInt(yearMatch[1]);
      year = regYear >= 50 ? 1950 + regYear : 2000 + regYear;
    }
    
    const makes = ['Ford', 'Mercedes-Benz', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Vauxhall', 'Fiat'];
    const models = {
      'Ford': ['Transit', 'Transit Custom', 'Transit Connect', 'Ranger'],
      'Mercedes-Benz': ['Sprinter', 'Vito', 'Citan'],
      'Volkswagen': ['Transporter', 'Crafter', 'Caddy'],
      'Renault': ['Trafic', 'Master', 'Kangoo'],
      'Peugeot': ['Expert', 'Boxer', 'Partner'],
      'Citroen': ['Dispatch', 'Relay', 'Berlingo'],
      'Vauxhall': ['Vivaro', 'Movano', 'Combo'],
      'Fiat': ['Ducato', 'Talento', 'Doblo']
    };
    
    const randomMake = makes[Math.floor(Math.random() * makes.length)];
    const makeModels = models[randomMake];
    const randomModel = makeModels[Math.floor(Math.random() * makeModels.length)];
    
    const colors = ['White', 'Silver', 'Blue', 'Black', 'Red', 'Grey'];
    const vanTypes = ['Panel Van', 'Crew Van', 'Dropside', 'Tipper', 'Luton'];
    
    const baseValue = 15000;
    const yearDepreciation = (2024 - year) * 1000;
    const mileageDepreciation = Math.floor(parseInt(miles) / 10000) * 500;
    const estimatedValue = Math.max(baseValue - yearDepreciation - mileageDepreciation, 3000);
    
    return {
      registration: reg.toUpperCase(),
      mileage: miles,
      make: randomMake,
      model: randomModel,
      year: year.toString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      fuelType: 'Diesel',
      vanType: vanTypes[Math.floor(Math.random() * vanTypes.length)],
      payloadCapacity: Math.floor(Math.random() * 1500 + 500),
      estimatedValue: estimatedValue
    };
  };

  const handleSellMyVan = async () => {
    const regError = validateRegistration(registration);
    const mileageError = validateMileage(mileage);
    
    setErrors({ registration: regError, mileage: mileageError });
    
    if (regError || mileageError) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔍 Looking up van:', registration, 'with mileage:', mileage);
      
      // Import van service
      const { lookupVanByRegistration } = await import('../../services/vanService');
      
      // Call API to lookup van details
      const response = await lookupVanByRegistration(registration, mileage);
      
      console.log('✅ Van lookup response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to lookup van details');
      }
      
      // Show van details below the form
      setFetchedVanData(response.data);
      setShowVanDetails(true);
      
      // Scroll to van details
      setTimeout(() => {
        document.getElementById('van-details-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
      
    } catch (error) {
      console.error('❌ Error looking up van:', error);
      alert(`Error: ${error.message || 'An error occurred. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContinueToAdvert = () => {
    if (!fetchedVanData) return;
    
    const advertId = uuidv4();
    
    const vanAdvertData = {
      id: advertId,
      vehicleData: fetchedVanData,
      advertData: {
        price: fetchedVanData.estimatedValue || '',
        description: '',
        photos: [],
        contactPhone: '',
        contactEmail: '',
        location: ''
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Saving van advert data to localStorage:', vanAdvertData);
    localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
    
    console.log('🚀 Navigating to van advert edit page');
    navigate(`/vans/selling/advert/edit/${advertId}`);
  };

  const sellSteps = [
    { 
      icon: "📸", 
      title: "Take great photos", 
      description: "Taking good-quality photos means that the buyers have an accurate image of the van, and there won't be any issues after the sale." 
    },
    { 
      icon: "📋", 
      title: "Keep it snappy", 
      description: "There are a few documents you'll need to make sure you have before you sell your van, including V5C and service history." 
    },
    { 
      icon: "✅", 
      title: "Be honest", 
      description: "Make sure your van description is accurate. Mention any faults, like scratches or modifications, so buyers know what they're getting." 
    },
  ];

  const guides = [
    {
      icon: "🚐",
      title: "Preparing your van",
      description: "Thoroughly clean your van inside and out before listing it to create a strong first impression."
    },
    {
      icon: "📝",
      title:"Your advert",
      description: "A well-written, high-quality advert attracts more buyers and helps your van sell faster."
    },
    {
      icon: "💳",
      title: "Your payment",
      description: "An instant bank transfer is the safest payment method. Make sure the funds have fully cleared before handing over your van."
    },
    {
      icon: "🛡️",
      title: "Watch out for  scams",
      description: "Stay alert and check online for the most common scams to protect yourself during the selling process."
    }
  ];

  return (
    <div className="sell-your-van-page">
      {/* Section 1: Hero Banner and CTAs */}
      <section className="hero-section">
        <div className="hero-section-background">
          <div className="hero-content">
            <div className="hero-header">
              <p className="hero-label">Sell your van</p>
              <h1 className="hero-title">
                Reach thousands of van buyers
              </h1>
              <p className="hero-subtitle">
                Get the best price for your van. List it on the UK's largest marketplace and connect with serious buyers.
              </p>
            </div>
            
            {/* Van Registration Form */}
            <div className="van-form-wrapper">
              <div className="van-form-container">
                <h2 className="form-title">Enter your van details</h2>
                
                <div className="form-fields">
                  <div className="form-field">
                    <label htmlFor="registration" className="form-label">
                      Registration number<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="registration"
                      className={`form-input ${errors.registration ? 'error' : ''}`}
                      value={registration}
                      onChange={(e) => {
                        setRegistration(e.target.value.toUpperCase());
                        if (errors.registration) {
                          setErrors(prev => ({ ...prev, registration: '' }));
                        }
                      }}
                      placeholder="e.g. AB12 CDE"
                    />
                    {errors.registration && (
                      <span className="error-message">{errors.registration}</span>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="mileage" className="form-label">
                      Current mileage<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="mileage"
                      className={`form-input ${errors.mileage ? 'error' : ''}`}
                      value={mileage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setMileage(value);
                        if (errors.mileage) {
                          setErrors(prev => ({ ...prev, mileage: '' }));
                        }
                      }}
                      placeholder="e.g. 50000"
                    />
                    {errors.mileage && (
                      <span className="error-message">{errors.mileage}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  className="sell-van-button"
                  onClick={handleSellMyVan}
                  disabled={isLoading}
                >
                  {isLoading ? 'Finding your van...' : 'Sell My Van'}
                </button>
                
                <a href="/vans/advertising-prices" className="advertising-link">
                  View Van Advertising Packages →
                </a>
              </div>
          </div>
        </div>
        </div>
      </section>

      {/* Van Details Section - Show after successful lookup */}
      {showVanDetails && fetchedVanData && (
        <section className="van-details-section" id="van-details-section">
          <div className="van-details-container">
            <div className="van-details-card">
              <div className="details-header">
                <h2>✓ Van Found</h2>
                <p className="vrm-display">{registration.toUpperCase()}</p>
              </div>

              <div className="van-info-grid">
                {/* Basic Information */}
                <div className="info-section">
                  <h3>Basic Information</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="info-label">Make</span>
                      <span className="info-value">{fetchedVanData.make || 'Unknown'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Model</span>
                      <span className="info-value">{fetchedVanData.model || 'Unknown'}</span>
                    </div>
                    {fetchedVanData.variant && (
                      <div className="info-item">
                        <span className="info-label">Variant</span>
                        <span className="info-value">{fetchedVanData.variant}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Year</span>
                      <span className="info-value">{fetchedVanData.year}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Colour</span>
                      <span className="info-value">{fetchedVanData.color || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mileage</span>
                      <span className="info-value">{parseInt(mileage).toLocaleString()} miles</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="info-section">
                  <h3>Technical Specifications</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="info-label">Fuel Type</span>
                      <span className="info-value">{fetchedVanData.fuelType || 'Diesel'}</span>
                    </div>
                    {fetchedVanData.engineSize && (
                      <div className="info-item">
                        <span className="info-label">Engine</span>
                        <span className="info-value">{fetchedVanData.engineSize}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Transmission</span>
                      <span className="info-value">{fetchedVanData.transmission || 'Manual'}</span>
                    </div>
                    {fetchedVanData.vanType && (
                      <div className="info-item">
                        <span className="info-label">Van Type</span>
                        <span className="info-value">{fetchedVanData.vanType}</span>
                      </div>
                    )}
                    {fetchedVanData.payloadCapacity && (
                      <div className="info-item">
                        <span className="info-label">Payload</span>
                        <span className="info-value">{fetchedVanData.payloadCapacity} kg</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valuation */}
                {fetchedVanData.estimatedValue && (
                  <div className="info-section">
                    <h3>Estimated Value</h3>
                    <div className="info-items">
                      <div className="info-item highlight">
                        <span className="info-label">Estimated Price</span>
                        <span className="info-value price">
                          £{parseInt(fetchedVanData.estimatedValue).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="details-actions">
                <button 
                  className="continue-btn primary"
                  onClick={handleContinueToAdvert}
                >
                  Continue to Create Advert →
                </button>
                <button 
                  className="continue-btn secondary"
                  onClick={() => {
                    setShowVanDetails(false);
                    setFetchedVanData(null);
                    setRegistration('');
                    setMileage('');
                  }}
                >
                  Check Another Van
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Place an advert on CarCatALog */}
      <section className="advert-section">
        <div className="advert-container">
          <h2 className="advert-main-title">Place an advert on CarCatALog</h2>
          <div className="advertising-card-with-image">
            <div className="advertising-card-image">
              <img 
                src="/images/brands/vans.PNG" 
                alt="Place an advert on CarCatALog" 
              />
            </div>
          </div>
        
        </div>
      </section>

      {/* Section 3: How to sell your van, fast */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="section-title">
          Tips to sell you van,quickly 
          </h2>
          <div className="steps-grid">
            {sellSteps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Guides to selling your van */}
      <section className="guides-cards-section">
        <div className="guides-cards-container">
          <h2 className="section-title">
           Tips to selling your van
          </h2>
          <div className="guides-cards-grid">
            {guides.map((guide, index) => (
              <GuideCard key={index} {...guide} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellYourVanPage;
