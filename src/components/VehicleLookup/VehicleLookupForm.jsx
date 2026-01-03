import { useState } from 'react';
import axios from 'axios';
import './VehicleLookupForm.css';

const VehicleLookupForm = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_BASE_URL}/vehicles/lookup`, {
        registrationNumber: registrationNumber.trim(),
        mileage: parseInt(mileage)
      });

      if (response.data.success) {
        setVehicleData(response.data.vehicle);
      }
    } catch (err) {
      console.error('Vehicle lookup error:', err);
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Unable to connect to vehicle lookup service. Please ensure the backend server is running.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to lookup vehicle. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegistrationNumber('');
    setMileage('');
    setVehicleData(null);
    setError(null);
  };

  return (
    <div className="vehicle-lookup-container">
      <div className="lookup-form-section">
        <h1>Find Your Car</h1>
        <p className="lookup-subtitle">Enter your registration number and mileage to get official vehicle details from DVLA</p>

        <form onSubmit={handleSubmit} className="lookup-form">
          <div className="form-group">
            <label htmlFor="registration">Registration Number</label>
            <input
              type="text"
              id="registration"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              placeholder="e.g. AB12 CDE"
              required
              disabled={loading}
              className="registration-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mileage">Mileage</label>
            <input
              type="number"
              id="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 25000"
              required
              min="0"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="lookup-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Looking up vehicle...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Find Your Car
              </>
            )}
          </button>
        </form>
      </div>

      {vehicleData && (
        <div className="vehicle-details-section">
          <div className="details-header">
            <h2>Your Vehicle Details</h2>
            <button onClick={handleReset} className="new-search-btn">
              New Search
            </button>
          </div>

          <div className="vehicle-details-card">
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">REGISTRATION NUMBER</span>
                <span className="detail-value">{vehicleData.registrationNumber}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">MILEAGE</span>
                <span className="detail-value">{vehicleData.mileage?.toLocaleString()} miles</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">MAKE</span>
                <span className="detail-value">{vehicleData.make}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">MODEL</span>
                <span className="detail-value">{vehicleData.model}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">YEAR</span>
                <span className="detail-value">{vehicleData.year}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">COLOR</span>
                <span className="detail-value">{vehicleData.color}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">FUEL TYPE</span>
                <span className="detail-value">{vehicleData.fuelType}</span>
              </div>

              {vehicleData.engineSize && (
                <div className="detail-item">
                  <span className="detail-label">ENGINE SIZE</span>
                  <span className="detail-value">{vehicleData.engineSize}L</span>
                </div>
              )}

              {vehicleData.co2Emissions && (
                <div className="detail-item">
                  <span className="detail-label">CO2 EMISSIONS</span>
                  <span className="detail-value">{vehicleData.co2Emissions}g/km</span>
                </div>
              )}

              {vehicleData.taxStatus && (
                <div className="detail-item">
                  <span className="detail-label">TAX STATUS</span>
                  <span className="detail-value status-badge">{vehicleData.taxStatus}</span>
                </div>
              )}

              {vehicleData.motStatus && (
                <div className="detail-item">
                  <span className="detail-label">MOT STATUS</span>
                  <span className="detail-value status-badge">{vehicleData.motStatus}</span>
                </div>
              )}
            </div>

            <div className="details-actions">
              <button className="btn-secondary">Edit Details</button>
              <button className="btn-primary">Create Car Advert</button>
            </div>
          </div>

          <div className="trust-section">
            <div className="trust-header">
              <h3>We're trusted on Trustpilot</h3>
            </div>
            <div className="trust-content">
              <div className="trust-star">⭐</div>
              <div className="trust-rating">
                <div className="stars">★★★★★</div>
                <div className="rating-text">4.6/5</div>
                <div className="reviews-count">based on 194,287 reviews</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleLookupForm;
