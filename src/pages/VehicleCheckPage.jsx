import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../services/paymentService';
import { checkVehicleHistory } from '../services/vehicleHistoryService';
import { lookupVehicle } from '../services/dvlaService';
import { generateVehicleHistoryPDF } from '../utils/pdfGenerator';
import './VehicleCheckPage.css';

const VehicleCheckPage = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [showVehicleFound, setShowVehicleFound] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setVehicleData(null);
    setShowVehicleFound(false);
    
    try {
      console.log('Fetching vehicle data for:', registrationNumber);
      
      // Fetch data from both APIs in parallel
      const [dvlaResult, historyResult] = await Promise.allSettled([
        lookupVehicle(registrationNumber, 0),
        checkVehicleHistory(registrationNumber, false)
      ]);
      
      console.log('DVLA Result:', dvlaResult);
      console.log('History Result:', historyResult);
      
      // Process DVLA response
      let vehicleInfo = null;
      let dvlaSuccess = false;
      if (dvlaResult.status === 'fulfilled' && dvlaResult.value?.success) {
        vehicleInfo = dvlaResult.value.data || dvlaResult.value.vehicle;
        dvlaSuccess = true;
        console.log('DVLA lookup successful:', vehicleInfo);
      } else {
        console.log('DVLA lookup failed:', dvlaResult.reason?.message || 'Unknown error');
      }
      
      // Process Vehicle History response
      let historyInfo = null;
      let historySuccess = false;
      if (historyResult.status === 'fulfilled' && historyResult.value?.success && historyResult.value?.data) {
        historyInfo = historyResult.value.data;
        historySuccess = true;
        console.log('History lookup successful');
      } else {
        console.log('History lookup failed:', historyResult.reason?.message || 'Unknown error');
      }
      
      // If both APIs failed, show error
      if (!dvlaSuccess && !historySuccess) {
        setError('Unable to fetch vehicle data. Please check the registration number and try again.');
        return;
      }
      
      // Merge data from both sources
      const mergedData = {
        vrm: registrationNumber.toUpperCase(),
        make: vehicleInfo?.make || historyInfo?.make || 'Unknown',
        model: vehicleInfo?.model || historyInfo?.model || 'Unknown',
        bodyType: vehicleInfo?.bodyType || historyInfo?.bodyType || historyInfo?.body_type || 'Unknown',
        colour: vehicleInfo?.colour || vehicleInfo?.color || historyInfo?.colour || historyInfo?.color || 'Unknown',
        firstRegistered: vehicleInfo?.yearOfManufacture || vehicleInfo?.year || historyInfo?.firstRegistered || historyInfo?.first_registered || historyInfo?.year || 'Unknown',
        fuelType: vehicleInfo?.fuelType || historyInfo?.fuelType || 'Unknown',
        engineSize: vehicleInfo?.engineCapacity ? `${(vehicleInfo.engineCapacity / 1000).toFixed(1)}L` : (historyInfo?.engineSize || 'Unknown'),
      };
      
      console.log('Merged vehicle data:', mergedData);
      setVehicleData(mergedData);
      setShowVehicleFound(true);
      
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch vehicle data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCheck = () => {
    // Navigate to payment page with vehicle data
    const paymentUrl = `/vehicle-check/payment/new?registration=${encodeURIComponent(registrationNumber.toUpperCase())}`;
    navigate(paymentUrl);
  };

  const handleViewSampleReport = () => {
    // Sample data for EK14 TWX
    const sampleVehicleData = {
      make: 'FORD',
      model: 'FIESTA',
      year: 2014,
      colour: 'Blue',
      fuelType: 'Petrol',
      engineSize: '1.0L',
      stolen: false,
      writeOff: false,
      outstandingFinance: false,
      mileage: 45000,
      previousOwners: 2,
      serviceHistory: 'Full Service History'
    };

    // Generate PDF with sample data
    generateVehicleHistoryPDF(sampleVehicleData, 'EK14TWX');
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

      {/* Vehicle Found Section */}
      {showVehicleFound && vehicleData && (
        <section className="results-section">
          <div className="container">
            <div className="vehicle-found-card">
              <button onClick={() => setShowVehicleFound(false)} className="back-link">
                ← Back
              </button>
              <h2>We've found this vehicle</h2>
              <h3>{vehicleData.make} {vehicleData.model} {vehicleData.firstRegistered}</h3>
              
              <div className="vehicle-details-table">
                <div className="detail-row">
                  <span className="label">Registration</span>
                  <span className="value">{vehicleData.vrm}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Body type</span>
                  <span className="value">{vehicleData.bodyType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Colour</span>
                  <span className="value">{vehicleData.colour}</span>
                </div>
                <div className="detail-row">
                  <span className="label">First registered</span>
                  <span className="value">{vehicleData.firstRegistered}</span>
                </div>
              </div>

              <button className="get-check-button" onClick={handleGetCheck}>
                Get check
              </button>

              <p className="not-right-vehicle">
                Not the right vehicle? <button onClick={() => setShowVehicleFound(false)} className="search-again-link">Search again</button>
              </p>

              <div className="check-benefits">
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Up to £30,000 data guarantee</span>
                </div>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>27 point independent report</span>
                </div>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Over 15,000 checks completed per month</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Section */}
      {error && (
        <section className="results-section">
          <div className="container">
            <div className="error-card">
              <div className="error-header">
                <h3>Unable to fetch vehicle data</h3>
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
            <button className="sample-report-button" onClick={handleViewSampleReport}>
              View sample report
            </button>
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
                <h3>Peace of mind before purchase</h3>
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