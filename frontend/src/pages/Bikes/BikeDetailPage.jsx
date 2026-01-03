import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
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
                {bike.locationName && `${bike.locationName}, `}{bike.postcode || 'Location available'}
              </span>
            </div>

            {/* Title and Price */}
            <div className="bike-header">
              <h1 className="bike-title">
                {bike.make} {bike.model}
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

            {/* Location Section */}
            <div className="location-section">
              <h2>Location</h2>
              <div className="location-card">
                <span className="location-icon">📍</span>
                <div className="location-details">
                  <span className="location-name">{bike.locationName || 'Location'}</span>
                  <span className="location-postcode">{bike.postcode}</span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="safety-section">
              <h2>🛡️ Safety Tips</h2>
              <ul className="safety-list">
                <li>Always inspect the bike in person before purchasing</li>
                <li>Check all documentation and service history</li>
                <li>Verify the bike's identity and ownership</li>
                <li>Consider getting a professional inspection</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Seller */}
          <div className="right-column">
            <div className="contact-card">
              <h3>Contact seller</h3>
              
              <div className="seller-info">
                <span className="seller-type">
                  {bike.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                <div className="seller-location">
                  {bike.locationName && `${bike.locationName}, `}{bike.postcode || 'Location available'}
                </div>
              </div>

              <button className="message-btn">
                ✉️ Message
              </button>

              <button className="phone-btn">
                📞 Call Seller
              </button>

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
