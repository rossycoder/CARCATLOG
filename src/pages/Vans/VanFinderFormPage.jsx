import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import './VanFinderFormPage.css';

const VanFinderFormPage = () => {
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
    const savedData = localStorage.getItem('vanFinderFormData');
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
      localStorage.setItem('vanFinderFormData', JSON.stringify(formData));
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
    
    if (numValue > 300000) {
      return 'This mileage seems unusually high for a van. Please verify.';
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
    
    try {
      // Call DVLA lookup API
      const vanService = await import('../../services/vanService');
      const response = await vanService.lookupVanByRegistration(
        formData.registrationNumber,
        formData.mileage
      );
      
      if (response.success && response.data) {
        setVehicleDetails(response.data);
        
        // Scroll to vehicle details
        setTimeout(() => {
          document.getElementById('vehicle-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(response.message || 'Failed to lookup vehicle');
      }
    } catch (error) {
      console.error('Error looking up van:', error);
      setErrors({
        ...errors,
        registrationNumber: error.message || 'Unable to find vehicle details. Please check the registration number and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createVanAdvert = async () => {
    try {
      setIsLoading(true);
      
      // Generate UUID for advert
      const advertId = uuidv4();
      
      // Store van advert data in localStorage
      const vanAdvertData = {
        id: advertId,
        vehicleData: vehicleDetails,
        advertData: {
          price: '',
          vatStatus: 'no_vat',
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
      
      localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
      
      // Navigate to the van advert edit page
      navigate(`/vans/selling/advert/edit/${advertId}`);
    } catch (error) {
      console.error('Error creating van advert:', error);
      alert(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to edit page for trade dealers (same as regular users)
  const goToSellerContactPage = async () => {
    try {
      setIsLoading(true);
      
      // Generate UUID for advert
      const advertId = uuidv4();
      
      // Store van advert data in localStorage
      const vanAdvertData = {
        id: advertId,
        vehicleData: vehicleDetails,
        advertData: {
          price: vehicleDetails.estimatedValue || 0,
          vatStatus: 'no_vat',
          description: '',
          photos: [],
          contactPhone: dealer?.phone || '',
          contactEmail: dealer?.email || '',
          location: dealer?.businessAddress?.postcode || ''
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
      
      // Navigate to the van advert edit page first (not directly to contact page)
      navigate(`/vans/selling/advert/edit/${advertId}`);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
      alert(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const mileageWarning = getMileageWarning(formData.mileage);

  return (
    <div className="van-finder-form-page">
      {/* Form Section */}
      <main className="form-section">
        <div className="form-container">
          <h1 className="form-title">Find your van</h1>
          
          <form onSubmit={handleSubmit} className="van-finder-form">
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
              {isLoading ? 'Finding your van...' : 'Find my van'}
            </button>
          </form>
        </div>
      </main>

      {/* Vehicle Details Section */}
      {vehicleDetails && (
        <section id="vehicle-details" className="vehicle-details-section">
          <div className="vehicle-details-container">
            <h2 className="vehicle-details-title">Your Van Details</h2>
            
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
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                ) : (
                  <p className="detail-value">{vehicleDetails.fuelType}</p>
                )}
              </div>

              <div className="detail-item">
                <label className="detail-label">Van Type</label>
                {isEditing ? (
                  <select
                    className="detail-input"
                    value={vehicleDetails.vanType}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, vanType: e.target.value})}
                  >
                    <option value="Panel Van">Panel Van</option>
                    <option value="Chassis Cab">Chassis Cab</option>
                    <option value="Crew Van">Crew Van</option>
                    <option value="Tipper">Tipper</option>
                    <option value="Dropside">Dropside</option>
                    <option value="Luton">Luton</option>
                  </select>
                ) : (
                  <p className="detail-value">{vehicleDetails.vanType}</p>
                )}
              </div>

              <div className="detail-item">
                <label className="detail-label">Payload Capacity</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="detail-input"
                    value={vehicleDetails.payloadCapacity}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, payloadCapacity: e.target.value})}
                  />
                ) : (
                  <p className="detail-value">{vehicleDetails.payloadCapacity} kg</p>
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

              <div className="detail-item">
                <label className="detail-label">MOT Due</label>
                <p className="detail-value">{vehicleDetails.motDue}</p>
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
                      className="publish-vehicle-button"
                      onClick={goToSellerContactPage}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : '🚐 Continue to Publish'}
                    </button>
                  ) : (
                    <button 
                      className="create-advert-button"
                      onClick={createVanAdvert}
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

export default VanFinderFormPage;
