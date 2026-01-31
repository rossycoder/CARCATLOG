import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { vehicleSchema, breadcrumbSchema } from '../utils/seoSchemas';
import VehicleHistorySection from '../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../components/Location/LocationDisplay';
import { generateVariantDisplay, extractTownName } from '../utils/vehicleFormatter';
import './CarDetailPage.css';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Function to handle back navigation intelligently
  const handleBackClick = () => {
    // Check if we have a 'from' state passed from the previous page
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      // Try to go back in history
      navigate(-1);
    } else {
      // Default to search results
      navigate('/search-results');
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Get user's postcode from localStorage (saved from search)
      const userPostcode = localStorage.getItem('userPostcode');
      
      // Build URL with optional postcode parameter
      let url = `${API_BASE_URL}/vehicles/${id}`;
      if (userPostcode) {
        url += `?postcode=${encodeURIComponent(userPostcode)}`;
      }
      
      const response = await fetch(url);
      
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

  // Generate SEO data
  const carTitle = `${car.year} ${car.make} ${car.model}${car.submodel ? ` ${car.submodel}` : ''}`;
  const carDescription = `${carTitle} for sale. ${formatMileage(car.mileage)} miles, ${car.fuelType}, ${car.transmission}. ${car.description ? car.description.substring(0, 100) : 'View full details and contact seller.'}`;
  const carLocation = extractTownName(car.locationName) || 'UK';

  return (
    <>
      <SEOHelmet 
        title={`${carTitle} for Sale in ${carLocation} | ${formatPrice(car.price)} | CarCatlog`}
        description={carDescription}
        keywords={`${car.make} ${car.model}, ${car.year} ${car.make}, ${car.fuelType} car, ${car.transmission} car, used ${car.make}, cars for sale ${carLocation}`}
        url={`/cars/${car._id}`}
        image={images[0]}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            vehicleSchema(car),
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Used Cars', url: '/used-cars' },
              { name: carTitle, url: `/cars/${car._id}` }
            ])
          ]
        }}
      />
      <div className="car-detail-page">
        <div className="detail-container">
          {/* Back Button */}
          <button onClick={handleBackClick} className="back-to-results">
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
            {/* Location - AutoTrader Style */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {(car.sellerContact?.businessName || car.dealerName) && (
                  <span className="dealer-name">{car.sellerContact?.businessName || car.dealerName} </span>
                )}
                {extractTownName(car.locationName) || 'Location available'}
                {car.distance && car.distance > 0 && (
                  <> • <span className="distance-info">{Math.round(car.distance)} miles away</span></>
                )}
              </span>
            </div>

            {/* Title and Price - AutoTrader Format */}
            <div className="car-header">
              <h1 className="car-make-model">
                {car.make} {car.model}
              </h1>
              <h2 className="car-variant-line">
                {car.displayTitle || generateVariantDisplay(car)}
              </h2>
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
                    <span className="spec-value">{car.bodyType ? car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1).toLowerCase() : 'Hatchback'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🔧</span>
                  <div className="spec-details">
                    <span className="spec-label">Engine size</span>
                    <span className="spec-value">
                      {car.engineSize 
                        ? (car.engineSize.toString().includes('L') 
                            ? car.engineSize 
                            : `${car.engineSize}L`)
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Gearbox</span>
                    <span className="spec-value">
                      {car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1).toLowerCase() : 'Manual'}
                      {car.gearbox && ` (${car.gearbox} speed)`}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 10v11h18V7H7L3 10z"></path>
                      <path d="M7 7v13"></path>
                      <circle cx="16" cy="15" r="1"></circle>
                    </svg>
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">{car.doors || 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/images/brands/car-seat-svgrepo-com.svg" alt="Seats" style={{ width: '24px', height: '24px' }} />
                  </span>
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

                {car.emissionClass && (
                  <div className="spec-item">
                    <span className="spec-icon">🏷️</span>
                    <div className="spec-details">
                      <span className="spec-label">Emission class</span>
                      <span className="spec-value">{car.emissionClass}</span>
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
                ≡ Display all specs and features →
              </button>
            </div>

            {/* Description */}
            {car.description && (
              <div className="description-section">
                <h2>Description</h2>
                <p>{car.description}</p>
              </div>
            )}

            {/* YouTube Video Section */}
            {car.videoUrl && (
              <div className="video-section">
                <h2>Video</h2>
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={car.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Vehicle Video"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Running Costs Section */}
            {car.runningCosts && (car.runningCosts.fuelEconomy?.combined || car.runningCosts.co2Emissions || car.runningCosts.insuranceGroup || car.runningCosts.annualTax) && (
              <div className="running-costs-section">
                <h2>Running Costs</h2>
                <div className="running-costs-grid">
                  {car.runningCosts.fuelEconomy?.combined && (
                    <div className="cost-item">
                      <span className="cost-icon">⛽</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Combined)</span>
                        <span className="cost-value">{car.runningCosts.fuelEconomy.combined} mpg</span>
                      </div>
                    </div>
                  )}

                  {car.runningCosts.fuelEconomy?.urban && (
                    <div className="cost-item">
                      <span className="cost-icon">🏙️</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Urban)</span>
                        <span className="cost-value">{car.runningCosts.fuelEconomy.urban} mpg</span>
                      </div>
                    </div>
                  )}

                  {car.runningCosts.fuelEconomy?.extraUrban && (
                    <div className="cost-item">
                      <span className="cost-icon">🛣️</span>
                      <div className="cost-details">
                        <span className="cost-label">Fuel Economy (Extra Urban)</span>
                        <span className="cost-value">{car.runningCosts.fuelEconomy.extraUrban} mpg</span>
                      </div>
                    </div>
                  )}

                  {car.runningCosts.co2Emissions && (
                    <div className="cost-item">
                      <span className="cost-icon">🌱</span>
                      <div className="cost-details">
                        <span className="cost-label">CO2 Emissions</span>
                        <span className="cost-value">{car.runningCosts.co2Emissions}g/km</span>
                      </div>
                    </div>
                  )}

                  {car.runningCosts.insuranceGroup && (
                    <div className="cost-item">
                      <span className="cost-icon">🛡️</span>
                      <div className="cost-details">
                        <span className="cost-label">Insurance Group</span>
                        <span className="cost-value">{car.runningCosts.insuranceGroup}</span>
                      </div>
                    </div>
                  )}

                  {car.runningCosts.annualTax && (
                    <div className="cost-item">
                      <span className="cost-icon">💷</span>
                      <div className="cost-details">
                        <span className="cost-label">Annual Tax</span>
                        <span className="cost-value">{formatPrice(car.runningCosts.annualTax)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Features Section */}
            {showAllFeatures && car.features && car.features.length > 0 && (
              <div className="features-section">
                <h2>Vehicle Features</h2>
                <div className="features-grid">
                  {car.features.map((feature, index) => (
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
              sellerPostcode={car.postcode || car.sellerContact?.postcode}
              sellerLocation={extractTownName(car.locationName)}
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

            {/* Meet the Seller Section */}
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
                    {car.sellerContact?.businessAddress && (
                      <div className="dealer-business-address">
                        {car.sellerContact.businessAddress.street && (
                          <div>{car.sellerContact.businessAddress.street}</div>
                        )}
                        {car.sellerContact.businessAddress.city && (
                          <div>{car.sellerContact.businessAddress.city}</div>
                        )}
                        {car.sellerContact.businessAddress.postcode && (
                          <div>{car.sellerContact.businessAddress.postcode}</div>
                        )}
                        {car.sellerContact.businessAddress.country && (
                          <div>{car.sellerContact.businessAddress.country}</div>
                        )}
                      </div>
                    )}
                    {!car.sellerContact?.businessAddress && (
                      <div className="dealer-location">
                        📍 {extractTownName(car.locationName) || 'Location available'}
                        {car.distance && car.distance > 0 && (
                          <> • <span className="distance-highlight">{Math.round(car.distance)} miles away</span></>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Private Seller */}
                {(car.sellerType === 'private' || car.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {extractTownName(car.locationName) || 'Location available'}
                      {car.distance && car.distance > 0 && (
                        <> • <span className="distance-highlight">{Math.round(car.distance)} miles away</span></>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="seller-contact-buttons">
                  {(car.sellerContact?.phoneNumber || car.phoneNumber) && (
                    <button className="call-seller-btn">
                      📞 {car.sellerContact?.phoneNumber || car.phoneNumber}
                    </button>
                  )}
                </div>
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
                  {extractTownName(car.locationName)}
                  {car.distance && car.distance > 0 && (
                    <span className="distance-highlight"> • {Math.round(car.distance)} miles away</span>
                  )}
                </div>
              </div>

              {(car.sellerContact?.phoneNumber || car.phoneNumber) && (
                <button className="phone-btn">
                  📞 {car.sellerContact?.phoneNumber || car.phoneNumber}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default CarDetailPage;
