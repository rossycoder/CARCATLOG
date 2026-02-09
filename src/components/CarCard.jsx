import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { extractTownName } from '../utils/vehicleFormatter';
import ElectricVehicleBadge from './ElectricVehicleBadge';
import './CarCard.css';

const CarCard = ({ car }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug: Check if distance is coming
  console.log('CarCard - car data:', {
    make: car.make,
    model: car.model,
    distance: car.distance,
    locationName: car.locationName
  });

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
  const currentImage = car.images?.[currentImageIndex] || car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link to={`/cars/${car._id}`} className="car-card">
      <div className="car-image-container">
        
        <img 
          src={currentImage} 
          alt={`${car.make} ${car.model}${car.submodel ? ` ${car.submodel}` : ''}`}
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
            stroke={saved ? '#e31e24' : '#1a1a1a'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {imageCount > 0 && (
          <div className="image-count">
            <span>{currentImageIndex + 1}/{imageCount}</span>
          </div>
        )}
      </div>
      
      <div className="car-content">
        <h3 className="car-title">{car.make} {car.model}</h3>
        <p className="car-subtitle">
          {/* Use displayTitle from backend (Autotrader format) if available */}
          {car.displayTitle || (() => {
            const parts = [];
            
            // For electric vehicles, show range instead of engine size
            if (car.fuelType === 'Electric') {
              if (car.electricRange || car.runningCosts?.electricRange) {
                const range = car.electricRange || car.runningCosts?.electricRange;
                parts.push(`${range} miles range`);
              }
            } else {
              // Add engine size for non-electric vehicles
              if (car.engineSize) {
                parts.push(`${car.engineSize}L`);
              }
            }
            
            // Add variant if available and meaningful
            if (car.variant && 
                car.variant !== car.fuelType && 
                car.variant !== 'null' && 
                car.variant !== 'undefined') {
              parts.push(car.variant);
            } else if (car.submodel && 
                       car.submodel !== car.fuelType && 
                       car.submodel !== 'null' && 
                       car.submodel !== 'undefined') {
              parts.push(car.submodel);
            }
            
            // Add fuel type only if not obvious from variant or context
            const shouldShowFuelType = car.fuelType && (() => {
              const fuelType = car.fuelType.toLowerCase();
              const variant = (car.variant || car.submodel || '').toLowerCase();
              
              // Don't show fuel type if it's already implied by variant
              if (variant.includes('tdi') || variant.includes('diesel')) return false;
              if (variant.includes('tsi') || variant.includes('gti') || variant.includes('petrol')) return false;
              if (variant.includes('electric') || fuelType === 'electric') return false;
              if (variant.includes('hybrid')) return false;
              
              // BMW diesel models (320d, 520d, etc.) - 'd' suffix indicates diesel
              if (fuelType === 'diesel' && variant.match(/\d+d\b/i)) return false;
              
              // BMW petrol models (320i, 520i, etc.) - 'i' suffix indicates petrol
              if (fuelType === 'petrol' && variant.match(/\d+i\b/i)) return false;
              
              // For BMW electric models (i3, i4, iX, etc.), don't show "Electric"
              if (fuelType === 'electric' && (
                car.make === 'BMW' && (
                  car.model?.toLowerCase().startsWith('i') ||
                  variant.match(/^(m\d+|i\d+)$/i)
                )
              )) return false;
              
              return true;
            })();
            
            if (shouldShowFuelType) {
              parts.push(car.fuelType);
            }
            
            // Add doors
            if (car.doors) {
              parts.push(`${car.doors}dr`);
            }
            
            return parts.filter(Boolean).join(' | ');
          })()}
        </p>
        
        {car.serviceHistory && (
          <p className="car-service-history">{car.serviceHistory}</p>
        )}
        
        <div className="car-badges">
          {/* Electric Vehicle Badge */}
          <ElectricVehicleBadge vehicle={car} size="small" />
          
          {/* Show "Great price" badge if price is below estimated value */}
          {car.price && car.estimatedValue && car.price < car.estimatedValue * 0.9 && (
            <span className="badge price-badge">Great price</span>
          )}
          {/* Show insurance write-off category if exists */}
          {car.historyCheckId?.writeOffCategory && car.historyCheckId.writeOffCategory !== 'none' && car.historyCheckId.writeOffCategory !== 'unknown' && (
            <span className="badge cat-badge">Cat {car.historyCheckId.writeOffCategory}</span>
          )}
          {car.mileage && (
            <span className="badge">{car.mileage.toLocaleString()} miles</span>
          )}
          {car.year && (
            <span className="badge">
              {car.year} ({car.registrationNumber?.match(/\d{2}/)?.[0] || car.year.toString().slice(-2)} reg)
            </span>
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
            📍 {extractTownName(car.locationName) || car.sellerContact?.city || 'Location not available'}
            {car.distance != null && car.distance > 0 && (
              <> • <span className="distance-text">{Math.round(car.distance)} miles away</span></>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
