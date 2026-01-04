import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import advertService from '../services/advertService';
import { useTradeDealerContext } from '../context/TradeDealerContext';
import './CarFinderFormPage.css';

// Helper to format DVLA response to vehicle details
const formatVehicleDetails = (dvlaData, registration, mileage) => {
  return {
    registration: registration,
    mileage: mileage,
    make: dvlaData.make || 'Unknown',
    model: dvlaData.model || 'Unknown',
    year: dvlaData.yearOfManufacture || dvlaData.year || 'Unknown',
    color: dvlaData.colour || dvlaData.color || 'Unknown',
    fuelType: dvlaData.fuelType || 'Unknown',
    transmission: dvlaData.transmission || 'Manual',
    engineSize: dvlaData.engineCapacity ? `${(dvlaData.engineCapacity / 1000).toFixed(1)}L` : 'Unknown',
    doors: dvlaData.doors || '4',
    bodyType: dvlaData.bodyType || dvlaData.typeApproval || 'Unknown',
    previousOwners: dvlaData.previousOwners || '1',
    motDue: dvlaData.motExpiryDate || 'Unknown',
    taxDue: dvlaData.taxDueDate || 'Unknown',
    co2Emissions: dvlaData.co2Emissions || 'Unknown',
    euroStatus: dvlaData.euroStatus || 'Unknown',
    seats: dvlaData.seats || '5',
    estimatedValue: dvlaData.estimatedValue || null
  };
};

const CarFinderFormPage = () => {
  const navigate = useNavigate();
  const { dealer, isAuthenticated } = useTradeDealerContext();
  const isTradeDealer = isAuthenticated && dealer;
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    mileage: ''
  });
  
  const [errors, setErrors] = useState({
    registrationNumber: '',
    mileage: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('carFinderFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data');
      }
    }
  }, []);

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
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, registrationNumber: value }));
    
    // Real-time validation
    const error = validateRegistration(value);
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
    
    // Use mock data directly (DVLA API not configured)
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockVehicleData = generateMockVehicleData(
      formData.registrationNumber,
      formData.mileage
    );
    
    setVehicleDetails(mockVehicleData);
    
    // Scroll to vehicle details
    setTimeout(() => {
      document.getElementById('vehicle-details')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    setIsLoading(false);
  };

  // Generate mock vehicle data based on registration pattern
  const generateMockVehicleData = (registration, mileage) => {
    // Extract year from registration (UK format: AB12CDE - 12 = 2012)
    const yearMatch = registration.match(/[A-Z]{2}(\d{2})/i);
    let year = 2020;
    if (yearMatch) {
      const regYear = parseInt(yearMatch[1]);
      year = regYear >= 50 ? 1950 + regYear : 2000 + regYear;
    }
    
    // Mock makes and models
    const makes = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Ford', 'Toyota', 'Honda'];
    const models = {
      'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
      'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
      'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
      'Volkswagen': ['Golf', 'Polo', 'Tiguan', 'Passat', 'T-Roc'],
      'Ford': ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Mustang'],
      'Toyota': ['Corolla', 'Yaris', 'RAV4', 'C-HR', 'Camry'],
      'Honda': ['Civic', 'CR-V', 'Jazz', 'HR-V', 'Accord']
    };
    
    const randomMake = makes[Math.floor(Math.random() * makes.length)];
    const makeModels = models[randomMake];
    const randomModel = makeModels[Math.floor(Math.random() * makeModels.length)];
    
    const colors = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey'];
    const fuelTypes = ['Petrol', 'Diesel', 'Hybrid'];
    const transmissions = ['Manual', 'Automatic'];
    const bodyTypes = ['Saloon', 'Hatchback', 'SUV', 'Estate', 'Coupe'];
    
    // Calculate estimated value based on year and mileage
    const baseValue = 25000;
    const yearDepreciation = (2024 - year) * 1500;
    const mileageDepreciation = Math.floor(parseInt(mileage) / 10000) * 500;
    const estimatedValue = Math.max(baseValue - yearDepreciation - mileageDepreciation, 3000);
    
    return {
      registration: registration.toUpperCase(),
      mileage: mileage,
      make: randomMake,
      model: randomModel,
      year: year.toString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      engineSize: ['1.6L', '2.0L', '2.5L', '3.0L'][Math.floor(Math.random() * 4)],
      doors: ['3', '4', '5'][Math.floor(Math.random() * 3)],
      bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
      previousOwners: Math.floor(Math.random() * 4 + 1).toString(),
      motDue: `${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}/${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}/2026`,
      taxDue: '01/04/2025',
      co2Emissions: `${Math.floor(Math.random() * 100 + 100)}g/km`,
      euroStatus: 'Euro 6',
      seats: '5',
      estimatedValue: estimatedValue
    };
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
