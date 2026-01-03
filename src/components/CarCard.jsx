import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CarCard.css';

const CarCard = ({ car }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/signin';
      return;
    }
    setSaved(!saved);
    // TODO: Call API to save/unsave car
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? (car.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === (car.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageCount = car.images?.length || 0;
  const hasReserveOnline = car.advertStatus === 'active' || car.condition === 'new';
  const currentImage = car.images?.[currentImageIndex] || car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link to={`/cars/${car._id}`} className="car-card">
      <div className="car-image-container">
        {hasReserveOnline && (
          <div className="reserve-badge">Reserve online</div>
        )}
        
        <img 
          src={currentImage} 
          alt={`${car.make} ${car.model}`}
          className="car-image"
        />
        
        {imageCount > 1 && (
          <>
            <button 
              className="slider-btn prev-btn"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button 
              className="slider-btn next-btn"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="image-dots">
              {car.images.map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        <button 
          className={`save-button ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save car'}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={saved ? '#e31e24' : 'none'}
            stroke={saved ? '#e31e24' : '#fff'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {imageCount > 0 && (
          <div className="image-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>{currentImageIndex + 1}/{imageCount}</span>
          </div>
        )}
      </div>
      
      <div className="car-content">
        <h3 className="car-title">{car.make} {car.model}</h3>
        <p className="car-subtitle">{car.engineSize ? `${car.engineSize}L ` : ''}{car.fuelType} {car.transmission}</p>
        <p className="car-dealer">{car.sellerContact?.businessName || car.sellerContact?.city || 'Private seller'}</p>
        
        <div className="car-badges">
          {car.mileage && (
            <span className="badge">{car.mileage.toLocaleString()} miles</span>
          )}
          {car.year && (
            <span className="badge">{car.year} ({car.registrationNumber?.slice(0, 4) || 'reg'})</span>
          )}
        </div>

        {car.price && (
          <>
            {car.priceLabel && (
              <p className="price-label">{car.priceLabel}</p>
            )}
            <p className="car-price">{formatPrice(car.price)}</p>
          </>
        )}
        
        <div className="car-footer">
          <span className="car-location">
            📍 {car.locationName || car.sellerContact?.city || car.postcode || 'Location'}
            {car.distance && ` • ${car.distance.toFixed(1)} miles away`}
          </span>
          {car.sellerContact?.rating && (
            <span className="car-rating">
              ⭐ {car.sellerContact.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
