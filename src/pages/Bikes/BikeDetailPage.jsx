import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import { vehicleSchema, breadcrumbSchema } from '../../utils/seoSchemas';
import VehicleHistorySection from '../../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../../components/Location/LocationDisplay';
import ElectricVehicleCharging from '../../components/ElectricVehicleCharging';
import ElectricVehicleRunningCosts from '../../components/ElectricVehicleRunningCosts';
import FinanceCalculator from '../../components/FinanceCalculator';
import { generateVariantDisplay, extractTownName, formatColor } from '../../utils/vehicleFormatter';
import '../CarDetailPage.css'; // Reuse car detail page styles

const BikeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bike, setBike] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to check if bike is electric or hybrid
  const isElectricOrHybrid = (fuelType) => {
    if (!fuelType) return false;
    return fuelType === 'Electric' || 
           fuelType === 'Hybrid' ||
           fuelType === 'Plug-in Hybrid' ||
           fuelType.toLowerCase().includes('hybrid') ||
           fuelType.toLowerCase().includes('electric');
  };

  // Function to handle back navigation intelligently
  const handleBackClick = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/bikes/search-results');
    }
  };

  useEffect(() => {
    fetchBikeDetails();
  }, [id]);

  const fetchBikeDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const userPostcode = localStorage.getItem('userPostcode');
      
      let url = `${API_BASE_URL}/bikes/${id}`;
      if (userPostcode) {
        url += `?postcode=${encodeURIComponent(userPostcode)}`;
      }
      
      console.log('Fetching bike details from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Bike not found');
      }
      
      const data = await response.json();
      console.log('✅ Bike data loaded successfully');
      console.log('🖼️ Images:', data.data.images?.length || 0, 'found');
      console.log('⛽ Fuel Type:', data.data.fuelType);
      console.log('👤 Seller Contact:', JSON.stringify(data.data.sellerContact, null, 2));
      setBike(data.data);
    } catch (err) {
      console.error('Error fetching bike details:', err);
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

  // Generate comprehensive title for bikes
  const generateComprehensiveBikeTitle = (bike) => {
    const parts = [];
    
    // For electric bikes: Add battery capacity
    if (isElectricOrHybrid(bike.fuelType) && bike.batteryCapacity) {
      parts.push(`${bike.batteryCapacity}kWh`);
    }
    
    // For petrol bikes: Add engine CC
    if (!isElectricOrHybrid(bike.fuelType) && bike.engineCC) {
      parts.push(`${bike.engineCC}cc`);
    }
    
    // Add variant if available
    if (bike.variant && bike.variant !== 'null' && bike.variant !== 'undefined' && bike.variant.trim() !== '') {
      parts.push(bike.variant.trim());
    }
    
    // Add bike type
    if (bike.bikeType) {
      parts.push(bike.bikeType);
    }
    
    // Add transmission
    if (bike.transmission) {
      const trans = bike.transmission.toLowerCase();
      if (trans === 'automatic' || trans === 'auto') {
        parts.push('Auto');
      } else if (trans === 'manual') {
        parts.push('Manual');
      } else {
        parts.push(bike.transmission);
      }
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  };

  if (isLoading) {
    return (
      <div className="car-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="car-detail-page">
        <div className="error-container">
          <h2>Bike Not Found</h2>
          <p>{error || 'The bike you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/bikes/search-results')} className="back-btn">
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const images = bike.images && bike.images.length > 0 
    ? bike.images 
    : ['/images/dummy/red-car.png'];

  // Handle image error
  const handleImageError = (e) => {
    console.error('Main image failed to load:', getCurrentImage());
    setImageError(true);
    if (e && e.target) {
      e.target.src = '/images/dummy/red-car.png';
    }
  };

  // Get current image with fallback
  const getCurrentImage = () => {
    if (imageError || !images[currentImageIndex]) {
      return '/images/dummy/red-car.png';
    }
    return images[currentImageIndex];
  };

  // Generate SEO data
  const bikeTitle = `${bike.year} ${bike.make} ${bike.model}${bike.submodel ? ` ${bike.submodel}` : ''}`;
  const bikeDescription = `${bikeTitle} for sale. ${formatMileage(bike.mileage)} miles, ${bike.engineCC}cc, ${bike.transmission}. ${bike.description ? bike.description.substring(0, 100) : 'View full details and contact seller.'}`;
  const bikeLocation = extractTownName(bike.locationName) || 'UK';

  return (
    <>
      <SEOHelmet 
        title={`${bikeTitle} for Sale in ${bikeLocation} | ${formatPrice(bike.price)} | CarCatlog`}
        description={bikeDescription}
        keywords={`${bike.make} ${bike.model}, ${bike.year} ${bike.make}, ${bike.engineCC}cc bike, ${bike.transmission} bike, used ${bike.make}, bikes for sale ${bikeLocation}`}
        url={`/bikes/${bike._id}`}
        image={images[0]}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            vehicleSchema(bike),
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Bikes', url: '/bikes' },
              { name: bikeTitle, url: `/bikes/${bike._id}` }
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
            <img 
              src={getCurrentImage()} 
              alt={`${bike.make} ${bike.model}${bike.submodel ? ` ${bike.submodel}` : ''}`}
              onError={handleImageError}
              onLoad={() => {}}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#f5f5f5'
              }}
            />
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
                  onError={(e) => {
                    console.error('Thumbnail image failed to load:', img);
                    e.target.src = '/images/dummy/red-car.png';
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
            {/* Location - AutoTrader Style */}
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

            {/* Title and Price - AutoTrader Format */}
            <div className="car-header">
              {/* Write-off Warning Badge */}
              {bike.historyCheckId && 
               bike.historyCheckId.writeOffCategory && 
               (() => {
                 const category = bike.historyCheckId.writeOffCategory.toUpperCase();
                 const isKnownCategory = ['A', 'B', 'C', 'S', 'N', 'D'].includes(category);
                 const isUnknownCategory = category === 'UNKNOWN' || category === 'NOT KNOWN';
                 
                 if (isKnownCategory || isUnknownCategory) {
                   return (
                     <div className="write-off-warning-badge">
                       <span className="warning-icon">⚠️</span>
                       <span className="warning-text">
                         {isUnknownCategory ? 'CAT UNKNOWN' : `CAT ${category}`}
                       </span>
                     </div>
                   );
                 }
                 return null;
               })()
              }
              
              <h1 className="car-make-model">
                {bike.make} {bike.model}
              </h1>
              <h2 className="car-variant-line">
                {generateComprehensiveBikeTitle(bike) || bike.displayTitle || generateVariantDisplay(bike)}
              </h2>
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
                    <span className="spec-label">Registration</span>
                    <span className="spec-value">{bike.year} ({bike.registrationNumber || 'N/A'})</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Fuel type</span>
                    <span className="spec-value">{bike.fuelType || 'Petrol'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🏍️</span>
                  <div className="spec-details">
                    <span className="spec-label">Bike type</span>
                    <span className="spec-value">{bike.bikeType || 'Sport'}</span>
                  </div>
                </div>

                {/* Engine CC for petrol bikes, Range for electric bikes */}
                <div className="spec-item">
                  <span className="spec-icon">{isElectricOrHybrid(bike.fuelType) ? '🔋' : '🔧'}</span>
                  <div className="spec-details">
                    <span className="spec-label">
                      {isElectricOrHybrid(bike.fuelType) ? 'Electric Range' : 'Engine'}
                    </span>
                    <span className="spec-value">
                      {isElectricOrHybrid(bike.fuelType) 
                        ? (bike.electricRange || bike.runningCosts?.electricRange 
                            ? `${bike.electricRange || bike.runningCosts?.electricRange} miles` 
                            : 'N/A')
                        : (bike.engineCC ? `${bike.engineCC}cc` : 'N/A')
                      }
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <div className="spec-details">
                    <span className="spec-label">Gearbox</span>
                    <span className="spec-value">
                      {bike.transmission ? bike.transmission.charAt(0).toUpperCase() + bike.transmission.slice(1).toLowerCase() : 'Manual'}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">🎨</span>
                  <div className="spec-details">
                    <span className="spec-label">Body colour</span>
                    <span className="spec-value">
                      {formatColor(bike.color)}
                    </span>
                  </div>
                </div>

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
                      ) : bike.motHistory && bike.motHistory.length > 0 && bike.motHistory[0].expiryDate ? (
                        new Date(bike.motHistory[0].expiryDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (() => {
                        const currentYear = new Date().getFullYear();
                        const vehicleAge = currentYear - bike.year;
                        
                        if (vehicleAge < 3) {
                          return 'Not required (new vehicle)';
                        }
                        return 'Contact seller for MOT details';
                      })()}
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
            {bike.description && (
              <div className="description-section">
                <h2>Description</h2>
                <p>{bike.description}</p>
              </div>
            )}

            {/* YouTube Video Section */}
            {bike.videoUrl && (
              <div className="video-section">
                <h2>Video</h2>
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={bike.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Bike Video"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Running Costs Section - For ALL bikes */}
            {bike.runningCosts && (
              <div className="running-costs-section-new">
                <h2>Running costs</h2>
                <div className="running-costs-horizontal">
                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <svg className="cost-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">CO₂ emissions</div>
                      <div className="cost-value">
                        {isElectricOrHybrid(bike.fuelType) && bike.fuelType === 'Electric' ? '0g/km' : (bike.runningCosts?.co2Emissions ? `${bike.runningCosts.co2Emissions}g/km` : 'N/A')}
                      </div>
                    </div>
                  </div>

                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <svg className="cost-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">Insurance group</div>
                      <div className="cost-value">{(bike.runningCosts?.insuranceGroup || bike.insuranceGroup) || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <svg className="cost-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M16 8l-4 4-4-4"/>
                      </svg>
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">Tax per year</div>
                      <div className="cost-value">
                        {(bike.runningCosts?.annualTax || bike.annualTax) ? formatPrice(bike.runningCosts?.annualTax || bike.annualTax) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {!isElectricOrHybrid(bike.fuelType) && bike.runningCosts?.fuelEconomy && (bike.runningCosts.fuelEconomy.combined || bike.runningCosts.fuelEconomy.urban || bike.runningCosts.fuelEconomy.extraUrban) && (
                  <div className="additional-running-costs">
                    <div className="fuel-economy-grid">
                      {bike.runningCosts.fuelEconomy.combined && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">⛽</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Combined MPG</span>
                            <span className="fuel-value">{bike.runningCosts.fuelEconomy.combined} mpg</span>
                          </div>
                        </div>
                      )}

                      {bike.runningCosts.fuelEconomy.urban && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">🏙️</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Urban MPG</span>
                            <span className="fuel-value">{bike.runningCosts.fuelEconomy.urban} mpg</span>
                          </div>
                        </div>
                      )}

                      {bike.runningCosts.fuelEconomy.extraUrban && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">🛣️</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Extra Urban MPG</span>
                            <span className="fuel-value">{bike.runningCosts.fuelEconomy.extraUrban} mpg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isElectricOrHybrid(bike.fuelType) && (bike.runningCosts?.electricRange || bike.runningCosts?.batteryCapacity || bike.runningCosts?.chargingTime || bike.electricRange || bike.batteryCapacity || bike.chargingTime) && (
                  <div className="additional-running-costs">
                    <div className="fuel-economy-grid">
                      {(bike.runningCosts?.electricRange || bike.electricRange) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">🔋</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Electric Range</span>
                            <span className="fuel-value">{bike.runningCosts?.electricRange || bike.electricRange} miles</span>
                          </div>
                        </div>
                      )}

                      {(bike.runningCosts?.batteryCapacity || bike.batteryCapacity) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">🔋</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Battery Capacity</span>
                            <span className="fuel-value">{bike.runningCosts?.batteryCapacity || bike.batteryCapacity} kWh</span>
                          </div>
                        </div>
                      )}

                      {(bike.runningCosts?.chargingTime || bike.chargingTime) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">⚡</span>
                          <div className="fuel-details">
                            <span className="fuel-label">Charging Time</span>
                            <span className="fuel-value">{bike.runningCosts?.chargingTime || bike.chargingTime} hours</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Electric Bike Charging Information */}
            <ElectricVehicleCharging vehicle={bike} />

            {/* Electric Bike Running Costs */}
            <ElectricVehicleRunningCosts vehicle={bike} />

            {/* Bike Features Section */}
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

            {/* Vehicle History Section */}
            <VehicleHistorySection 
              vrm={bike.registrationNumber || bike.vrm}
              carData={bike}
            />

            {/* MOT History Section */}
            <MOTHistorySection 
              vrm={bike.registrationNumber || bike.vrm}
              carData={bike}
            />

            {/* Meet the Seller Section */}
            <div className="meet-seller-section">
              <h2>Meet the seller</h2>
              
              <div className="seller-details">
                <span className="seller-type-badge">
                  {bike.sellerType === 'trade' || bike.sellerContact?.type === 'trade' ? 'Trade' : 'Private'}
                </span>
                
                {(bike.sellerType === 'trade' || bike.sellerContact?.type === 'trade') && (
                  <div className="trade-seller-details">
                    {bike.sellerContact?.businessLogo && (
                      <div className="dealer-logo-display">
                        <img src={bike.sellerContact.businessLogo} alt={bike.sellerContact?.businessName || 'Dealer'} />
                      </div>
                    )}
                    {bike.sellerContact?.businessName && (
                      <div className="dealer-business-name">{bike.sellerContact.businessName}</div>
                    )}
                    {bike.sellerContact?.businessWebsite && (
                      <div className="dealer-website">
                        <a 
                          href={bike.sellerContact.businessWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dealer-website-link"
                        >
                          🌐 Visit Website →
                        </a>
                      </div>
                    )}
                    {bike.sellerContact?.businessAddress && (
                      <div className="dealer-business-address">
                        {bike.sellerContact.businessAddress.street && (
                          <div>{bike.sellerContact.businessAddress.street}</div>
                        )}
                        {bike.sellerContact.businessAddress.city && (
                          <div>{bike.sellerContact.businessAddress.city}</div>
                        )}
                        {bike.sellerContact.businessAddress.postcode && (
                          <div>{bike.sellerContact.businessAddress.postcode}</div>
                        )}
                        {bike.sellerContact.businessAddress.country && (
                          <div>{bike.sellerContact.businessAddress.country}</div>
                        )}
                      </div>
                    )}
                    {!bike.sellerContact?.businessAddress && (
                      <div className="dealer-location">
                        📍 {extractTownName(bike.locationName) || 'Location available'}
                        {bike.distance && bike.distance > 0 && (
                          <> • <span className="distance-highlight">{Math.round(bike.distance)} miles away</span></>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {(bike.sellerType === 'private' || bike.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-icon">👤</div>
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {extractTownName(bike.locationName) || 'Location available'}
                      {bike.distance && bike.distance > 0 && (
                        <> • <span className="distance-highlight">{Math.round(bike.distance)} miles away</span></>
                      )}
                    </div>
                  </div>
                )}

                <div className="seller-contact-buttons">
                  {(bike.sellerContact?.phoneNumber || bike.phoneNumber) && (
                    <button className="call-seller-btn">
                      📞 {bike.sellerContact?.phoneNumber || bike.phoneNumber}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Seller + Price Indicator + Finance Calculator */}
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
                  {extractTownName(bike.locationName)}
                  {bike.distance && bike.distance > 0 && (
                    <span className="distance-highlight"> • {Math.round(bike.distance)} miles away</span>
                  )}
                </div>
              </div>

              {(bike.sellerContact?.phoneNumber || bike.phoneNumber) && (
                <button className="phone-btn">
                  📞 {bike.sellerContact?.phoneNumber || bike.phoneNumber}
                </button>
              )}
            </div>

            {/* Price Indicator - Above Finance Calculator */}
            {bike.price && (() => {
              const marketValue = bike.allValuations?.retail || 
                                 bike.allValuations?.Retail ||
                                 bike.valuation?.estimatedValue?.retail ||
                                 bike.valuation?.dealerPrice ||
                                 bike.estimatedValue;
              
              if (!marketValue || marketValue === bike.price) {
                console.log('⚠️ No market value available or same as price:', { price: bike.price, marketValue });
                return null;
              }
              
              const priceRatio = bike.price / marketValue;
              let priceLevel = null;
              let needleAngle = 0;
              let labelColor = '';
              
              console.log('💰 Price Indicator Debug:', {
                bikePrice: bike.price,
                marketValue: marketValue,
                priceRatio: priceRatio,
                percentage: (priceRatio * 100).toFixed(1) + '%'
              });
              
              // Price level logic (same as cars)
              if (priceRatio <= 0.75) {
                priceLevel = 'Great price';
                needleAngle = 54;
                labelColor = '#A5D6A7';
              } else if (priceRatio <= 0.85) {
                priceLevel = 'Good price';
                needleAngle = 80;
                labelColor = '#388E3C';
              } else if (priceRatio <= 0.95) {
                priceLevel = 'Good price';
                needleAngle = 100;
                labelColor = '#388E3C';
              } else if (priceRatio <= 1.05) {
                priceLevel = 'Fair price';
                needleAngle = 126;
                labelColor = '#FFC107';
              } else if (priceRatio <= 1.15) {
                priceLevel = 'Higher price';
                needleAngle = 162;
                labelColor = '#FF7043';
              } else {
                priceLevel = 'Lower price';
                needleAngle = 18;
                labelColor = '#BDBDBD';
              }
              
              const svgAngle = 180 + needleAngle;
              const needleX = 100 + 70 * Math.cos((svgAngle) * Math.PI / 180);
              const needleY = 100 - 70 * Math.sin((svgAngle) * Math.PI / 180);
              
              console.log('🎯 Needle Calculation:', {
                priceLevel,
                needleAngle,
                svgAngle,
                needleX,
                needleY,
                labelColor
              });
              
              return (
                <div className="good-price-indicator">
                  <div className="price-gauge">
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                      {/* Gauge background arcs */}
                      <path d="M 20 100 A 80 80 0 0 1 38 48" fill="none" stroke="#BDBDBD" strokeWidth="16" strokeLinecap="round"/>
                      <path d="M 38 48 A 80 80 0 0 1 70 26" fill="none" stroke="#A5D6A7" strokeWidth="16" strokeLinecap="round"/>
                      <path d="M 70 26 A 80 80 0 0 1 130 26" fill="none" stroke="#388E3C" strokeWidth="16" strokeLinecap="round"/>
                      <path d="M 130 26 A 80 80 0 0 1 162 48" fill="none" stroke="#FFC107" strokeWidth="16" strokeLinecap="round"/>
                      <path d="M 162 48 A 80 80 0 0 1 180 100" fill="none" stroke="#FF7043" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Needle */}
                      <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="8" fill="#1a1a1a"/>
                      <circle cx="100" cy="100" r="4" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="price-label" style={{ backgroundColor: labelColor }}>
                    {priceLevel}
                  </div>
                  <div className="price-amount">
                    {formatPrice(bike.price)}
                  </div>
                </div>
              );
            })()}

            {/* Finance Calculator - Below Price Indicator */}
            <FinanceCalculator 
              price={bike.price || bike.estimatedValue || 5000}
              apr={bike.year ? (() => {
                const age = new Date().getFullYear() - bike.year;
                if (age <= 2) return 6.9;
                if (age <= 5) return 9.9;
                if (age <= 9) return 12.9;
                return 16.9;
              })() : 9.9}
              minDepositPercent={0}
              maxDepositPercent={50}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default BikeDetailPage;
