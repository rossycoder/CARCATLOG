import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehicleLookupUniversalPage.css';

const VehicleLookupUniversalPage = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState('');
  const [mileage, setMileage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!registration.trim()) {
      setError('Please enter a registration number');
      return;
    }
    
    if (!mileage.trim()) {
      setError('Please enter mileage');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Call universal vehicle detection endpoint
      const response = await fetch(`${API_BASE_URL}/vehicles/detect-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationNumber: registration.toUpperCase(),
          mileage: parseInt(mileage)
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on vehicle type
        if (data.vehicleType === 'bike' || data.vehicleType === 'motorcycle') {
          // Redirect to bike sell page with data
          navigate('/bikes/sell-your-bike', {
            state: {
              registrationNumber: registration.toUpperCase(),
              mileage: mileage
            }
          });
        } else {
          // Redirect to car sell page with data
          navigate('/sell-your-car', {
            state: {
              registrationNumber: registration.toUpperCase(),
              mileage: mileage
            }
          });
        }
      } else {
        setError(data.message || 'Vehicle not found');
      }
    } catch (err) {
      console.error('Error detecting vehicle type:', err);
      setError('Failed to lookup vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="universal-lookup-page">
      <div className="lookup-container">
        <h1>Find Your Vehicle</h1>
        <p className="subtitle">Enter your registration to get started</p>

        <div className="lookup-form">
          <div className="form-group">
            <label>Registration Number</label>
            <input
              type="text"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="e.g. AB12 CDE"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Current Mileage</label>
            <input
              type="text"
              value={mileage}
              onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 50000"
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            onClick={handleLookup}
            disabled={isLoading}
            className="lookup-button"
          >
            {isLoading ? 'Looking up...' : 'Find My Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleLookupUniversalPage;
