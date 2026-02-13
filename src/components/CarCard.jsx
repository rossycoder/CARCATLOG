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
  const [renderError, setRenderError] = useState(null);

  // Debug: Check if distance is coming
  console.log('CarCard - car data:', {
    reg: car.registrationNumber,
    make: car.make,
    model: car.model,
    distance: car.distance,
    locationName: car.locationName,
    writeOff: car.historyCheckId?.writeOffCategory
  });

  // Safety check: Ensure car has required data
  if (!car || !car.make || !car.model) {
    console.error('❌ CarCard: Missing required data', car);
    return null;
  }

  // If there was a render error, show error card
  if (renderError) {
    console.error('❌ CarCard render error for', car.registrationNumber, renderError);
    return (
      <div className="car-card" style={{border: '2px solid red', padding: '20px'}}>
        <h3>Error rendering car</h3>
        <p>{car.registrationNumber} - {car.make} {car.model}</p>
        <p style={{color: 'red', fontSize: '12px'}}>{renderError.message}</p>
      </div>
    );
  }

  try {

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
          {/* Always generate comprehensive title (ignore backend displayTitle for now) */}
          {(() => {
            const parts = [];
            
            // 1. Engine size (for non-electric vehicles)
            if (car.fuelType !== 'Electric' && car.engineSize) {
              const size = parseFloat(car.engineSize);
              if (!isNaN(size) && size > 0) {
                const variantHasEngineInfo = car.variant && /^\d+/.test(car.variant);
                if (!variantHasEngineInfo) {
                  const sizeInLitres = size > 100 ? size / 1000 : size;
                  parts.push(sizeInLitres.toFixed(1));
                }
              }
            }
            
            // 2. Fuel type (show for all vehicles)
            if (car.fuelType && car.fuelType !== 'null' && car.fuelType !== 'undefined') {
              if (car.fuelType === 'Hybrid') {
                const variantLower = (car.variant || '').toLowerCase();
                if (variantLower.includes('diesel') || variantLower.includes('tdi') || variantLower.includes('hdi')) {
                  parts.push('Diesel Hybrid');
                } else {
                  parts.push('Petrol Hybrid');
                }
              } else {
                parts.push(car.fuelType);
              }
            }
            
            // 3. Variant
            if (car.variant && 
                car.variant !== 'null' && 
                car.variant !== 'undefined' && 
                car.variant.trim() !== '') {
              parts.push(car.variant.trim());
            } else if (car.submodel && 
                       car.submodel !== 'null' && 
                       car.submodel !== 'undefined' && 
                       car.submodel.trim() !== '') {
              parts.push(car.submodel);
            }
            
            // 4. Battery capacity for electric vehicles
            if (car.fuelType === 'Electric') {
              const batteryCapacity = car.batteryCapacity || car.runningCosts?.batteryCapacity;
              if (batteryCapacity) {
                parts.push(`${batteryCapacity}kWh`);
              }
            }
            
            // 5. Body type (if not already in variant)
            if (car.bodyType && car.bodyType !== 'null' && car.bodyType !== 'undefined') {
              const bodyTypeInVariant = car.variant && 
                car.variant.toUpperCase().includes(car.bodyType.toUpperCase());
              
              if (!bodyTypeInVariant) {
                parts.push(car.bodyType);
              }
            }
            
            // 6. Transmission
            if (car.transmission && car.transmission !== 'null' && car.transmission !== 'undefined') {
              const trans = car.transmission.toLowerCase();
              if (trans === 'automatic' || trans === 'auto') {
                parts.push('Auto');
              } else if (trans === 'manual') {
                parts.push('Manual');
              } else if (trans.includes('semi')) {
                parts.push('Semi-Auto');
              }
            }
            
            // 7. Doors
            if (car.doors) {
              parts.push(`${car.doors}dr`);
            }
            
            return parts.filter(Boolean).join(' ');
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
  } catch (error) {
    console.error('❌ CarCard caught error:', error, car.registrationNumber);
    setRenderError(error);
    return null;
  }
};

export default CarCard;
