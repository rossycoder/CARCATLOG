import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleHistorySection from '../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../components/Location/LocationDisplay';
import './CarDetailPage.css';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
      
      if (!response.ok) {
        throw new Error('Car not found');
      }
      
      const data = await response.json();
      setCar(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-GB').format(mileage);
  };

  if (isLoading) {
    return (
      <div className="car-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-detail-page">
        <div className="error-container">
          <h2>Car Not Found</h2>
          <p>{error || 'The car you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/search-results')} className="back-btn">
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 
    ? car.images 
    : ['/images/dummy/placeholder-car.jpg'];

  return (
    <div className="car-detail-page">
      <div className="detail-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-to-results">
          ← Back to results
        </button>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={images[currentImageIndex]} alt={`${car.make} ${car.model}${car.submodel ? ` ${car.submodel}` : ''}`} />
            <button className="gallery-btn" onClick={() => {}}>
              📷 Gallery
            </button>
            <span className="image-counter">
              🖼️ {images.length}
            </span>
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`View ${index + 1}`}
                  className={currentImageIndex === index ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
              {images.length > 4 && (
                <button className="more-images">
                  +{images.length - 4} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column - Car Details */}
          <div className="left-column">
            {/* Location */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {car.locationName || 'Location available'}
              </span>
            </div>

            {/* Title and Price */}
            <div className="car-header">
              <h1 className="car-title">
                {car.make} {car.model}{car.submodel ? ` ${car.submodel}` : ''}
              </h1>
              <p className="car-subtitle">
                {car.engineSize ? `${car.engineSize}L ` : ''}{car.fuelType} {car.transmission}
              </p>
              <div className="price-tag">
                {formatPrice(car.price)}
              </div>
            </div>

            {/* Overview Section */}
            <div className="overview-section">
              <h2>Overview</h2>
              
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-icon">📏</span>
                  <div className="spec-details">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">{formatMileage(car.mileage)} miles</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">📅</span>
                  <div className="spec-details">
                    <span className="spec-label">Registration</span>
                    <span className="spec-value">{car.year} ({car.registrationNumber || 'N/A'})</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Fuel type</span>
                    <span className="spec-value">{car.fuelType}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🚗</span>
                  <div className="spec-details">
                    <span className="spec-label">Body type</span>
                    <span className="spec-value">{car.bodyType || 'Hatchback'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🔧</span>
                  <div className="spec-details">
                    <span className="spec-label">Engine</span>
                    <span className="spec-value">{car.engineSize ? `${car.engineSize}L` : 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Gearbox</span>
                    <span className="spec-value">
                      {car.transmission}
                      {car.gearbox && ` (${car.gearbox} speed)`}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🚪</span>
                  <div className="spec-details">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">{car.doors || 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">💺</span>
                  <div className="spec-details">
                    <span className="spec-label">Seats</span>
                    <span className="spec-value">{car.seats || 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🎨</span>
                  <div className="spec-details">
                    <span className="spec-label">Body colour</span>
                    <span className="spec-value">{car.color}</span>
                  </div>
                </div>

                {car.co2Emissions && (
                  <div className="spec-item">
                    <span className="spec-icon">🌱</span>
                    <div className="spec-details">
                      <span className="spec-label">CO2 Emissions</span>
                      <span className="spec-value">{car.co2Emissions}g/km</span>
                    </div>
                  </div>
                )}

                {car.emissionClass && (
                  <div className="spec-item">
                    <span className="spec-icon">🏷️</span>
                    <div className="spec-details">
                      <span className="spec-label">Emission Class</span>
                      <span className="spec-value">{car.emissionClass}</span>
                    </div>
                  </div>
                )}
              </div>

              <button className="view-all-specs">
                ≡ View all spec and features →
              </button>
            </div>

            {/* Description */}
            {car.description && (
              <div className="description-section">
                <h2>Description</h2>
                <p>{car.description}</p>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={car.postcode || car.sellerContact?.postcode}
              sellerLocation={car.locationName}
              distance={car.distance}
            />

            {/* Vehicle History Section - Always show, component handles missing VRM */}
            <VehicleHistorySection 
              vrm={car.registrationNumber || car.vrm}
              historyCheckId={car.historyCheckId}
            />

            {/* MOT History Section - Always show, component handles missing VRM */}
            <MOTHistorySection 
              vrm={car.registrationNumber || car.vrm}
            />

            {/* Meet the Seller Section - After MOT History */}
            <div className="meet-seller-section">
              <h2>Meet the seller</h2>
              
              <div className="seller-details">
                {/* Seller Type Badge */}
                <span className="seller-type-badge">
                  {car.sellerType === 'trade' || car.sellerContact?.type === 'trade' ? 'Trade' : 'Private'}
                </span>
                
                {/* Trade Dealer - Show Logo and Business Info */}
                {(car.sellerType === 'trade' || car.sellerContact?.type === 'trade') && (
                  <div className="trade-seller-details">
                    {car.dealerLogo && (
                      <div className="dealer-logo-display">
                        <img src={car.dealerLogo} alt={car.sellerContact?.businessName || 'Dealer'} />
                      </div>
                    )}
                    {car.sellerContact?.businessName && (
                      <div className="dealer-business-name">{car.sellerContact.businessName}</div>
                    )}
                    <div className="dealer-location">
                      📍 {car.locationName || 'Location available'}
                    </div>
                  </div>
                )}
                
                {/* Private Seller */}
                {(car.sellerType === 'private' || car.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {car.locationName || 'Location available'}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="seller-contact-buttons">
                  <button className="message-seller-btn">
                    ✉️ Message seller
                  </button>

                  {(car.sellerContact?.phoneNumber || car.phoneNumber) && (
                    <button className="call-seller-btn">
                      📞 {car.sellerContact?.phoneNumber || car.phoneNumber}
                    </button>
                  )}
                </div>

                {(car.sellerContact?.phoneNumber || car.phoneNumber) && (
                  <div className="seller-protection-notice">
                    Seller's number has been protected. <a href="#">Learn more</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Seller */}
          <div className="right-column">
            <div className="contact-card">
              <h3>Contact seller</h3>
              
              <div className="seller-info">
                <span className="seller-type">
                  {car.sellerContact?.type === 'trade' || car.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                {car.sellerContact?.businessName && (
                  <div className="business-name">{car.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {car.locationName}{car.distance ? ` • ${car.distance} miles away` : ''}
                </div>
              </div>

              <button className="message-btn">
                ✉️ Message
              </button>

              {(car.sellerContact?.phoneNumber || car.phoneNumber) && (
                <button className="phone-btn">
                  📞 {car.sellerContact?.phoneNumber || car.phoneNumber}
                </button>
              )}

              <div className="seller-notice">
                Seller's number has been protected. <a href="#">Learn more</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
