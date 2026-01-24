import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import advertService from '../services/advertService';
import { carService } from '../services/carService';
import { useTradeDealerContext } from '../context/TradeDealerContext';
import { useAuth } from '../context/AuthContext';
import './CarFinderFormPage.css';

// Helper to format vehicle data from enhanced API response
const formatVehicleDetails = (enhancedData, registration, mileage) => {
  // Helper to extract value from {value, source} format or direct value
  const getValue = (field) => {
    if (field === null || field === undefined) return null;
    if (typeof field === 'object' && field.value !== undefined) {
      return field.value;
    }
    return field;
  };

  // Helper to check if value is valid (not null, undefined, or 'Unknown')
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== 'Unknown' && value !== '';
  };

  // Create a descriptive model if not available
  const getModelDisplay = () => {
    const model = getValue(enhancedData.model);
    if (isValidValue(model)) {
      return model;
    }
    // If no model, create descriptive text from available data
    const parts = [];
    const engineSize = getValue(enhancedData.engineSize);
    const fuelType = getValue(enhancedData.fuelType);
    
    if (engineSize) {
      parts.push(`${(engineSize / 1000).toFixed(1)}L`);
    }
    if (isValidValue(fuelType)) {
      parts.push(fuelType);
    }
    return parts.length > 0 ? parts.join(' ') : null;
  };

  // Get body type with better fallback
  const getBodyType = () => {
    const bodyType = getValue(enhancedData.bodyType);
    if (isValidValue(bodyType) && bodyType !== 'M1') {
      return bodyType;
    }
    return null;
  };

  // Get engine size display
  const getEngineSize = () => {
    const engineSize = getValue(enhancedData.engineSize);
    if (engineSize) {
      // engineSize from API is already in litres, no need to divide
      return `${parseFloat(engineSize).toFixed(1)}L`;
    }
    return null;
  };

  const make = getValue(enhancedData.make);
  const model = getModelDisplay();
  const year = getValue(enhancedData.year);
  const color = getValue(enhancedData.color);
  const fuelType = getValue(enhancedData.fuelType);
  const transmission = getValue(enhancedData.transmission);
  const engineSize = getEngineSize();
  const doors = getValue(enhancedData.doors);
  const bodyType = getBodyType();
  const seats = getValue(enhancedData.seats);
  const previousOwners = getValue(enhancedData.previousOwners);
  const gearbox = getValue(enhancedData.gearbox);
  const emissionClass = getValue(enhancedData.emissionClass);

  return {
    registration: registration,
    mileage: mileage,
    make: isValidValue(make) ? make : null,
    model: model || null,
    year: isValidValue(year) ? year : null,
    color: isValidValue(color) ? color : null,
    fuelType: isValidValue(fuelType) ? fuelType : null,
    transmission: isValidValue(transmission) ? transmission : 'Manual',
    engineSize: engineSize || null,
    doors: isValidValue(doors) ? doors : null,
    bodyType: bodyType || null,
    previousOwners: isValidValue(previousOwners) ? previousOwners : null,
    seats: isValidValue(seats) ? seats : null,
    gearbox: isValidValue(gearbox) ? gearbox : null,
    emissionClass: isValidValue(emissionClass) ? emissionClass : null,
    motDue: null,
    taxDue: null,
    co2Emissions: getValue(enhancedData.runningCosts?.co2Emissions) || null,
    euroStatus: null,
    estimatedValue: getValue(enhancedData.valuation?.dealerPrice) || null
  };
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
      // Call enhanced vehicle service
      console.log('Looking up vehicle from enhanced service...');
      const response = await carService.enhancedLookup(
        formData.registrationNumber,
        formData.mileage
      );
      
      if (response.success && response.data) {
        console.log('Enhanced API response:', response.data);
        
        // Format the enhanced response directly
        const vehicleData = formatVehicleDetails(
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
                              from: '/find-your-car',
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          className="back-to-top-button"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span className="back-to-top-text">Back to top</span>
        </button>
      )}

      

    </div>
  );
};

export default CarFinderFormPage;
