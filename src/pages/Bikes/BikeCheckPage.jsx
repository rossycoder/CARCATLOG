import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import { breadcrumbSchema, faqSchema } from '../../utils/seoSchemas';
import { bikeService } from '../../services/bikeService';
import '../VehicleCheckPage.css'; // Reuse vehicle check styles

const BikeCheckPage = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bikeData, setBikeData] = useState(null);
  const [showBikeFound, setShowBikeFound] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setBikeData(null);
    setShowBikeFound(false);
    
    try {
      console.log('Fetching comprehensive bike data for:', registrationNumber);
      
      // Use bike lookup service
      const response = await bikeService.lookupBikeByRegistration(registrationNumber, 0);
      
      if (response.success && response.data) {
        console.log('Enhanced bike data received:', response.data);
        
        // Helper function to safely extract value
        const getValue = (field) => {
          if (field === null || field === undefined) return null;
          if (typeof field === 'object' && field !== null && 'value' in field) {
            return field.value;
          }
          return field;
        };
        
        // Format the data for display
        const enhancedData = response.data;
        const mergedData = {
          vrm: registrationNumber.toUpperCase(),
          make: getValue(enhancedData.make) || 'Unknown',
          model: getValue(enhancedData.model) || 'Unknown',
          variant: getValue(enhancedData.variant),
          bikeType: getValue(enhancedData.bikeType),
          colour: getValue(enhancedData.color),
          firstRegistered: getValue(enhancedData.year),
          fuelType: getValue(enhancedData.fuelType) || 'Petrol',
          engineCC: getValue(enhancedData.engineCC),
          transmission: getValue(enhancedData.transmission),
          previousOwners: getValue(enhancedData.previousOwners),
          emissionClass: getValue(enhancedData.emissionClass),
          co2Emissions: enhancedData.runningCosts?.co2Emissions || enhancedData.co2Emissions || null,
          fuelEconomy: enhancedData.runningCosts?.fuelEconomy ? {
            combined: getValue(enhancedData.runningCosts.fuelEconomy.combined),
            urban: getValue(enhancedData.runningCosts.fuelEconomy.urban),
            extraUrban: getValue(enhancedData.runningCosts.fuelEconomy.extraUrban)
          } : null,
          insuranceGroup: getValue(enhancedData.runningCosts?.insuranceGroup) || getValue(enhancedData.insuranceGroup),
          annualTax: getValue(enhancedData.runningCosts?.annualTax) || getValue(enhancedData.annualTax),
          valuation: enhancedData.valuation ? {
            estimatedValue: enhancedData.valuation.estimatedValue ? {
              retail: getValue(enhancedData.valuation.estimatedValue.retail),
              private: getValue(enhancedData.valuation.estimatedValue.private),
              partExchange: getValue(enhancedData.valuation.estimatedValue.partExchange)
            } : null
          } : null,
          // Safety checks
          isStolen: enhancedData.isStolen || false,
          isWrittenOff: enhancedData.isWrittenOff || false,
          hasOutstandingFinance: enhancedData.hasOutstandingFinance || false,
          writeOffCategory: enhancedData.writeOffCategory || null,
          // Full enhanced data
          fullData: enhancedData
        };
        
        console.log('Merged bike data:', mergedData);
        setBikeData(mergedData);
        setShowBikeFound(true);
      } else {
        throw new Error('Failed to retrieve bike details');
      }
    } catch (err) {
      console.error('Bike lookup error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch bike data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <SEOHelmet 
        title="Bike Check UK | Full Motorcycle History & MOT Check | CarCatlog"
        description="Get a comprehensive bike history check in seconds. Check MOT history, mileage, write-offs, outstanding finance, and more. Instant results for any UK motorcycle registration."
        keywords="bike check UK, motorcycle history check, MOT check, bike history, mileage check, write off check, stolen bike check, finance check"
        url="/bikes/check"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Bikes', url: '/bikes' },
              { name: 'Bike Check', url: '/bikes/check' }
            ]),
            faqSchema([
              {
                question: "What does a bike check include?",
                answer: "Our bike check includes MOT history, mileage verification, write-off status, outstanding finance, stolen bike check, and comprehensive bike specifications."
              },
              {
                question: "How quickly will I get the results?",
                answer: "You'll receive instant results as soon as you enter the bike registration number."
              },
              {
                question: "Is the bike check reliable?",
                answer: "Yes, we use official DVLA data and trusted sources to provide accurate and up-to-date bike information."
              }
            ])
          ]
        }}
      />
      <div className="vehicle-check-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-form-card">
                <div className="form-header">
                  <h2>BIKE CHECK</h2>
                  <p>Enter your bike's registration to get instant details</p>
                </div>
                
                <form onSubmit={handleSubmit} className="check-form">
                  <div className="form-group">
                    <label htmlFor="registration">Registration Number</label>
                    <input
                      type="text"
                      id="registration"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. AB12 CDE"
                      className="registration-input"
                      maxLength={8}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="check-btn"
                    disabled={isLoading || !registrationNumber.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Checking...
                      </>
                    ) : (
                      'Check Bike'
                    )}
                  </button>
                </form>

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                  </div>
                )}
              </div>

              <div className="hero-info">
                <h1>Find Your Bike Details</h1>
                <p className="hero-description">
                  Get instant access to comprehensive bike information including make, model, 
                  engine size, MOT history, and more. Simply enter your registration number above.
                </p>
                
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Instant Results</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Official DVLA Data</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>MOT History</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Bike Specifications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bike Found Section */}
        {showBikeFound && bikeData && (
          <section className="vehicle-found-section">
            <div className="container">
              <div className="vehicle-found-card">
                <div className="found-header">
                  <h2>✓ Bike Found</h2>
                  <p className="vrm-display">{bikeData.vrm}</p>
                </div>

                <div className="vehicle-details-grid">
                  {/* Basic Details */}
                  <div className="detail-section">
                    <h3>Basic Information</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <span className="detail-label">Make</span>
                        <span className="detail-value">{bikeData.make}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Model</span>
                        <span className="detail-value">{bikeData.model}</span>
                      </div>
                      {bikeData.variant && (
                        <div className="detail-item">
                          <span className="detail-label">Variant</span>
                          <span className="detail-value">{bikeData.variant}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{bikeData.firstRegistered}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Colour</span>
                        <span className="detail-value">{bikeData.colour || 'Not specified'}</span>
                      </div>
                      {bikeData.bikeType && (
                        <div className="detail-item">
                          <span className="detail-label">Bike Type</span>
                          <span className="detail-value">{bikeData.bikeType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="detail-section">
                    <h3>Technical Specifications</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <span className="detail-label">Fuel Type</span>
                        <span className="detail-value">{bikeData.fuelType}</span>
                      </div>
                      {bikeData.engineCC && (
                        <div className="detail-item">
                          <span className="detail-label">Engine</span>
                          <span className="detail-value">{bikeData.engineCC}cc</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Transmission</span>
                        <span className="detail-value">{bikeData.transmission || 'Manual'}</span>
                      </div>
                      {bikeData.emissionClass && (
                        <div className="detail-item">
                          <span className="detail-label">Emission Class</span>
                          <span className="detail-value">{bikeData.emissionClass}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Running Costs */}
                  {(bikeData.fuelEconomy || bikeData.co2Emissions || bikeData.annualTax || bikeData.insuranceGroup) && (
                    <div className="detail-section">
                      <h3>Running Costs</h3>
                      <div className="detail-items">
                        {bikeData.fuelEconomy?.combined && (
                          <div className="detail-item">
                            <span className="detail-label">Combined MPG</span>
                            <span className="detail-value">{bikeData.fuelEconomy.combined} mpg</span>
                          </div>
                        )}
                        {bikeData.co2Emissions && (
                          <div className="detail-item">
                            <span className="detail-label">CO₂ Emissions</span>
                            <span className="detail-value">{bikeData.co2Emissions}g/km</span>
                          </div>
                        )}
                        {bikeData.annualTax && (
                          <div className="detail-item">
                            <span className="detail-label">Annual Tax</span>
                            <span className="detail-value">{formatPrice(bikeData.annualTax)}</span>
                          </div>
                        )}
                        {bikeData.insuranceGroup && (
                          <div className="detail-item">
                            <span className="detail-label">Insurance Group</span>
                            <span className="detail-value">{bikeData.insuranceGroup}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Valuation */}
                  {bikeData.valuation?.estimatedValue && (
                    <div className="detail-section">
                      <h3>Estimated Value</h3>
                      <div className="detail-items">
                        {bikeData.valuation.estimatedValue.private && (
                          <div className="detail-item">
                            <span className="detail-label">Private Sale</span>
                            <span className="detail-value">{formatPrice(bikeData.valuation.estimatedValue.private)}</span>
                          </div>
                        )}
                        {bikeData.valuation.estimatedValue.retail && (
                          <div className="detail-item">
                            <span className="detail-label">Dealer Price</span>
                            <span className="detail-value">{formatPrice(bikeData.valuation.estimatedValue.retail)}</span>
                          </div>
                        )}
                        {bikeData.valuation.estimatedValue.partExchange && (
                          <div className="detail-item">
                            <span className="detail-label">Part Exchange</span>
                            <span className="detail-value">{formatPrice(bikeData.valuation.estimatedValue.partExchange)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Safety Checks */}
                  <div className="detail-section safety-section">
                    <h3>Safety Checks</h3>
                    <div className="safety-items">
                      <div className={`safety-item ${bikeData.isStolen ? 'warning' : 'safe'}`}>
                        <span className="safety-icon">{bikeData.isStolen ? '⚠️' : '✓'}</span>
                        <span className="safety-label">Stolen Check</span>
                        <span className="safety-status">{bikeData.isStolen ? 'STOLEN' : 'Clear'}</span>
                      </div>
                      <div className={`safety-item ${bikeData.isWrittenOff ? 'warning' : 'safe'}`}>
                        <span className="safety-icon">{bikeData.isWrittenOff ? '⚠️' : '✓'}</span>
                        <span className="safety-label">Write-Off Check</span>
                        <span className="safety-status">
                          {bikeData.isWrittenOff ? `CAT ${bikeData.writeOffCategory}` : 'Clear'}
                        </span>
                      </div>
                      <div className={`safety-item ${bikeData.hasOutstandingFinance ? 'warning' : 'safe'}`}>
                        <span className="safety-icon">{bikeData.hasOutstandingFinance ? '⚠️' : '✓'}</span>
                        <span className="safety-label">Finance Check</span>
                        <span className="safety-status">{bikeData.hasOutstandingFinance ? 'Outstanding' : 'Clear'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="found-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => navigate(`/bikes/selling?registration=${bikeData.vrm}`)}
                  >
                    Sell This Bike
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      setShowBikeFound(false);
                      setBikeData(null);
                      setRegistrationNumber('');
                    }}
                  >
                    Check Another Bike
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Info Section */}
        <section className="info-section">
          <div className="container">
            <h2>Why Check Your Bike?</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">🔍</div>
                <h3>Verify Details</h3>
                <p>Confirm your bike's make, model, and specifications before selling or buying.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📋</div>
                <h3>MOT History</h3>
                <p>Access complete MOT test history and upcoming MOT due dates.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">💰</div>
                <h3>Valuation</h3>
                <p>Get an estimated market value for your bike based on current data.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🛡️</div>
                <h3>Safety Checks</h3>
                <p>Check for stolen status, write-offs, and outstanding finance.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BikeCheckPage;
