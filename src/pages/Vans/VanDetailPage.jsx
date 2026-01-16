import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleHistorySection from '../../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../../components/Location/LocationDisplay';
import './VanDetailPage.css';

const VanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [van, setVan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchVanDetails();
  }, [id]);

  const fetchVanDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/vans/${id}`);
      
      if (!response.ok) {
        throw new Error('Van not found');
      }
      
      const data = await response.json();
      setVan(data.data);
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
      <div className="van-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading van details...</p>
        </div>
      </div>
    );
  }

  if (error || !van) {
    return (
      <div className="van-detail-page">
        <div className="error-container">
          <h2>Van Not Found</h2>
          <p>{error || 'The van you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/vans/used-vans')} className="back-btn">
            Back to Vans
          </button>
        </div>
      </div>
    );
  }

  const images = van.images && van.images.length > 0 
    ? van.images 
    : ['/images/dummy/placeholder-van.jpg'];

  return (
    <div className="van-detail-page">
      <div className="detail-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-to-results">
          ← Back to results
        </button>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={images[currentImageIndex]} alt={`${van.make} ${van.model}`} />
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
          {/* Left Column - Van Details */}
          <div className="left-column">
            {/* Location */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {van.locationName}{van.distance ? ` • ${van.distance} miles away` : ' • Location available'}
              </span>
            </div>

            {/* Title and Price */}
            <div className="van-header">
              <h1 className="van-title">
                {van.make} {van.model}{van.submodel ? ` ${van.submodel}` : ''}
              </h1>
              <p className="van-subtitle">
                {van.vanType} • {van.fuelType} • {van.transmission}
              </p>
              <div className="price-tag">
                {formatPrice(van.price)}
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
                    <span className="spec-value">{formatMileage(van.mileage)} miles</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">📅</span>
                  <div className="spec-details">
                    <span className="spec-label">Registration</span>
                    <span className="spec-value">{van.year} ({van.registrationNumber || 'N/A'})</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⛽</span>
                  <div className="spec-details">
                    <span className="spec-label">Fuel type</span>
                    <span className="spec-value">{van.fuelType}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🚐</span>
                  <div className="spec-details">
                    <span className="spec-label">Van type</span>
                    <span className="spec-value">{van.vanType || 'Panel Van'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Gearbox</span>
                    <span className="spec-value">{van.transmission}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🎨</span>
                  <div className="spec-details">
                    <span className="spec-label">Body colour</span>
                    <span className="spec-value">{van.color}</span>
                  </div>
                </div>

                {van.payloadCapacity > 0 && (
                  <div className="spec-item">
                    <span className="spec-icon">📦</span>
                    <div className="spec-details">
                      <span className="spec-label">Payload</span>
                      <span className="spec-value">{van.payloadCapacity} kg</span>
                    </div>
                  </div>
                )}

                {van.wheelbase && (
                  <div className="spec-item">
                    <span className="spec-icon">📐</span>
                    <div className="spec-details">
                      <span className="spec-label">Wheelbase</span>
                      <span className="spec-value">{van.wheelbase}</span>
                    </div>
                  </div>
                )}

                {van.roofHeight && (
                  <div className="spec-item">
                    <span className="spec-icon">📏</span>
                    <div className="spec-details">
                      <span className="spec-label">Roof height</span>
                      <span className="spec-value">{van.roofHeight}</span>
                    </div>
                  </div>
                )}

                {van.co2Emissions && (
                  <div className="spec-item">
                    <span className="spec-icon">🌱</span>
                    <div className="spec-details">
                      <span className="spec-label">Emissions</span>
                      <span className="spec-value">{van.co2Emissions}g/km</span>
                    </div>
                  </div>
                )}
              </div>

              <button className="view-all-specs">
                ≡ View all spec and features →
              </button>
            </div>

            {/* Load Space Section */}
            {(van.loadLength > 0 || van.loadWidth > 0 || van.loadHeight > 0) && (
              <div className="load-space-section">
                <h2>Load Space</h2>
                <div className="load-specs">
                  {van.loadLength > 0 && (
                    <div className="load-spec">
                      <span className="load-label">Length</span>
                      <span className="load-value">{van.loadLength} mm</span>
                    </div>
                  )}
                  {van.loadWidth > 0 && (
                    <div className="load-spec">
                      <span className="load-label">Width</span>
                      <span className="load-value">{van.loadWidth} mm</span>
                    </div>
                  )}
                  {van.loadHeight > 0 && (
                    <div className="load-spec">
                      <span className="load-label">Height</span>
                      <span className="load-value">{van.loadHeight} mm</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {van.description && (
              <div className="description-section">
                <h2>Description</h2>
                <p>{van.description}</p>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={van.postcode || van.sellerContact?.postcode}
              sellerLocation={van.locationName}
              distance={van.distance}
            />

            {/* Vehicle History Section - Always show, component handles missing VRM */}
            <VehicleHistorySection 
              vrm={van.registrationNumber || van.vrm}
              historyCheckId={van.historyCheckId}
            />

            {/* MOT History Section - Always show, component handles missing VRM */}
            <MOTHistorySection 
              vrm={van.registrationNumber || van.vrm}
            />

            {/* Meet the Seller Section - After MOT History */}
            <div className="meet-seller-section">
              <h2>Meet the seller</h2>
              
              <div className="seller-details">
                {/* Seller Type Badge */}
                <span className="seller-type-badge">
                  {van.sellerType === 'trade' || van.sellerContact?.type === 'trade' ? 'Trade' : 'Private'}
                </span>
                
                {/* Trade Dealer - Show Logo and Business Info */}
                {(van.sellerType === 'trade' || van.sellerContact?.type === 'trade') && (
                  <div className="trade-seller-details">
                    {van.dealerLogo && (
                      <div className="dealer-logo-display">
                        <img src={van.dealerLogo} alt={van.sellerContact?.businessName || 'Dealer'} />
                      </div>
                    )}
                    {van.sellerContact?.businessName && (
                      <div className="dealer-business-name">{van.sellerContact.businessName}</div>
                    )}
                    <div className="dealer-location">
                      📍 {van.locationName || 'Location available'}
                    </div>
                  </div>
                )}
                
                {/* Private Seller */}
                {(van.sellerType === 'private' || van.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {van.locationName || 'Location available'}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="seller-contact-buttons">
                  <button className="message-seller-btn">
                    ✉️ Message seller
                  </button>

                  {(van.sellerContact?.phoneNumber || van.phoneNumber) && (
                    <button className="call-seller-btn">
                      📞 {van.sellerContact?.phoneNumber || van.phoneNumber}
                    </button>
                  )}
                </div>

                {(van.sellerContact?.phoneNumber || van.phoneNumber) && (
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
                  {van.sellerContact?.type === 'trade' || van.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                {van.sellerContact?.businessName && (
                  <div className="business-name">{van.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {van.locationName}{van.distance ? ` • ${van.distance} miles away` : ''}
                </div>
              </div>

              <button className="message-btn">
                ✉️ Message
              </button>

              {(van.sellerContact?.phoneNumber || van.phoneNumber) && (
                <button className="phone-btn">
                  📞 {van.sellerContact?.phoneNumber || van.phoneNumber}
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

export default VanDetailPage;
