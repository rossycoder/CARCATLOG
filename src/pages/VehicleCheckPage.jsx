import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/paymentService';
import './VehicleCheckPage.css';

const VehicleCheckPage = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating payment session for vehicle:', registrationNumber);
      const response = await createCheckoutSession(registrationNumber);
      
      if (response.success) {
        // Redirect to the payment page with the custom session ID
        const paymentUrl = `/vehicle-check/payment/${response.data.customSessionId}?registration=${encodeURIComponent(registrationNumber.toUpperCase())}&channel=cars`;
        navigate(paymentUrl);
      } else {
        setError(response.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create payment session';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vehicle-check-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-form-card">
              <div className="form-header">
                <h2>VEHICLE CHECK</h2>
                <p>Check if a vehicle is stolen or has outstanding finance</p>
              </div>
              <form onSubmit={handleSubmit} className="check-form">
                <div className="form-group">
                  <label htmlFor="registration">Enter registration</label>
                  <input
                    type="text"
                    id="registration"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12CDE"
                    className="registration-input"
                  />
                </div>
                <button 
                  type="submit" 
                  className="check-button"
                  disabled={isLoading || !registrationNumber.trim()}
                >
                  {isLoading ? 'Checking...' : 'Start a check'}
                </button>
              </form>
             
            </div>

          </div>
         
        </div>
      </section>

      {/* Error Section */}
      {error && (
        <section className="results-section">
          <div className="container">
            <div className="error-card">
              <div className="error-header">
                <h3>Unable to create payment session</h3>
              </div>
              <div className="error-content">
                <p>{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                  }}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Get a Vehicle Check Section */}
      <section className="why-check-section">
        <div className="container">
          <h2>Why get a vehicle check?</h2>
          <div className="statistics-grid">
            <div className="statistic-card">
              <div className="statistic-icon red-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m-4-8V9a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 4v3a2 2 0 0 1-2 2h-4m-5-3v2a2 2 0 0 0 2 2h2"/>
                  <path d="M7 7h10v4H7z"/>
                  <path d="M9 9h6v2H9z"/>
                </svg>
              </div>
              <div className="statistic-number">1 IN 10 VEHICLES</div>
              <div className="statistic-description">WAS LISTED AS AN INSURANCE TOTAL LOSS*</div>
            </div>
            
            <div className="statistic-card">
              <div className="statistic-icon blue-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M7 15h.01M17 15h.01M7 11h8M7 7h3"/>
                </svg>
              </div>
              <div className="statistic-number">1 IN 6 VEHICLES</div>
              <div className="statistic-description">SHOWED OUTSTANDING FINANCE*</div>
            </div>
            
            <div className="statistic-card">
              <div className="statistic-icon yellow-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div className="statistic-number">79,390 VEHICLES</div>
              <div className="statistic-description">WERE MARKED AS STOLEN IN 2020**</div>
            </div>
          </div>
          
          <div className="statistics-footnotes">
            <p>* Based on vehicle checks completed in 2020.</p>
            <p>** Vehicles recorded as stolen on the Police National Computer in 2020.</p>
          </div>
        </div>
      </section>

      {/* What Does a Vehicle Check Tell You Section */}
      <section className="check-details-section">
        <div className="container">
          <h2>What does a vehicle check tell you?</h2>
          <p className="section-subtitle">Our vehicle check will tell you everything you need to know about the vehicle and its history. Some of the details provided include:</p>
          
          <div className="check-details-grid">
            <div className="details-column">
              <div className="column-icon red-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m-4-8V9a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 4v3a2 2 0 0 1-2 2h-4m-5-3v2a2 2 0 0 0 2 2h2"/>
                  <path d="M7 7h10v4H7z"/>
                </svg>
              </div>
              <h3>Key information</h3>
              <ul>
                <li>Reported stolen</li>
                <li>Insurance write-off</li>
                <li>Outstanding finance</li>
                <li>Imported / exported</li>
                <li>Mileage history</li>
                <li>Colour changes</li>
              </ul>
            </div>
            
            <div className="details-column">
              <div className="column-icon blue-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M7 15h.01M17 15h.01M7 11h8M7 7h3"/>
                </svg>
              </div>
              <h3>Specification</h3>
              <ul>
                <li>Make</li>
                <li>Model</li>
                <li>Transmission</li>
                <li>Fuel type</li>
                <li>Body type</li>
                <li>Engine capacity</li>
              </ul>
            </div>
            
            <div className="details-column">
              <div className="column-icon yellow-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3>Vehicle data</h3>
              <ul>
                <li>Engine number</li>
                <li>Year of manufacture</li>
                <li>Date first registered</li>
                <li>CO₂ emissions</li>
                <li>Environmental report</li>
                <li>VIN confirmation</li>
              </ul>
            </div>
          </div>
          
          <div className="cta-section">
            <button className="sample-report-button">View sample report</button>
          </div>
        </div>
      </section>

      {/* What Do You Get Section */}
      <section className="what-you-get-section">
        <div className="container">
          <h2>What do you receive with our vehicle check?</h2>
          <div className="benefits-wrapper">
            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon red-circle">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m-4-8V9a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 4v3a2 2 0 0 1-2 2h-4m-5-3v2a2 2 0 0 0 2 2h2"/>
                    <path d="M9 7l2 2 4-4"/>
                    <path d="M9 11l2 2 4-4"/>
                    <path d="M9 15l2 2 4-4"/>
                  </svg>
                </div>
              </div>
              <div className="benefit-content">
                <h3>Peace of mind</h3>
                <p>A vehicle check ensures that the car you're buying matches the advertisement. This is done by cross-referencing the advert's information against trusted sources.</p>
              </div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <div className="benefit-icon blue-circle">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                    <path d="M16 10a4 4 0 0 0-8 0"/>
                    <circle cx="12" cy="10" r="2"/>
                  </svg>
                </div>
              </div>
              <div className="benefit-content">
                <h3>Fraud Protection</h3>
                <p>After running a check, it is important to verify the Vehicle Identification Number (VIN) to identify any fraudulent issues with the car.</p>
                <a href="#" className="vin-link">What is a VIN and where can I find it?</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2>What is the price?</h2>
          <div className="pricing-content">
            <div className="pricing-left">
              <div className="peace-card">
                <h3>Peace before purchase</h3>
                <p>A vehicle check offers an instant history report, eliminating surprise elements should you opt to purchase.</p>
                <ul className="peace-features">
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Details regarding if a used car was either stolen or scrapped
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Outstanding finance linked to the car
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Mileage inconsistencies potentially pointing towards being mileage fraud
                  </li>
                </ul>
              </div>
            </div>
            <div className="pricing-right">
              <div className="price-section">
                <div className="price-header">
                  <span className="price-label">Vehicle check report</span>
                  <div className="price-amount">£4.95</div>
                  <span className="price-period">per check</span>
                </div>
                <div className="price-form">
                  <label htmlFor="price-registration">Enter registration</label>
                  <div className="form-row">
                    <input
                      type="text"
                      id="price-registration"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. AB12CDE"
                      className="price-input"
                    />
                    <button 
                      onClick={handleSubmit}
                      className="price-check-button"
                      disabled={isLoading || !registrationNumber.trim()}
                    >
                      {isLoading ? 'Checking...' : 'Start a check'}
                    </button>
                  </div>
                  <div className="already-checked-section">
                    <p>Already checked a vehicle?</p>
                    <a href="#" className="view-previous-link">View previous checks</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

    
    </div>
  );
};

export default VehicleCheckPage;