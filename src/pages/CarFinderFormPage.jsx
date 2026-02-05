import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import advertService from '../services/advertService';
import { carService } from '../services/carService';
import { useTradeDealerContext } from '../context/TradeDealerContext';
import { useAuth } from '../context/AuthContext';
import './CarFinderFormPage.css';

// Helper to format vehicle data from basic API response (CarFinder - no expensive data)
const formatVehicleDetailsFromBasic = (basicData, registration, mileage) => {
  // Helper to check if value is valid (not null, undefined, or 'Unknown')
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== 'Unknown' && value !== '';
  };

  console.log('=== FORMATTING BASIC VEHICLE DATA FOR CARFINDER ===');
  console.log('Basic Data:', basicData);
  
  // Basic data is already unwrapped from the API, so we can use it directly
  
  // Create a descriptive model if not available
  const getModelDisplay = () => {
    const model = basicData.model;
    if (isValidValue(model)) {
      return model;
    }
    
    // CRITICAL FIX: Don't create fake models from fuel type
    // If no model is available, return null and let the backend handle it
    // The old logic was creating "ELECTRICITY" models for electric vehicles
    console.log('⚠️ No model available from API - returning null instead of creating fake model');
    return null;
  };

  // Get body type with better fallback
  const getBodyType = () => {
    const bodyType = basicData.bodyType;
    if (isValidValue(bodyType) && bodyType !== 'M1') {
      return bodyType;
    }
    return null;
  };

  // Ensure all values are properly formatted and not undefined
  const result = {
    registration: registration,
    mileage: mileage,
    make: isValidValue(basicData.make) ? String(basicData.make) : null,
    model: getModelDisplay() ? String(getModelDisplay()) : null,
    variant: isValidValue(basicData.variant) ? String(basicData.variant) : null,
    year: isValidValue(basicData.year) ? Number(basicData.year) : null,
    color: isValidValue(basicData.color) ? String(basicData.color) : null,
    fuelType: isValidValue(basicData.fuelType) ? String(basicData.fuelType) : null,
    transmission: isValidValue(basicData.transmission) ? String(basicData.transmission) : 'Manual',
    engineSize: isValidValue(basicData.engineSize) ? String(basicData.engineSize) : null,
    doors: isValidValue(basicData.doors) ? Number(basicData.doors) : null,
    bodyType: getBodyType() ? String(getBodyType()) : null,
    seats: isValidValue(basicData.seats) ? Number(basicData.seats) : null,
    gearbox: isValidValue(basicData.gearbox) ? String(basicData.gearbox) : null,
    emissionClass: isValidValue(basicData.emissionClass) ? String(basicData.emissionClass) : null,
    co2Emissions: isValidValue(basicData.co2Emissions) ? Number(basicData.co2Emissions) : null,
    
    // These fields are not available in basic lookup (will be fetched when car is saved)
    previousOwners: null,
    motDue: null,
    taxDue: null,
    euroStatus: null,
    estimatedValue: null
  };

  // Log the result to debug any remaining issues
  console.log('Final formatted vehicle data for CarFinder:', result);
  
  return result;
};

// Helper to format vehicle data from enhanced API response (already unwrapped by backend)
const formatVehicleDetails = (enhancedData, registration, mileage) => {
  // Helper to check if value is valid (not null, undefined, or 'Unknown')
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== 'Unknown' && value !== '';
  };

  console.log('=== FORMATTING ENHANCED VEHICLE DATA ===');
  console.log('Enhanced Data:', enhancedData);
  
  // Enhanced data is already unwrapped by the backend, so we can use it directly
  
  // Enhanced valuation extraction - prefer PRIVATE price for private sellers
  const getEstimatedValue = () => {
    console.log('=== EXTRACTING VALUATION (PRIVATE PREFERRED) ===');
    console.log('Enhanced Data Valuation:', enhancedData.valuation);
    
    // Check multiple possible locations for valuation
    const valuation = enhancedData.valuation || 
                     enhancedData.Valuation || 
                     enhancedData.valuationData;
    
    if (!valuation) {
      console.log('❌ No valuation object found');
      return null;
    }
    
    // Check for estimatedValue object
    const estimatedValue = valuation.estimatedValue || 
                          valuation.EstimatedValue || 
                          valuation.value ||
                          valuation.Value;
    
    if (!estimatedValue) {
      console.log('❌ No estimatedValue found in valuation');
      return null;
    }
    
    console.log('Estimated Value Object:', estimatedValue);
    
    // If it's an object with retail/trade/private
    if (typeof estimatedValue === 'object' && estimatedValue !== null) {
      // For private sellers, prefer PRIVATE price first
      const privateValue = estimatedValue.private || 
                          estimatedValue.Private || 
                          estimatedValue.privatePrice;
      const retailValue = estimatedValue.retail || 
                         estimatedValue.Retail || 
                         estimatedValue.retailPrice;
      const tradeValue = estimatedValue.trade || 
                        estimatedValue.Trade || 
                        estimatedValue.tradePrice;
      
      console.log('Valuation breakdown:', { private: privateValue, retail: retailValue, trade: tradeValue });
      
      // Prefer PRIVATE for private sellers, then retail, then trade
      const finalValue = privateValue || retailValue || tradeValue || estimatedValue.value;
      console.log('✅ Selected valuation (PRIVATE preferred):', finalValue);
      return finalValue;
    }
    
    // If it's a direct number
    if (typeof estimatedValue === 'number') {
      console.log('✅ Direct number valuation:', estimatedValue);
      return estimatedValue;
    }
    
    console.log('❌ Could not extract valuation value');
    return null;
  };

  // Create a descriptive model if not available
  const getModelDisplay = () => {
    const model = enhancedData.model;
    if (isValidValue(model)) {
      return model;
    }
    // If no model, create descriptive text from available data
    const parts = [];
    const engineSize = enhancedData.engineSize;
    const fuelType = enhancedData.fuelType;
    
    if (engineSize) {
      parts.push(`${parseFloat(engineSize).toFixed(1)}L`);
    }
    if (isValidValue(fuelType)) {
      parts.push(fuelType);
    }
    return parts.length > 0 ? parts.join(' ') : null;
  };

  // Get body type with better fallback
  const getBodyType = () => {
    const bodyType = enhancedData.bodyType;
    if (isValidValue(bodyType) && bodyType !== 'M1') {
      return bodyType;
    }
    return null;
  };

  // Get engine size display
  const getEngineSize = () => {
    const engineSize = enhancedData.engineSize;
    if (engineSize && engineSize > 0) {
      // engineSize from API is already in litres
      return `${parseFloat(engineSize).toFixed(1)}L`;
    }
    return null;
  };

  // Extract all fields from unwrapped enhanced data
  const make = enhancedData.make;
  const model = getModelDisplay();
  const variant = enhancedData.variant || enhancedData.modelVariant;
  const year = enhancedData.year;
  const color = enhancedData.color;
  const fuelType = enhancedData.fuelType;
  const transmission = enhancedData.transmission;
  const engineSize = getEngineSize();
  const doors = enhancedData.doors;
  const bodyType = getBodyType();
  const seats = enhancedData.seats;
  const previousOwners = enhancedData.previousOwners || enhancedData.numberOfPreviousKeepers;
  const gearbox = enhancedData.gearbox;
  const emissionClass = enhancedData.emissionClass;
  const co2Emissions = enhancedData.runningCosts?.co2Emissions || enhancedData.co2Emissions;

  // Ensure all values are properly formatted
  const result = {
    registration: registration,
    mileage: mileage,
    make: isValidValue(make) ? String(make) : null,
    model: model ? String(model) : null,
    variant: isValidValue(variant) ? String(variant) : null,
    year: isValidValue(year) ? Number(year) : null,
    color: isValidValue(color) ? String(color) : null,
    fuelType: isValidValue(fuelType) ? String(fuelType) : null,
    transmission: isValidValue(transmission) ? String(transmission) : 'Manual',
    engineSize: engineSize ? String(engineSize) : null,
    doors: isValidValue(doors) ? Number(doors) : null,
    bodyType: bodyType ? String(bodyType) : null,
    previousOwners: isValidValue(previousOwners) ? Number(previousOwners) : null,
    seats: isValidValue(seats) ? Number(seats) : null,
    gearbox: isValidValue(gearbox) ? String(gearbox) : null,
    emissionClass: isValidValue(emissionClass) ? String(emissionClass) : null,
    motDue: null,
    taxDue: null,
    co2Emissions: isValidValue(co2Emissions) ? Number(co2Emissions) : null,
    euroStatus: null,
    estimatedValue: getEstimatedValue()
  };

  // Log the result to debug any remaining object issues
  console.log('Final formatted vehicle data:', result);
  
  return result;
};

const CarFinderFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dealer, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const { user } = useAuth();
  const isTradeDealer = isTradeAuthenticated && dealer;
  const isRegularUser = !!user;
  const isAnyUserAuthenticated = isTradeDealer || isRegularUser;
  
  // Get passed state from navigation
  const passedRegistration = location.state?.registrationNumber || '';
  const passedMileage = location.state?.mileage || '';
  
  const [formData, setFormData] = useState({
    registrationNumber: passedRegistration,
    mileage: passedMileage
  });
  
  const [errors, setErrors] = useState({
    registrationNumber: '',
    mileage: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved form data from localStorage or use passed state
  useEffect(() => {
    // If we have passed state, use it and don't load from localStorage
    if (passedRegistration || passedMileage) {
      return;
    }
    
    // Check for pending vehicle details (after sign in)
    const pendingDetails = localStorage.getItem('pendingVehicleDetails');
    if (pendingDetails) {
      try {
        const parsed = JSON.parse(pendingDetails);
        setVehicleDetails(parsed);
        // Clear the pending details after loading
        localStorage.removeItem('pendingVehicleDetails');
        // Scroll to vehicle details
        setTimeout(() => {
          document.getElementById('vehicle-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      } catch (e) {
        console.error('Failed to parse pending vehicle details');
        localStorage.removeItem('pendingVehicleDetails');
      }
    }
    
    // Load saved form data (registration and mileage only, NOT vehicle details)
    const savedData = localStorage.getItem('carFinderFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data');
      }
    }
  }, [passedRegistration, passedMileage]);

  // Save form data to localStorage
  useEffect(() => {
    if (formData.registrationNumber || formData.mileage) {
      localStorage.setItem('carFinderFormData', JSON.stringify(formData));
    }
  }, [formData]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateRegistration = (value) => {
    if (!value.trim()) {
      return 'This field is required';
    }
    
    // UK registration format validation (simplified)
    const ukRegPattern = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[0-9]{1,4}[A-Z]{1,2}$|^[0-9]{1,3}[A-Z]{1,3}$|^[A-Z]{1,2}[0-9]{1,4}$|^[A-Z]{1,3}[0-9]{1,3}$/i;
    
    if (!ukRegPattern.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid UK registration number';
    }
    
    return '';
  };

  const validateMileage = (value) => {
    if (!value.trim()) {
      return 'This field is required';
    }
    
    const numValue = parseFloat(value.replace(/,/g, ''));
    
    if (isNaN(numValue)) {
      return 'Mileage must be a number';
    }
    
    if (numValue <= 0) {
      return 'Mileage must be a positive number';
    }
    
    return '';
  };

  const getMileageWarning = (value) => {
    const numValue = parseFloat(value.replace(/,/g, ''));
    
    if (isNaN(numValue)) return '';
    
    if (numValue < 100) {
      return 'This mileage seems unusually low. Please verify.';
    }
    
    if (numValue > 500000) {
      return 'This mileage seems unusually high. Please verify.';
    }
    
    return '';
  };

  const handleRegistrationChange = (e) => {
    const value = e.target.value;
    const upperValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, registrationNumber: upperValue }));
    
    // Real-time validation
    const error = validateRegistration(upperValue);
    setErrors(prev => ({ ...prev, registrationNumber: error }));
  };

  const handleMileageChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, mileage: value }));
    
    // Real-time validation
    const error = validateMileage(value);
    setErrors(prev => ({ ...prev, mileage: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const regError = validateRegistration(formData.registrationNumber);
    const mileageError = validateMileage(formData.mileage);
    
    setErrors({
      registrationNumber: regError,
      mileage: mileageError
    });
    
    if (regError || mileageError) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call basic vehicle service for CarFinder (cheap API - no expensive history/MOT)
      console.log('Looking up vehicle from basic service for CarFinder...');
      const response = await carService.basicLookup(
        formData.registrationNumber,
        formData.mileage
      );
      
      if (response.success && response.data) {
        console.log('Basic API response:', response.data);
        console.log('From cache:', response.fromCache, 'API calls:', response.apiCalls, 'Cost: £' + response.cost);
        
        // Format the basic response (data is already unwrapped)
        const vehicleData = formatVehicleDetailsFromBasic(
          response.data,
          formData.registrationNumber,
          formData.mileage
        );
        
        console.log('Formatted vehicle data:', vehicleData);
        setVehicleDetails(vehicleData);
        
        // Scroll to vehicle details
        setTimeout(() => {
          document.getElementById('vehicle-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('Failed to retrieve vehicle details');
      }
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      setErrors({
        ...errors,
        registrationNumber: 'Unable to find vehicle details. Please check the registration number and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mileageWarning = getMileageWarning(formData.mileage);

  return (
    <div className="car-finder-form-page">
   
      {/* Form Section */}
      <main className="form-section">
        <div className="form-container">
          <h1 className="form-title">Find your car</h1>
          
          <form onSubmit={handleSubmit} className="car-finder-form">
            {/* Registration Number Input */}
            <div className="form-field">
              <label htmlFor="registrationNumber" className="form-label">
                Registration number<span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                id="registrationNumber"
                className={`form-input ${errors.registrationNumber ? 'input-error' : ''}`}
                value={formData.registrationNumber}
                onChange={handleRegistrationChange}
                placeholder="e.g. AB12 CDE"
                aria-invalid={!!errors.registrationNumber}
                aria-describedby={errors.registrationNumber ? 'reg-error' : undefined}
              />
              {errors.registrationNumber && (
                <span id="reg-error" className="error-message" role="alert">
                  {errors.registrationNumber}
                </span>
              )}
            </div>

            {/* Mileage Input */}
            <div className="form-field">
              <label htmlFor="mileage" className="form-label">
                Current mileage<span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="mileage"
                className={`form-input ${errors.mileage ? 'input-error' : ''}`}
                value={formData.mileage}
                onChange={handleMileageChange}
                placeholder="e.g. 50000"
                aria-invalid={!!errors.mileage}
                aria-describedby={errors.mileage ? 'mileage-error' : mileageWarning ? 'mileage-warning' : undefined}
              />
              {errors.mileage && (
                <span id="mileage-error" className="error-message" role="alert">
                  {errors.mileage}
                </span>
              )}
              {!errors.mileage && mileageWarning && (
                <span id="mileage-warning" className="warning-message">
                  {mileageWarning}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
            >
              {isLoading ? 'Finding your car...' : 'Find my car'}
            </button>
          </form>
        </div>
      </main>

      {/* Vehicle Details Section */}
      {vehicleDetails && (
        <section id="vehicle-details" className="vehicle-details-section">
          <div className="vehicle-details-container">
            <h2 className="vehicle-details-title">Your Vehicle Details</h2>
            
            <div className="vehicle-details-grid">
              <div className="detail-item">
                <label className="detail-label">Registration Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="detail-input"
                    value={vehicleDetails.registration}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, registration: e.target.value.toUpperCase()})}
                  />
                ) : (
                  <p className="detail-value">{vehicleDetails.registration}</p>
                )}
              </div>

              <div className="detail-item">
                <label className="detail-label">Mileage</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="detail-input"
                    value={vehicleDetails.mileage}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, mileage: e.target.value.replace(/[^0-9]/g, '')})}
                  />
                ) : (
                  <p className="detail-value">{parseInt(vehicleDetails.mileage).toLocaleString()} miles</p>
                )}
              </div>

              {vehicleDetails.make && (
                <div className="detail-item">
                  <label className="detail-label">Make</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.make}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, make: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.make}</p>
                  )}
                </div>
              )}

              {vehicleDetails.model && (
                <div className="detail-item">
                  <label className="detail-label">Model</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.model}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, model: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.model}</p>
                  )}
                </div>
              )}

              {vehicleDetails.year && (
                <div className="detail-item">
                  <label className="detail-label">Year</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.year}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, year: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.year}</p>
                  )}
                </div>
              )}

              {vehicleDetails.color && (
                <div className="detail-item">
                  <label className="detail-label">Color</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.color}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, color: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.color}</p>
                  )}
                </div>
              )}

              {vehicleDetails.fuelType && (
                <div className="detail-item">
                  <label className="detail-label">Fuel Type</label>
                  {isEditing ? (
                    <select
                      className="detail-input"
                      value={vehicleDetails.fuelType}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, fuelType: e.target.value})}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  ) : (
                    <p className="detail-value">{vehicleDetails.fuelType}</p>
                  )}
                </div>
              )}

              <div className="detail-item">
                <label className="detail-label">Transmission</label>
                {isEditing ? (
                  <select
                    className="detail-input"
                    value={vehicleDetails.transmission}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, transmission: e.target.value})}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                ) : (
                  <p className="detail-value">{vehicleDetails.transmission}</p>
                )}
              </div>

              {vehicleDetails.engineSize && (
                <div className="detail-item">
                  <label className="detail-label">Engine Size</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.engineSize}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, engineSize: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.engineSize}</p>
                  )}
                </div>
              )}

              {vehicleDetails.doors && (
                <div className="detail-item">
                  <label className="detail-label">Doors</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.doors}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, doors: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.doors}</p>
                  )}
                </div>
              )}

              {vehicleDetails.bodyType && (
                <div className="detail-item">
                  <label className="detail-label">Body Type</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.bodyType}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, bodyType: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.bodyType}</p>
                  )}
                </div>
              )}

              {vehicleDetails.previousOwners && (
                <div className="detail-item">
                  <label className="detail-label">Previous Owners</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.previousOwners}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, previousOwners: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.previousOwners}</p>
                  )}
                </div>
              )}

              {vehicleDetails.gearbox && (
                <div className="detail-item">
                  <label className="detail-label">Gearbox</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.gearbox}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, gearbox: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.gearbox}</p>
                  )}
                </div>
              )}

              {vehicleDetails.emissionClass && (
                <div className="detail-item">
                  <label className="detail-label">Emission Class</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={vehicleDetails.emissionClass}
                      onChange={(e) => setVehicleDetails({...vehicleDetails, emissionClass: e.target.value})}
                    />
                  ) : (
                    <p className="detail-value">{vehicleDetails.emissionClass}</p>
                  )}
                </div>
              )}
            </div>

            <div className="vehicle-actions">
              {isEditing ? (
                <>
                  <button 
                    className="save-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Details
                  </button>
                  {isTradeDealer ? (
                    <button 
                      className="create-advert-button trade-publish-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          
                          // Trade dealer - create advert and go to advert edit page
                          console.log('Creating advert for trade dealer');
                          const response = await advertService.createAdvert(vehicleDetails);
                          
                          if (response.success && response.data) {
                            // Navigate to the advert edit page first
                            navigate(`/selling/advert/edit/${response.data.id}`);
                          } else {
                            throw new Error('Failed to create advert');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert(error.message || 'An error occurred. Please try again.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : '🚗 Continue to Publish'}
                    </button>
                  ) : (
                    <button 
                      className="create-advert-button"
                      onClick={async () => {
                        // Check if user is authenticated
                        if (!isAnyUserAuthenticated) {
                          // Store vehicle details in localStorage for after login
                          localStorage.setItem('pendingVehicleDetails', JSON.stringify(vehicleDetails));
                          // Redirect to sign in page
                          navigate('/signin', { 
                            state: { 
                              from: { pathname: '/find-your-car' },
                              message: 'Please sign in to continue listing your vehicle'
                            } 
                          });
                          return;
                        }

                        try {
                          setIsLoading(true);
                          
                          // Regular user - create advert and go to advert edit page
                          console.log('Creating advert for user');
                          const response = await advertService.createAdvert(vehicleDetails);
                          
                          if (response.success && response.data) {
                            // Navigate to the advert edit page
                            navigate(`/selling/advert/edit/${response.data.id}`);
                          } else {
                            throw new Error('Failed to create advert');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert(error.message || 'An error occurred. Please try again.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Continue to seller details'}
                    </button>
                  )}
                </>
              )}
              </div>
          </div>
        </section>
      )}

     
     
     
      

    </div>
  );
};

export default CarFinderFormPage;
