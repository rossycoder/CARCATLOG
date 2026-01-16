import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import VehicleHistorySection from '../../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../../components/Location/LocationDisplay';
import './BikeDetailPage.css';

const BikeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bike, setBike] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchBikeDetails();
    checkIfSaved();
  }, [id]);

  const fetchBikeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await bikeService.getBikeById(id);
      
      if (response.success) {
        setBike(response.data);
        document.title = `${response.data.make} ${response.data.model} | CarCatALog`;
      } else {
        setError('Bike not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load bike details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = () => {
    const saved = JSON.parse(localStorage.getItem('savedBikes') || '[]');
    setIsSaved(saved.includes(id));
  };

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem('savedBikes') || '[]');
    if (isSaved) {
      const updated = saved.filter(bikeId => bikeId !== id);
      localStorage.setItem('savedBikes', JSON.stringify(updated));
    } else {
      saved.push(id);
      localStorage.setItem('savedBikes', JSON.stringify(saved));
    }
    setIsSaved(!isSaved);
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
      <div className="bike-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="bike-detail-page">
        <div className="error-container">
          <h2>🏍️ Bike Not Found</h2>
          <p>{error || 'The bike you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/bikes')} className="back-btn">
            Back to Bikes
          </button>
        </div>
      </div>
    );
  }

  const images = bike.images && bike.images.length > 0 
    ? bike.images 
    : ['/images/dummy/placeholder-bike.jpg'];

  return (
    <div className="bike-detail-page">
      <div className="detail-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-to-results">
          ← Back to results
        </button>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={images[currentImageIndex]} alt={`${bike.make} ${bike.model}`} />
            <button className="gallery-btn">
              📷 Gallery
            </button>
            <span className="image-counter">
              🖼️ {images.length}
            </span>
            <button 
              className={`save-floating-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
            >
              {isSaved ? '♥' : '♡'}
            </button>
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
          {/* Left Column - Bike Details */}
          <div className="left-column">
            {/* Location */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {bike.locationName || 'Location available'}
              </span>
            </div>

            {/* Title and Price */}
            <div className="bike-header">
              <h1 className="bike-title">
                {bike.make} {bike.model}{bike.submodel ? ` ${bike.submodel}` : ''}
              </h1>
              <p className="bike-subtitle">
                {bike.year} • {bike.engineCC ? `${bike.engineCC}cc` : ''} {bike.bikeType || 'Motorcycle'}
              </p>
              <div className="price-tag">
                {formatPrice(bike.price)}
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
                    <span className="spec-value">{formatMileage(bike.mileage)} miles</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">📅</span>
                  <div className="spec-details">
                    <span className="spec-label">Year</span>
                    <span className="spec-value">{bike.year}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⛽</span>
                  <div className="spec-details">
                    <span className="spec-label">Fuel type</span>
                    <span className="spec-value">{bike.fuelType || 'Petrol'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🏍️</span>
                  <div className="spec-details">
                    <span className="spec-label">Bike type</span>
                    <span className="spec-value">{bike.bikeType || 'Motorcycle'}</span>
                  </div>
                </div>

                {bike.engineCC && (
                  <div className="spec-item">
                    <span className="spec-icon">🔧</span>
                    <div className="spec-details">
                      <span className="spec-label">Engine</span>
                      <span className="spec-value">{bike.engineCC}cc</span>
                    </div>
                  </div>
                )}

                <div className="spec-item">
                  <span className="spec-icon">🎨</span>
                  <div className="spec-details">
                    <span className="spec-label">Colour</span>
                    <span className="spec-value">{bike.color || 'N/A'}</span>
                  </div>
                </div>

                {bike.transmission && (
                  <div className="spec-item">
                    <span className="spec-icon">⚙️</span>
                    <div className="spec-details">
                      <span className="spec-label">Gearbox</span>
                      <span className="spec-value">{bike.transmission}</span>
                    </div>
                  </div>
                )}

                {bike.condition && (
                  <div className="spec-item">
                    <span className="spec-icon">✨</span>
                    <div className="spec-details">
                      <span className="spec-label">Condition</span>
                      <span className="spec-value">{bike.condition}</span>
                    </div>
                  </div>
                )}
              </div>

              <button className="view-all-specs">
                ≡ View all spec and features →
              </button>
            </div>

            {/* Description */}
            {bike.description && (
              <div className="description-section">
                <h2>Description</h2>
                <p>{bike.description}</p>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={bike.postcode || bike.sellerContact?.postcode}
              sellerLocation={bike.locationName}
              distance={bike.distance}
            />

            {/* Vehicle History Section - Always show, component handles missing VRM */}
            <VehicleHistorySection 
              vrm={bike.registrationNumber || bike.vrm}
              historyCheckId={bike.historyCheckId}
            />

            {/* MOT History Section - Always show, component handles missing VRM */}
            <MOTHistorySection 
              vrm={bike.registrationNumber || bike.vrm}
            />

            {/* Meet the Seller Section - After MOT History */}
            <div className="meet-seller-section">
              <h2>Meet the seller</h2>
              
              <div className="seller-details">
                {/* Seller Type Badge */}
                <span className="seller-type-badge">
                  {bike.sellerType === 'trade' || bike.sellerContact?.type === 'trade' ? 'Trade' : 'Private'}
                </span>
                
                {/* Trade Dealer - Show Logo and Business Info */}
                {(bike.sellerType === 'trade' || bike.sellerContact?.type === 'trade') && (
                  <div className="trade-seller-details">
                    {bike.dealerLogo && (
                      <div className="dealer-logo-display">
                        <img src={bike.dealerLogo} alt={bike.sellerContact?.businessName || 'Dealer'} />
                      </div>
                    )}
                    {bike.sellerContact?.businessName && (
                      <div className="dealer-business-name">{bike.sellerContact.businessName}</div>
                    )}
                    <div className="dealer-location">
                      📍 {bike.locationName || 'Location available'}
                    </div>
                  </div>
                )}
                
                {/* Private Seller */}
                {(bike.sellerType === 'private' || bike.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {bike.locationName || 'Location available'}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="seller-contact-buttons">
                  <button className="message-seller-btn">
                    ✉️ Message seller
                  </button>

                  {(bike.sellerContact?.phoneNumber || bike.phoneNumber) && (
                    <button className="call-seller-btn">
                      📞 {bike.sellerContact?.phoneNumber || bike.phoneNumber}
                    </button>
                  )}
                </div>

                {(bike.sellerContact?.phoneNumber || bike.phoneNumber) && (
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
                  {bike.sellerContact?.type === 'trade' || bike.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                {bike.sellerContact?.businessName && (
                  <div className="business-name">{bike.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {bike.locationName}{bike.distance ? ` • ${bike.distance} miles away` : ''}
                </div>
              </div>

              <button className="message-btn">
                ✉️ Message
              </button>

              {(bike.sellerContact?.phoneNumber || bike.phoneNumber) && (
                <button className="phone-btn">
                  📞 {bike.sellerContact?.phoneNumber || bike.phoneNumber}
                </button>
              )}

              <div className="seller-notice">
                Seller's number has been protected. <a href="#">Learn more</a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className={`action-btn save ${isSaved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                {isSaved ? '♥ Saved' : '♡ Save this bike'}
              </button>
              <button className="action-btn share">
                🔗 Share
              </button>
              <button className="action-btn print">
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetailPage;
