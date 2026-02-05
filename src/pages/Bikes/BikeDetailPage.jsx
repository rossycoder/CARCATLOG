import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import { vehicleSchema, breadcrumbSchema } from '../../utils/seoSchemas';
import VehicleHistorySection from '../../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../../components/Location/LocationDisplay';
import { extractTownName } from '../../utils/vehicleFormatter';
import './BikeDetailPage.css';

const BikeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bike, setBike] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  // Handle image error
  const handleImageError = (e) => {
    console.error('Main image failed to load:', getCurrentImage());
    setImageError(true);
    if (e && e.target) {
      e.target.src = '/images/dummy/placeholder-bike.jpg';
    }
  };

  // Get current image with fallback
  const getCurrentImage = () => {
    if (imageError || !images[currentImageIndex]) {
      return '/images/dummy/placeholder-bike.jpg';
    }
    return images[currentImageIndex];
  };

  // Generate SEO data
  const bikeTitle = `${bike.year} ${bike.make} ${bike.model}${bike.submodel ? ` ${bike.submodel}` : ''}`;
  const bikeDescription = `${bikeTitle} for sale. ${formatMileage(bike.mileage)} miles, ${bike.fuelType}, ${bike.transmission}. ${bike.description ? bike.description.substring(0, 100) : 'View full details and contact seller.'}`;
  const bikeLocation = extractTownName(bike.locationName) || 'UK';

  return (
    <>
      <SEOHelmet 
        title={`${bikeTitle} for Sale in ${bikeLocation} | ${formatPrice(bike.price)} | CarCatlog`}
        description={bikeDescription}
        keywords={`${bike.make} ${bike.model}, ${bike.year} ${bike.make}, ${bike.fuelType} bike, ${bike.transmission} bike, used ${bike.make}, bikes for sale ${bikeLocation}`}
        url={`/bikes/${bike._id}`}
        image={images[0]}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            vehicleSchema(bike),
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Used Bikes', url: '/bikes' },
              { name: bikeTitle, url: `/bikes/${bike._id}` }
            ])
          ]
        }}
      />
      <div className="bike-detail-page">
      <div className="detail-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-to-results">
          ← Back to results
        </button>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img 
              src={getCurrentImage()} 
              alt={`${bike.make} ${bike.model}${bike.submodel ? ` ${bike.submodel}` : ''}`}
              onError={handleImageError}
              onLoad={() => {}} // Image loaded successfully
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#f5f5f5'
              }}
            />
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
                  onError={(e) => {
                    console.error('Thumbnail image failed to load:', img);
                    e.target.src = '/images/dummy/placeholder-bike.jpg';
                  }}
                  style={{
                    width: '100px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: currentImageIndex === index ? '2px solid #0066cc' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                    background: '#f5f5f5'
                  }}
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
            {/* Location - Enhanced with distance */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {(bike.sellerContact?.businessName || bike.dealerName) && (
                  <span className="dealer-name">{bike.sellerContact?.businessName || bike.dealerName} </span>
                )}
                {extractTownName(bike.locationName) || 'Location available'}
                {bike.distance && bike.distance > 0 && (
                  <> • <span className="distance-info">{Math.round(bike.distance)} miles away</span></>
                )}
              </span>
            </div>

            {/* Title and Price - Enhanced with write-off warning */}
            <div className="bike-header">
              {/* Write-off Warning Badge - Show for CAT A, B, S, N, D */}
              {bike.historyCheckId && 
               bike.historyCheckId.writeOffCategory && 
               ['A', 'B', 'S', 'N', 'D'].includes(bike.historyCheckId.writeOffCategory.toUpperCase()) && (
                <div className="write-off-warning-badge">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">
                    CAT {bike.historyCheckId.writeOffCategory.toUpperCase()}
                  </span>
                </div>
              )}
              
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

                {/* MOT Due Information */}
                <div className="spec-item">
                  <span className="spec-icon">🔍</span>
                  <div className="spec-details">
                    <span className="spec-label">MOT Due</span>
                    <span className="spec-value">
                      {bike.motDue || bike.motExpiry ? (
                        new Date(bike.motDue || bike.motExpiry).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        'Contact seller for MOT details'
                      )}
                    </span>
                  </div>
                </div>

                {bike.emissionClass && (
                  <div className="spec-item">
                    <span className="spec-icon">🏷️</span>
                    <div className="spec-details">
                      <span className="spec-label">Emission class</span>
                      <span className="spec-value">{bike.emissionClass}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="view-all-specs"
                onClick={() => {
                  setShowAllFeatures(true);
                  // Scroll to features section
                  setTimeout(() => {
                    const featuresSection = document.querySelector('.features-section');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              >
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

            {/* Running Costs Section */}
            {bike.runningCosts && (bike.runningCosts.fuelEconomy?.combined || bike.runningCosts.co2Emissions || bike.runningCosts.insuranceGroup || bike.runningCosts.annualTax) && (
              <div className="running-costs-section">
                <h2>Running Costs</h2>
                <div className="running-costs-grid">
                  {bike.runningCosts.fuelEconomy?.combined && (
                    <div className="cost-item">
                      <span className="cost-icon">⛽</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Combined)</span>
                        <span className="cost-value">{bike.runningCosts.fuelEconomy.combined} mpg</span>
                      </div>
                    </div>
                  )}

                  {bike.runningCosts.fuelEconomy?.urban && (
                    <div className="cost-item">
                      <span className="cost-icon">🏙️</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Urban)</span>
                        <span className="cost-value">{bike.runningCosts.fuelEconomy.urban} mpg</span>
                      </div>
                    </div>
                  )}

                  {bike.runningCosts.fuelEconomy?.extraUrban && (
                    <div className="cost-item">
                      <span className="cost-icon">🛣️</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Extra Urban)</span>
                        <span className="cost-value">{bike.runningCosts.fuelEconomy.extraUrban} mpg</span>
                      </div>
                    </div>
                  )}

                  {bike.runningCosts.co2Emissions && (
                    <div className="cost-item">
                      <span className="cost-icon">🌱</span>
                      <div className="cost-details">
                        <span className="cost-label">CO2 Emissions</span>
                        <span className="cost-value">{bike.runningCosts.co2Emissions}g/km</span>
                      </div>
                    </div>
                  )}

                  {bike.runningCosts.insuranceGroup && (
                    <div className="cost-item">
                      <span className="cost-icon">🛡️</span>
                      <div className="cost-details">
                        <span className="cost-label">Insurance Group</span>
                        <span className="cost-value">{bike.runningCosts.insuranceGroup}</span>
                      </div>
                    </div>
                  )}

                  {bike.runningCosts.annualTax && (
                    <div className="cost-item">
                      <span className="cost-icon">💷</span>
                      <div className="cost-details">
                        <span className="cost-label">Annual Tax</span>
                        <span className="cost-value">{formatPrice(bike.runningCosts.annualTax)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Features Section */}
            {showAllFeatures && bike.features && bike.features.length > 0 && (
              <div className="features-section">
                <h2>Bike Features</h2>
                <div className="features-grid">
                  {bike.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={bike.postcode || bike.sellerContact?.postcode}
              sellerLocation={extractTownName(bike.locationName)}
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
                      📍 {extractTownName(bike.locationName) || 'Location available'}
                    </div>
                  </div>
                )}
                
                {/* Private Seller */}
                {(bike.sellerType === 'private' || bike.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {extractTownName(bike.locationName) || 'Location available'}
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
                  {extractTownName(bike.locationName)}{bike.distance ? ` • ${bike.distance} miles away` : ''}
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
    </>
  );
};

export default BikeDetailPage;
