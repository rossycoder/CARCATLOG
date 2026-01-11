import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';

import { getFeaturedBrands, getAllBrands } from '../data/carBrands';
import AdvertisingPromotionSection from '../components/AdvertisingPromotionSection';
import { carService } from '../services/carService';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('Any');
  const [model, setModel] = useState('Any');
  const [radius, setRadius] = useState(25);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [error, setError] = useState('');
  const [totalCars, setTotalCars] = useState(0);
  const [loading, setLoading] = useState(true);

  const brands = getAllBrands();

  // Fetch total car count on initial load
  useEffect(() => {
    fetchCarCount();
  }, []);

  const fetchCarCount = async () => {
    try {
      setLoading(true);
      const count = await carService.getCarCount();
      setTotalCars(count);
      console.log('Total cars from database:', count);
    } catch (err) {
      console.error('Error fetching car count:', err);
      setTotalCars(0); // Show 0 if there's an error
    } finally {
      setLoading(false);
    }
  };

  const validatePostcode = (postcode) => {
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  };

  const handleSearch = () => {
    const trimmedPostcode = postcode.trim();
    
    // Validate postcode - it's required
    if (!trimmedPostcode) {
      setError('Please enter a postcode');
      return;
    }
    
    // Validate postcode format
    if (!validatePostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    
    // Clear error if validation passes
    setError('');
    
    // Build query string for URL
    const queryParams = new URLSearchParams();
    queryParams.append('postcode', trimmedPostcode);
    queryParams.append('radius', radius);
    if (make !== 'Any') queryParams.append('make', make);
    if (model !== 'Any') queryParams.append('model', model);

    // Navigate to search results page with query parameters
    navigate(`/search-results?${queryParams.toString()}`);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode the coordinates to get a postcode
          console.log('Location detected:', position.coords);
          // For demo purposes, set a sample postcode
          setPostcode('SW1A 1AA');
        },
        (error) => {
          console.error('Error detecting location:', error);
          alert('Unable to detect location. Please enter your postcode manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleMakeChange = (e) => {
    const selectedMake = e.target.value;
    setMake(selectedMake);
    setModel('Any'); // Reset model when make changes
  };

  const handleMoreOptions = () => {
    // Clear previous error
    setError('');
    
    const trimmedPostcode = postcode.trim();
    
    // Validate postcode is entered
    if (!trimmedPostcode) {
      setError('Please enter a postcode first');
      return;
    }
    
    // Validate postcode format
    if (!validatePostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    
    // Build query params with current search values
    const params = new URLSearchParams();
    
    params.append('postcode', trimmedPostcode);
    params.append('openFilter', 'true'); // Flag to auto-open filter
    if (make && make !== 'Any') {
      params.append('make', make);
    }
    if (model && model !== 'Any') {
      params.append('model', model);
    }
    
    // Navigate to search results page
    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section with Background Image and Search Bar */}
      <section className="hero-section-with-search">
        <div className="hero-background-overlay"></div>
        <div className="container">
          <div className="hero-content">
            {/* Search Bar */}
            <div className="search-container-hero">
              <div className="search-field-group">
                <div className="search-field">
                  <label>Postcode *</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="e.g. SW1A 1AA" 
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value.toUpperCase());
                        if (error) setError(''); // Clear error when user types
                      }}
                      className={error ? 'input-error' : ''}
                    />
                    <button 
                      className="location-icon-btn" 
                      aria-label="Use my location"
                      onClick={handleLocationDetect}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  {error && (
                    <div className="field-error-message">
                      {error}
                    </div>
                  )}
                </div>
                <div className="search-field">
                  <label>Make</label>
                  <select value={make} onChange={handleMakeChange}>
                    <option>Any</option>
                    {brands.map((brand) => (
                      <option key={brand.name} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <label>Model</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    <option>Any</option>
                  </select>
                </div>
              </div>
              <div className="search-button-group">
                <a 
                  className="more-options-link"
                  onClick={handleMoreOptions}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleMoreOptions()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M7 12h10M11 18h2"/>
                  </svg>
                  More options
                </a>
                <button 
                  className="search-button" 
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  {loading ? 'Loading...' : `Search ${totalCars} cars`}
                </button>
              </div>
              {showMoreOptions && (
                <div className="more-options-panel">
                  <div className="search-field">
                    <label>Radius (miles)</label>
                    <input 
                      type="number" 
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value) || 25)}
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section with Text and Animated Car */}
      <section className="welcome-hero-section">
        <div className="container">
          <div className="welcome-content-wrapper">
            <div className="welcome-text-content">
              <h1 className="welcome-title">
                <strong>Welcome!</strong>
              </h1>
              <p className="welcome-subtitle">
                Your next car adventure starts right here!
              </p>
            
              <p>
                CarCatALog is the UK's newest online vehicle listing platform, created to offer a transparent, honest, and cost-effective alternative to traditional automotive marketplaces. We believe buying and selling vehicles should be simple, fair, and accessible to everyone.
              </p>
              <p>
                We specialise in cars, bikes, and vans, supporting both private sellers and buyers as well as the motor trade. Our platform is designed to make listing and searching vehicles straightforward, without the high costs and unnecessary complexity found on other UK sites.
              </p>
              <p>
                For motor traders, CarCatALog offers dedicated trade subscription packages, complete with a secure login and live dashboard to manage listings efficiently. Our trade solutions are built to deliver real value, helping dealers of all sizes reach the right audience while keeping costs under control.
              </p>
              <p>
                At CarCatALog, transparency and value come first. We're building a modern vehicle marketplace that puts users first and sets a new standard for how vehicles are bought and sold online in the UK.
              </p>
            </div>
            <div className="welcome-car-animation">
              <div className="car-dream-text">
                Find Your <span className="dream-highlight">Dream</span> Car Today
              </div>
              <div className="animated-car-container">
                <img 
                  src="/images/brands/cars.jpeg" 
                  alt="Dream Car" 
                  className="animated-car"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* Advertising Promotion Section */}
      <section className="advertising-section">
        <div className="container">
          <AdvertisingPromotionSection />
        </div>
      </section>

     

    

      {/* Value Your Car Section */}
      <section className="value-car-section">
        <div className="container">
          <div className="value-car-content">
            <div className="value-left">
              <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" alt="Couple loading car" />
            </div>
            <div className="value-right">
              <h2>We can help provide you with an accurate current market valuation for your vehicle</h2>
              <p>CarCatALog provides real-time vehicle valuations in seconds. Obtain an accurate, data-driven valuation of your vehicle. Our valuation delivers precise vehicle valuations powered by real-time market data.</p>
              <button className="btn-outline-primary" onClick={() => navigate('/valuation')}>Value your car</button>
            </div>
          </div>
        </div>
      </section>

      {/* Buying Essentials */}
      <section className="buying-essentials">
        <div className="container">
          <h2>Buying essentials</h2>
          <div className="essentials-grid">
            <div className="essential-card clickable-card" onClick={() => navigate('/vehicle-check')}>
              <div className="essential-icon">📋</div>
              <h3>Check a car's history</h3>
              <p>Make informed decisions with a full background check before buying your next vehicle.</p>
              <div className="card-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
            <div className="essential-card">
              <div className="essential-icon">🛡️</div>
              <h3>Security advice</h3>
              <p>Guidance on staying safe when buying or selling a car.</p>
            </div>
            <div className="essential-card clickable-card" onClick={() => navigate('/valuation')}>
              <div className="essential-icon">🏷️</div>
              <h3>What's it worth</h3>
              <p>Get a valuation to help you price your car for sale or part-exchange.</p>
              <div className="card-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>



     {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2>Please visit our partners for your vehicle essentials</h2>
          <div className="partners-grid">
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/1.jpeg" alt="Plates For Cars" />
              </div>
              <a href="https://www.platesforcars.co.uk" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.platesforcars.co.uk
              </a>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/2.jpeg" alt="Euro Car Parts" />
              </div>
              <a href="https://www.eurocarparts.com" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.eurocarparts.com
              </a>
            </div>
            <div className="partner-card partner-card-extended">
              <div className="partner-image">
                <img src="/images/dummy/3.jpeg" alt="Kwik Fit" />
              </div>
              <a href="https://www.kwik-fit.com" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.kwik-fit.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Follow Us on Social Media */}
      <section className="social-media-section">
        <div className="container">
          <div className="social-box">
            <h2>Follow us on social media</h2>
            <p className="social-subtitle">All the latest news for you</p>
            <div className="social-icons-grid">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <div className="social-icon-circle">
                  <FaFacebookF />
                </div>
                <span>Facebook</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <div className="social-icon-circle">
                  <FaYoutube />
                </div>
                <span>YouTube</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <div className="social-icon-circle">
                  <FaInstagram />
                </div>
                <span>Instagram</span>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <div className="social-icon-circle">
                  <FaTiktok />
                </div>
                <span>TikTok</span>
              </a>
             
            </div>
          </div>
          
        
        </div>
      </section>
    </div>
  );
};



// Browse Brands Component with Expand/Collapse
const BrowseBrands = () => {
  const [showAll, setShowAll] = useState(false);
  
  const displayedBrands = showAll ? getAllBrands() : getFeaturedBrands();

  return (
    <>
      <div className="brands-grid">
        {displayedBrands.map((brand) => (
          <div key={brand.name} className="brand-tile">
            <div className="brand-logo">{brand.logo}</div>
            <h3>{brand.name.toUpperCase()}</h3>
          </div>
        ))}
      </div>
      <div className="show-all-brands">
        <button onClick={() => setShowAll(!showAll)} className="show-all-btn">
          <span className="plus-icon">{showAll ? '−' : '+'}</span>
          {showAll ? 'Hide all brands' : 'Show all brands'}
        </button>
      </div>
    </>
  );
};

export default HomePage;
