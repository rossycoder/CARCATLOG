import React, { useState, useEffect } from 'react';
import './LocationDisplay.css';

const LocationDisplay = ({ sellerPostcode, sellerLocation, distance }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [calculatedDistance, setCalculatedDistance] = useState(distance);

  useEffect(() => {
    // Try to get user's location from localStorage or browser
    const savedPostcode = localStorage.getItem('userPostcode');
    if (savedPostcode) {
      setUserLocation(savedPostcode);
    }
  }, []);

  const handleSetLocation = () => {
    const postcode = prompt('Enter your postcode to see distance:');
    if (postcode) {
      localStorage.setItem('userPostcode', postcode);
      setUserLocation(postcode);
      // Calculate distance (would need backend API call)
      calculateDistance(postcode, sellerPostcode);
    }
  };

  const calculateDistance = async (fromPostcode, toPostcode) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(
        `${API_BASE_URL}/postcode/distance?from=${fromPostcode}&to=${toPostcode}`
      );
      const data = await response.json();
      if (data.success) {
        setCalculatedDistance(data.data.distance);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div className="location-display">
      <div className="seller-location">
        <span className="location-icon">📍</span>
        <div className="location-details">
          <span className="location-label">Seller location:</span>
          <span className="location-value">
            {sellerLocation || 'Location available'}
          </span>
        </div>
      </div>

      {userLocation ? (
        <div className="user-location">
          <span className="location-icon">🏠</span>
          <div className="location-details">
            <span className="location-label">Your location:</span>
            <span className="location-value">{userLocation}</span>
          </div>
          <button className="change-location-btn" onClick={handleSetLocation}>
            Change
          </button>
        </div>
      ) : (
        <button className="set-location-btn" onClick={handleSetLocation}>
          📍 Set your location to see distance
        </button>
      )}

      {calculatedDistance && (
        <div className="distance-info">
          <span className="distance-icon">🚗</span>
          <span className="distance-value">
            {calculatedDistance.toFixed(1)} miles away
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
