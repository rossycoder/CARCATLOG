import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lookupVehicle } from '../services/dvlaService';
import { checkVehicleHistory } from '../services/vehicleHistoryService';
import './VehicleDetailPage.css';

const VehicleDetailPage = () => {
  const { registration } = useParams();
  const navigate = useNavigate();
  
  // State management for vehicle data, loading, and errors
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate registration parameter on component mount
  useEffect(() => {
    if (!registration || registration.length < 2) {
      navigate('/vehicle-check');
      return;
    }
    
    // Initialize data fetching
    fetchVehicleData(registration);
  }, [registration, navigate]);

  // Real API data fetching logic
  const fetchVehicleData = async (reg) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching vehicle data for registration: ${reg}`);
      
      // Don't make API calls for detail page - use existing data
      console.log('⚠️ Skipping API calls to avoid charges - detail page should use database data');
      
      // For detail page, we should fetch from our database instead of external APIs
      // This is just a placeholder - the actual car detail should come from database
      const placeholderData = {
        registrationNumber: reg,
        make: 'Vehicle',
        model: 'Details',
        year: new Date().getFullYear(),
        message: 'Vehicle details should be loaded from database, not external APIs'
      };
      
      // Combine and process the data
      const combinedData = combineVehicleData(null, null, reg);
      
      setVehicleData(combinedData.vehicleData || placeholderData);
      
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to load vehicle information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Data combination logic
  const combineVehicleData = (dvlaData, historyData, registration) => {
    // Check if we have successful data from each source
    const hasDvlaData = dvlaData && dvlaData.success;
    const hasHistoryData = historyData && historyData.success;
    
    // Extract vehicle information from DVLA response
    const dvlaVehicle = hasDvlaData ? dvlaData.data || dvlaData.vehicle : null;
    
    // Extract vehicle information from history response
    const historyVehicle = hasHistoryData ? historyData.data : null;
    
    // Combine data with DVLA taking priority for overlapping fields
    const vehicleData = {
      vrm: registration.toUpperCase(),
      make: dvlaVehicle?.make || historyVehicle?.make || 'Make information unavailable',
      model: (dvlaVehicle?.model && dvlaVehicle.model !== 'Unknown') ? dvlaVehicle.model : 
             (historyVehicle?.model && historyVehicle.model !== 'Unknown') ? historyVehicle.model : 
             'Model information unavailable',
      bodyType: dvlaVehicle?.bodyType || historyVehicle?.bodyType || 'Body type unavailable',
      colour: dvlaVehicle?.colour || dvlaVehicle?.color || historyVehicle?.colour || 'Colour unavailable',
      firstRegistered: dvlaVehicle?.yearOfManufacture || dvlaVehicle?.year || 
                      historyVehicle?.firstRegistered || 'Registration date unavailable',
      fuelType: dvlaVehicle?.fuelType || historyVehicle?.fuelType || 'Fuel type unavailable',
      engineSize: dvlaVehicle?.engineCapacity ? 
                  `${(dvlaVehicle.engineCapacity / 1000).toFixed(1)}L` : 
                  (historyVehicle?.engineSize || 'Engine size unavailable'),
      transmission: historyVehicle?.transmission || 'Manual',
      co2Emissions: dvlaVehicle?.co2Emissions || '155',
      taxStatus: dvlaVehicle?.taxStatus || 'Untaxed',
      motStatus: dvlaVehicle?.motStatus || 'Not valid'
    };
    
    return { vehicleData };
  };

  const handleBuyCheck = () => {
    // Navigate to payment page with registration
    navigate(`/vehicle-check/payment/demo-session?registration=${encodeURIComponent(registration)}&channel=cars`);
  };

  const handleBack = () => {
    navigate('/vehicle-check');
  };

  if (isLoading) {
    return (
      <div className="vehicle-detail-page">
        <div className="container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Loading vehicle information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-detail-page">
        <div className="container">
          <div className="error-card">
            <h2>Unable to Load Vehicle Information</h2>
            <p>{error}</p>
            <button onClick={() => fetchVehicleData(registration)} className="retry-button">
              Try Again
            </button>
            <button onClick={handleBack} className="back-button-secondary">
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-detail-page">
      <div className="container">
        {/* Navigation breadcrumb */}
        <div className="breadcrumb">
          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>

        {/* Main content matching the image */}
        <div className="summary-card">
          <h2>Your summary</h2>
          <p>You've chosen to buy a vehicle check report for the following vehicle:</p>
          
          <div className="summary-table">
            <div className="summary-row">
              <span className="label">Registration</span>
              <span className="value">{vehicleData?.vrm || registration?.toUpperCase()}</span>
            </div>
            <div className="summary-row">
              <span className="label">Make</span>
              <span className="value">{vehicleData?.make}</span>
            </div>
            <div className="summary-row">
              <span className="label">Model</span>
              <span className="value">{vehicleData?.model}</span>
            </div>
            <div className="summary-row">
              <span className="label">Body type</span>
              <span className="value">{vehicleData?.bodyType}</span>
            </div>
            <div className="summary-row">
              <span className="label">Colour</span>
              <span className="value">{vehicleData?.colour}</span>
            </div>
            <div className="summary-row">
              <span className="label">First registered</span>
              <span className="value">{vehicleData?.firstRegistered}</span>
            </div>
            <div className="summary-row total-row">
              <span className="label">Total to pay:</span>
              <span className="value">£4.95</span>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="payment-method-card">
          <h2>Payment method</h2>
          
          <div className="payment-option selected">
            <div className="payment-option-header">
              <input type="radio" id="card" name="payment" defaultChecked />
              <label htmlFor="card">
                <span className="payment-icon">💳</span>
                Card
              </label>
            </div>
            
            <div className="secure-notice">
              <span className="secure-icon">🔒</span>
              Secure, fast checkout with Link
            </div>

            <div className="card-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Card number</label>
                  <input 
                    type="text" 
                    placeholder="1234 1234 1234 1234"
                    className="card-input"
                  />
                  <div className="card-icons">
                    <span className="card-brand">💳</span>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Expiry date</label>
                  <input 
                    type="text" 
                    placeholder="MM / YY"
                    className="card-input"
                  />
                </div>
                <div className="form-group half">
                  <label>Security code</label>
                  <input 
                    type="text" 
                    placeholder="CVC"
                    className="card-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Country</label>
                  <select className="card-input">
                    <option value="PK">Pakistan</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Google Pay Option */}
          <div className="payment-option">
            <div className="payment-option-header">
              <input type="radio" id="googlepay" name="payment" />
              <label htmlFor="googlepay">
                <span className="payment-icon">🅖</span>
                Google Pay
              </label>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              I understand that my vehicle check report will be provided immediately. I acknowledge that by proceeding to payment I lose my right to cancel the purchase and obtain a refund under Consumer Contracts Regulations.
            </label>
            
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              I have read and accept the <a href="#" className="link">Privacy Notice</a>, or for motor traders, the <a href="#" className="link">Retailer Privacy Notice</a>.
            </label>
            
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              I have read and accept the <a href="#" className="link">Terms and Conditions</a>.
            </label>
          </div>

          {/* Buy Button */}
          <button 
            className="buy-button"
            onClick={handleBuyCheck}
          >
            Buy check
          </button>
        </div>
      </div>
    </div>
  );
};



export default VehicleDetailPage;