import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { breadcrumbSchema, faqSchema } from '../utils/seoSchemas';
import ValuationForm from '../components/Valuation/ValuationForm';
import ValuationResult from '../components/Valuation/ValuationResult';
import { getDetailedValuation } from '../services/valuationService';
import './ValuationPage.css';

// Body types that indicate a motorcycle
const MOTORCYCLE_BODY_TYPES = [
  'MOTORCYCLE', 'MOTORBIKE', 'CRUISER', 'CUSTOM CRUISER', 'SPORTBIKE', 
  'TOURING', 'ADVENTURE', 'NAKED', 'SCOOTER', 'MOPED'
];

const ValuationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dvlaData, setDvlaData] = useState(null);
  const [valuationData, setValuationData] = useState(null);
  const [isNotCar, setIsNotCar] = useState(false);
  const [showValuation, setShowValuation] = useState(false); // New state for two-step flow
  const [vehicleIdentified, setVehicleIdentified] = useState(false); // Track if vehicle is identified

  // Check if vehicle is not a car (motorcycle, etc.)
  const checkIfNotCar = (vehicleDetails) => {
    if (!vehicleDetails) return false;
    
    const make = (vehicleDetails.make || '').toUpperCase();
    const bodyType = (vehicleDetails.typeApproval || vehicleDetails.bodyType || '').toUpperCase();
    const model = (vehicleDetails.model || '').toUpperCase();
    
    // Check if it's a motorcycle by make (for known motorcycle-only brands)
    const motorcycleOnlyBrands = ['TRIUMPH', 'HARLEY-DAVIDSON', 'HARLEY DAVIDSON', 'DUCATI', 'INDIAN', 'ROYAL ENFIELD', 'MOTO GUZZI', 'MV AGUSTA', 'NORTON', 'BSA'];
    if (motorcycleOnlyBrands.some(brand => make.includes(brand))) {
      return true;
    }
    
    // Check body type
    if (MOTORCYCLE_BODY_TYPES.some(type => bodyType.includes(type))) {
      return true;
    }
    
    // Check model name for motorcycle indicators
    const motorcycleModelIndicators = ['BONNEVILLE', 'SPORTSTER', 'SOFTAIL', 'STREET GLIDE', 'ROAD KING', 'MONSTER', 'PANIGALE', 'SCRAMBLER'];
    if (motorcycleModelIndicators.some(indicator => model.includes(indicator))) {
      return true;
    }
    
    return false;
  };

  // Auto-submit if we have state from navigation
  useEffect(() => {
    if (location.state?.vrm && location.state?.mileage) {
      handleFormSubmit({
        vrm: location.state.vrm,
        mileage: location.state.mileage
      });
    }
  }, [location.state]);

  const handleFormSubmit = async ({ vrm, mileage, make, model, variant, derivative, regMonth, regYear }) => {
    setLoading(true);
    setError(null);
    setIsNotCar(false);

    try {
      const response = await getDetailedValuation(vrm, mileage);
      
      if (response.success) {
        // Check if we got valid vehicle details
        if (response.data.vehicleDetails) {
          const vehicleDetails = response.data.vehicleDetails;
          
          // Check if this is not a car
          if (checkIfNotCar(vehicleDetails)) {
            setIsNotCar(true);
            setDvlaData(vehicleDetails);
            setValuationData({ vrm, mileage }); // Store basic info for display
          } else {
            // Navigate to identification page first
            navigate('/valuation/identification', {
              state: {
                vehicleDetails,
                valuationData: response.data.valuation,
                formData: { vrm, mileage, make, model, variant, derivative, regMonth, regYear }
              }
            });
          }
        } else {
          // No vehicle details found - redirect to detailed form
          navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
        }
      } else {
        // API returned error - redirect to detailed form
        navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
      }
    } catch (err) {
      console.error('Valuation error:', err);
      // On error, redirect to detailed form page
      navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrice = (price) => {
    navigate('/sell-your-car', {
      state: {
        suggestedPrice: price,
        vrm: valuationData.vrm,
        mileage: valuationData.mileage,
        dvlaData,
      },
    });
  };

  const handleCustomPrice = (price) => {
    navigate('/sell-your-car', {
      state: {
        customPrice: price,
        suggestedPrice: valuationData.estimatedValue.private,
        vrm: valuationData.vrm,
        mileage: valuationData.mileage,
        dvlaData,
      },
    });
  };

  const handleReset = () => {
    setValuationData(null);
    setDvlaData(null);
    setError(null);
    setIsNotCar(false);
  };

  const handleCreateAdvert = () => {
    // Navigate to find your car page with registration pre-filled
    navigate('/find-your-car', {
      state: {
        registration: dvlaData?.registrationNumber || valuationData?.vrm,
        fromValuation: true
      }
    });
  };

  const handleFindNextCar = () => {
    navigate('/used-cars');
  };

  const handleChangeDetails = () => {
    const vrm = dvlaData?.registrationNumber || valuationData?.vrm;
    const mileage = valuationData?.mileage || '';
    navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
  };

  // Render non-car result section
  const renderNotCarResult = () => {
    if (!dvlaData) return null;

    const vehicleTitle = `${dvlaData.make || ''} ${dvlaData.model || ''} ${dvlaData.engineCapacity ? dvlaData.engineCapacity + 'cc' : ''} ${dvlaData.colour || ''} ${dvlaData.fuelType || ''} ${dvlaData.transmission || 'Manual'}`.trim();

    return (
      <div className="not-car-result">
        <div className="result-header-bar"></div>
        <h2 className="result-title">We've identified this car</h2>
        
        <div className="vehicle-identification">
          <h3 className="vehicle-name">{vehicleTitle}</h3>
          
          <div className="vehicle-details-grid">
            <div className="details-column">
              <div className="detail-row">
                <span className="detail-label">Registration number:</span>
                <span className="detail-value">{dvlaData.registrationNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mileage:</span>
                <span className="detail-value">{valuationData?.mileage?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fuel type:</span>
                <span className="detail-value">{dvlaData.fuelType || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Engine size:</span>
                <span className="detail-value">{dvlaData.engineCapacity ? `${dvlaData.engineCapacity}cc` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Body type:</span>
                <span className="detail-value">{dvlaData.typeApproval || dvlaData.bodyType || 'Custom Cruiser'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Colour:</span>
                <span className="detail-value">{dvlaData.colour || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transmission:</span>
                <span className="detail-value">{dvlaData.transmission || 'Manual'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of first registration:</span>
                <span className="detail-value">{dvlaData.monthOfFirstRegistration || ''}</span>
              </div>
              <div className="change-details-row">
                <span>Not your car?</span>
                <button className="change-details-link" onClick={handleChangeDetails}>
                  change details
                </button>
              </div>
            </div>
            
            <div className="brand-logo-column">
              {dvlaData.make && (
                <div className="brand-logo">
                  <span className="brand-name">{dvlaData.make}</span>
                  <span className="brand-icon">🏍️</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="valuation-unavailable">
          <p className="unavailable-message">Sorry, we are unable to provide a valuation because:</p>
          <p className="unavailable-reason">✕ This is not a car</p>
        </div>

        <div className="what-next-section">
          <h3>What to do next?</h3>
          <div className="action-buttons-row">
            <button className="btn-create-advert" onClick={handleCreateAdvert}>
              Create advert
            </button>
            <button className="btn-find-car" onClick={handleFindNextCar}>
              Find your next car
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEOHelmet 
        title="Free Car Valuation UK | Instant Vehicle Value Check | CarCatlog"
        description="Get a free, instant car valuation in seconds. We analyze millions of used cars to provide accurate, independent valuations. No obligations, completely free."
        keywords="car valuation UK, free car valuation, vehicle value check, how much is my car worth, instant car valuation, sell my car value"
        url="/valuation"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Car Valuation', url: '/valuation' }
            ]),
            faqSchema([
              {
                question: "How accurate is the car valuation?",
                answer: "We analyze millions of used cars to provide accurate, data-driven valuations based on current market conditions."
              },
              {
                question: "Is the valuation really free?",
                answer: "Yes, our car valuation service is completely free with no obligations or hidden costs."
              },
              {
                question: "How long does it take to get a valuation?",
                answer: "You'll receive your vehicle valuation in seconds after entering your registration and mileage."
              }
            ])
          ]
        }}
      />
      <div className="valuation-page">
      {/* Hero Section */}
      <div className="valuation-hero">
        <div className="hero-content">
          <h1>Value my car</h1>
          <p className="hero-subtitle">Recieve your vehicle valuation in seconds </p>
         
        </div>
      </div>

      {/* Main Content */}
      <div className="valuation-container">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
            <button className="error-close" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {!valuationData ? (
          <>
            <ValuationForm
              onSubmit={handleFormSubmit}
              loading={loading}
              dvlaData={dvlaData}
              heroTitle="Value my car"
            />

            {/* Benefits Section */}
            <div className="benefits-section">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>We look at millions of used cars to give you a free, easy valuation</h3>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>With CarCATLog , you're getting an independent valuation in seconds</h3>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>All information is encrypted. We won't sell your details</h3>
              </div>
            </div>
          </>
        ) : isNotCar ? (
          <>
            {renderNotCarResult()}
            <div className="reset-section">
              <button className="reset-button" onClick={handleReset}>
                ← Get Another Valuation
              </button>
            </div>
          </>
        ) : (
          <>
            <ValuationResult
              valuationData={valuationData}
              onAcceptPrice={handleAcceptPrice}
              onCustomPrice={handleCustomPrice}
            />
            <div className="reset-section">
              <button className="reset-button" onClick={handleReset}>
                ← Get Another Valuation
              </button>
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="info-section-modern">
          <h2>We know what your car is really worth</h2>
         
          <div className="info-features">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <h3>Millions of valuations</h3>
              <p>We analyze millions of used cars to give you accurate, up-to-date valuations</p>
            </div>

            <div className="feature-item">
              <div className="feature-number">02</div>
              <h3>Independent & free</h3>
              <p>Get an independent valuation in seconds, completely free with no obligations</p>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>
              <h3>Secure & private</h3>
              <p>All information is encrypted and we never sell your personal details</p>
            </div>
          </div>
        </div>

      
      </div>
      </div>
    </>
  );
};

export default ValuationPage;
