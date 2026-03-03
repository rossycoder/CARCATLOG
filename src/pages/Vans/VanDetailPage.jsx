import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import { vehicleSchema, breadcrumbSchema } from '../../utils/seoSchemas';
import VehicleHistorySection from '../../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../../components/Location/LocationDisplay';
import FinanceCalculator from '../../components/FinanceCalculator';
import MeetTheSellerSection from '../../components/SellerInfo/MeetTheSellerSection';
import { extractTownName } from '../../utils/vehicleFormatter';
import './VanDetailPage.css';

const VanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [van, setVan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Function to scroll to features section
  const scrollToFeatures = () => {
    setShowAllFeatures(true);
    // Scroll to features section with a small delay
    setTimeout(() => {
      const featuresSection = document.querySelector('.features-section');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Function to handle back navigation intelligently
  const handleBackClick = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/vans/used-vans');
    }
  };

  useEffect(() => {
    fetchVanDetails();
  }, [id]);

  const fetchVanDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Get user's postcode from localStorage
      const userPostcode = localStorage.getItem('userPostcode');
      
      // Build URL with optional postcode parameter
      let url = `${API_BASE_URL}/vans/${id}`;
      if (userPostcode) {
        url += `?postcode=${encodeURIComponent(userPostcode)}`;
      }
      
      console.log('Fetching van details from:', url);
      
      // Add cache-busting headers
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Van not found');
      }
      
      const data = await response.json();
      console.log('✅ Van data loaded successfully');
      console.log('🖼️ Images:', data.data.images?.length || 0, 'found');
      console.log('👤 Seller Contact:', JSON.stringify(data.data.sellerContact, null, 2));
      console.log('✨ Features:', data.data.features?.length || 0, 'found:', data.data.features);
      console.log('💰 Running Costs:', data.data.runningCosts);
      setVan(data.data);
    } catch (err) {
      console.error('Error fetching van details:', err);
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

  // Format van title in AutoTrader style - clean and professional
  const formatVanTitle = (van) => {
    if (!van) return '';
    
    // Start with make and model
    let title = `${van.make} ${van.model}`;
    
    // Clean up any duplicate words in the title
    const words = title.split(/\s+/);
    const uniqueWords = [...new Set(words)];
    
    return uniqueWords.join(' ').trim();
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
    : ['/images/dummy/placeholder.svg'];

  // Generate SEO data
  const seoTitle = `${van.make} ${van.model}${van.submodel ? ` ${van.submodel}` : ''} ${van.year} for sale - ${formatPrice(van.price)}`;
  const seoDescription = `${van.make} ${van.model} ${van.year} • ${formatMileage(van.mileage)} miles • ${van.fuelType} • ${van.transmission} • ${van.vanType || 'Panel Van'} • Located in ${extractTownName(van.locationName)}`;
  
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Vans', url: '/vans' },
    { name: 'Used Vans', url: '/vans/used-vans' },
    { name: `${van.make} ${van.model}`, url: `/vans/${van._id}` }
  ];

  return (
    <div className="van-detail-page">
      <SEOHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`/vans/${van._id}`}
        ogType="product"
        ogImage={images[0]}
        structuredData={[
          vehicleSchema({
            name: `${van.make} ${van.model}${van.submodel ? ` ${van.submodel}` : ''}`,
            description: van.description || seoDescription,
            image: images[0],
            price: van.price,
            mileage: van.mileage,
            year: van.year,
            fuelType: van.fuelType,
            transmission: van.transmission,
            color: van.color,
            registrationNumber: van.registrationNumber,
            url: `/vans/${van._id}`
          }),
          breadcrumbSchema(breadcrumbs)
        ]}
      />

      <div className="detail-container">
        {/* Back Button */}
        <button onClick={handleBackClick} className="back-to-results">
          ← Back to results
        </button>

        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            {!imageError ? (
              <img 
                src={images[currentImageIndex]} 
                alt={`${van.make} ${van.model}`}
                onError={() => {
                  console.warn('Image failed to load, using placeholder');
                  setImageError(true);
                }}
              />
            ) : (
              <img 
                src="/images/dummy/placeholder.svg" 
                alt="Placeholder" 
              />
            )}
            <button className="gallery-btn" onClick={() => {}}>
              📷 Gallery
            </button>
            <span className="image-counter">
              🖼️ {images.length}
            </span>
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.slice(0, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`View ${index + 1}`}
                  className={currentImageIndex === index ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.src = '/images/dummy/placeholder.svg';
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
          {/* Left Column - Van Details */}
          <div className="left-column">
            {/* Location */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {extractTownName(van.locationName)}{van.distance ? ` • ${van.distance} miles away` : ' • Location available'}
              </span>
            </div>

            {/* Title and Price */}
            <div className="van-header">
              <h1 className="van-title">
                {formatVanTitle(van)}
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

              <button className="view-all-specs" onClick={scrollToFeatures}>
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

            {/* Features Section */}
            {van.features && van.features.length > 0 && (
              <div className="features-section">
                <h2>Features</h2>
                <div className="features-grid">
                  {(showAllFeatures ? van.features : van.features.slice(0, 12)).map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
                {van.features.length > 12 && (
                  <button 
                    className="show-more-features"
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                  >
                    {showAllFeatures ? 'Show less' : `Show all ${van.features.length} features`}
                  </button>
                )}
              </div>
            )}

            {/* Running Costs Section */}
            {van.runningCosts && (
              <div className="running-costs-section-new">
                <h2>Running costs</h2>
                <div className="running-costs-horizontal">
                  {/* Fuel Economy */}
                  {(van.runningCosts?.fuelEconomy?.combined || van.combinedMpg) && (
                    <div className="running-cost-item">
                      <div className="cost-icon">⛽</div>
                      <div className="cost-content">
                        <div className="cost-label">Fuel economy</div>
                        <div className="cost-value">
                          {van.runningCosts?.fuelEconomy?.combined || van.combinedMpg} mpg
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Insurance Group */}
                  <div className="running-cost-item">
                    <div className="cost-icon">🛡️</div>
                    <div className="cost-content">
                      <div className="cost-label">Insurance group</div>
                      <div className="cost-value">
                        {(van.runningCosts?.insuranceGroup || van.insuranceGroup) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Annual Tax */}
                  <div className="running-cost-item">
                    <div className="cost-icon">💷</div>
                    <div className="cost-content">
                      <div className="cost-label">Tax per year</div>
                      <div className="cost-value">
                        {(van.runningCosts?.annualTax || van.annualTax) ? formatPrice(van.runningCosts?.annualTax || van.annualTax) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* CO2 Emissions */}
                  {(van.runningCosts?.co2Emissions || van.co2Emissions) && (
                    <div className="running-cost-item">
                      <div className="cost-icon">🌱</div>
                      <div className="cost-content">
                        <div className="cost-label">CO₂ emissions</div>
                        <div className="cost-value">
                          {van.runningCosts?.co2Emissions || van.co2Emissions} g/km
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={van.postcode || van.sellerContact?.postcode}
              sellerLocation={extractTownName(van.locationName)}
              distance={van.distance}
            />

            {/* Vehicle History Section - Always show, component handles missing VRM */}
            <VehicleHistorySection 
              vrm={van.registrationNumber || van.vrm}
              historyCheckId={van.historyCheckId}
              carData={van}
            />

            {/* MOT History Section - Always show, component handles missing VRM */}
            <MOTHistorySection 
              vrm={van.registrationNumber || van.vrm}
              carData={van}
            />

            {/* Meet the Seller Section */}
            <MeetTheSellerSection
              seller={{
                // CRITICAL: Detect trade seller by checking dealerId OR business info
                type: (van.dealerId || 
                       van.sellerContact?.type === 'trade' || 
                       van.isDealerListing || 
                       van.sellerContact?.businessName || 
                       van.sellerContact?.businessLogo || 
                       van.sellerContact?.businessWebsite) ? 'trade' : 'private',
                businessName: van.sellerContact?.businessName || van.dealerName || null,
                tradingName: van.sellerContact?.tradingName || null,
                logo: van.sellerContact?.businessLogo || van.sellerContact?.logo || van.dealerLogo || null,
                website: van.sellerContact?.businessWebsite || null,
                phoneNumber: van.sellerContact?.phoneNumber || van.phoneNumber || null,
                locationName: van.locationName,
                city: extractTownName(van.locationName),
                rating: van.sellerContact?.rating || null,
                reviewCount: van.sellerContact?.reviewCount || 0,
                stats: {
                  carsInStock: van.sellerContact?.stats?.carsInStock || 0,
                  yearsInBusiness: van.sellerContact?.stats?.yearsInBusiness || 0
                }
              }}
              distance={van.distance ? Math.round(van.distance) : null}
              postcode={van.postcode || van.sellerContact?.postcode}
            />
          </div>

          {/* Right Column - Contact Seller */}
          <div className="right-column">
            <div className="contact-card">
              <h3>Contact seller</h3>
              
              <div className="seller-info">
                <span className="seller-type">
                  {(van.dealerId || 
                    van.sellerContact?.type === 'trade' || 
                    van.isDealerListing || 
                    van.sellerContact?.businessName || 
                    van.sellerContact?.businessLogo || 
                    van.sellerContact?.businessWebsite) ? 'Trade seller' : 'Private seller'}
                </span>
                {van.sellerContact?.businessName && (
                  <div className="business-name">{van.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {extractTownName(van.locationName)}{van.distance ? ` • ${van.distance} miles away` : ''}
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

            {/* Price Indicator - Above Finance Calculator */}
            {van.price && (() => {
              // Get market value from different sources
              // Priority: private price > retail price > dealer price > estimated value
              let marketValue = van.allValuations?.private || 
                               van.allValuations?.Private ||
                               van.valuation?.estimatedValue?.private ||
                               van.allValuations?.retail || 
                               van.allValuations?.Retail ||
                               van.valuation?.estimatedValue?.retail ||
                               van.valuation?.dealerPrice ||
                               van.estimatedValue;
              
              // FALLBACK: If no market value, use price + 20% as estimated market value
              // This ensures gauge always shows
              if (!marketValue || marketValue === van.price) {
                marketValue = van.price * 1.2; // Assume market value is 20% higher than asking price
              }
              
              const priceRatio = van.price / marketValue;
              let priceLevel = null;
              let needleAngle = 0;
              let labelColor = '';
              
              // CORRECT LOGIC: Match gauge arc positions exactly
              // Gauge zones: Gray (0-36°) → Light Green (36-72°) → Dark Green (72-108°) → Yellow (108-144°) → Coral (144-180°)
              // IMPORTANT: Lower price ratio = Better deal = Needle points to GREEN zones (72-108°)
              if (priceRatio <= 0.75) {
                // 25% or more below market value - GREAT PRICE (Light Green zone: 36-72°)
                priceLevel = 'Great price';
                needleAngle = 54; // Middle of Light Green zone (36+72)/2
                labelColor = '#A5D6A7'; // Light Green
              } else if (priceRatio <= 0.85) {
                // 15-25% below market value - GOOD PRICE (Dark Green zone: 72-108°)
                priceLevel = 'Good price';
                needleAngle = 80; // Left side of Dark Green zone
                labelColor = '#388E3C'; // Dark Green
              } else if (priceRatio <= 0.95) {
                // 5-15% below market value - Still GOOD (Dark Green zone: 72-108°)
                priceLevel = 'Good price';
                needleAngle = 100; // Right side of Dark Green zone
                labelColor = '#388E3C'; // Dark Green
              } else if (priceRatio <= 1.05) {
                // Within 5% of market value - FAIR PRICE (Yellow zone: 108-144°)
                priceLevel = 'Fair price';
                needleAngle = 126; // Middle of Yellow zone (108+144)/2
                labelColor = '#FFC107'; // Yellow/Gold
              } else if (priceRatio <= 1.15) {
                // 5-15% above market value - HIGHER PRICE (Coral zone: 144-180°)
                priceLevel = 'Higher price';
                needleAngle = 162; // Middle of Coral zone (144+180)/2
                labelColor = '#FF7043'; // Coral/Orange
              } else {
                // More than 15% above market value - LOWER PRICE (Gray zone: 0-36°)
                priceLevel = 'Lower price';
                needleAngle = 18; // Middle of Gray zone (0+36)/2
                labelColor = '#BDBDBD'; // Gray
              }
              
              // Calculate needle position
              const svgAngle = 180 - needleAngle;
              const needleX = 100 + 70 * Math.cos(svgAngle * Math.PI / 180);
              const needleY = 100 - 70 * Math.sin(svgAngle * Math.PI / 180);
              
              return (
                <div className="good-price-indicator">
                  <div className="price-gauge">
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                      {/* Gauge background arcs - 5 zones */}
                      
                      {/* Zone 1: Gray - FAR LEFT (0-36°) */}
                      <path d="M 20 100 A 80 80 0 0 1 38 48" fill="none" stroke="#BDBDBD" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Zone 2: Light Green - LEFT-CENTER (36-72°) */}
                      <path d="M 38 48 A 80 80 0 0 1 70 26" fill="none" stroke="#A5D6A7" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Zone 3: Dark Green - CENTER (72-108°) */}
                      <path d="M 70 26 A 80 80 0 0 1 130 26" fill="none" stroke="#388E3C" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Zone 4: Yellow/Gold - RIGHT-CENTER (108-144°) */}
                      <path d="M 130 26 A 80 80 0 0 1 162 48" fill="none" stroke="#FFC107" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Zone 5: Coral/Orange - FAR RIGHT (144-180°) */}
                      <path d="M 162 48 A 80 80 0 0 1 180 100" fill="none" stroke="#FF7043" strokeWidth="16" strokeLinecap="round"/>
                      
                      {/* Needle pointing to appropriate zone */}
                      <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="8" fill="#1a1a1a"/>
                      <circle cx="100" cy="100" r="4" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="price-label" style={{ backgroundColor: labelColor }}>
                    {priceLevel}
                  </div>
                  <div className="price-amount">
                    {formatPrice(van.price)}
                  </div>
                </div>
              );
            })()}

            {/* Finance Calculator - Below Price Gauge */}
            <FinanceCalculator vehiclePrice={van.price} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default VanDetailPage;
