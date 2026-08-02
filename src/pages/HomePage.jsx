import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { organizationSchema, websiteSchema } from '../utils/seoSchemas';

import AdvertisingPromotionSection from '../components/AdvertisingPromotionSection';
import CarCard from '../components/CarCard';
import { carService } from '../services/carService';
import { filterService } from '../services/filterService';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('Any');
  const [model, setModel] = useState('Any');
  const [radius, setRadius] = useState(1000);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [error, setError] = useState('');
  const [totalCars, setTotalCars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [latestVehicles, setLatestVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('registration'); // registration, makeModel, advanced
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('Any');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Desktop: 4 initially, 8 on "show all" | Mobile: 3 initially, 6 on "show all"
  const DEFAULT_VEHICLE_COUNT = isMobile ? 3 : 4;
  const EXPANDED_VEHICLE_COUNT = isMobile ? 6 : 8;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll effect for mobile carousel
  useEffect(() => {
    if (!isMobile || !carouselRef.current || latestVehicles.length === 0) return;

    const carousel = carouselRef.current;
    const scrollAmount = carousel.offsetWidth * 0.85; // 85% width per card
    const maxIndex = showAllVehicles ? EXPANDED_VEHICLE_COUNT : DEFAULT_VEHICLE_COUNT;
    let currentIndex = 0;

    const autoScroll = setInterval(() => {
      currentIndex++;
      if (currentIndex >= maxIndex || currentIndex >= latestVehicles.length) {
        currentIndex = 0; // Loop back to start
      }
      
      carousel.scrollTo({
        left: scrollAmount * currentIndex,
        behavior: 'smooth'
      });
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(autoScroll);
  }, [isMobile, latestVehicles.length, showAllVehicles, DEFAULT_VEHICLE_COUNT, EXPANDED_VEHICLE_COUNT]);

  // Fetch count — re-runs when make or model changes
  const fetchCarCount = useCallback(async (selectedMake, selectedModel, selectedPostcode = '', selectedMileage = 'Any') => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMake && selectedMake !== 'Any') params.make = selectedMake;
      if (selectedModel && selectedModel !== 'Any') params.model = selectedModel;
      if (selectedPostcode && selectedPostcode.trim()) params.postcode = selectedPostcode.trim();
      if (selectedMileage && selectedMileage !== 'Any') params.maxMileage = selectedMileage;
      
      const count = await carService.getCarCount(params);
      setTotalCars(count || 0);
    } catch (err) {
      console.error('Error fetching car count:', err);
      setTotalCars(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarCount('Any', 'Any', '', 'Any');
    fetchMakes();
    fetchLatestVehicles();
  }, [fetchCarCount]);

  useEffect(() => {
    fetchCarCount(make, model, postcode, 'Any');
  }, [make, model, postcode, fetchCarCount]);

  useEffect(() => {
    if (make && make !== 'Any') {
      fetchModels(make);
    } else {
      setModels([]);
      setModel('Any');
    }
  }, [make]);

  const fetchMakes = async () => {
    try {
      setLoadingMakes(true);
      const makesData = await filterService.getMakes();
      setMakes(makesData);
    } catch (err) {
      console.error('Error fetching makes:', err);
      setMakes([]);
    } finally {
      setLoadingMakes(false);
    }
  };

  const fetchModels = async (selectedMake) => {
    try {
      setLoadingModels(true);
      const modelsData = await filterService.getModelsForMake(selectedMake);
      setModels(modelsData);
    } catch (err) {
      console.error('Error fetching models:', err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchLatestVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await carService.searchCars({ limit: 50 }); // Fetch more to ensure we have enough after filtering
      
      // Filter: Only active/approved cars, exclude sold/reserved/draft/deleted
      const availableVehicles = (response.cars || []).filter(car => {
        const status = car.status?.toLowerCase();
        return (
          status !== 'sold' && 
          status !== 'reserved' && 
          status !== 'draft' &&
          status !== 'deleted' &&
          (status === 'active' || status === 'approved' || car.advertStatus === 'active')
        );
      });

      // Separate by seller type
      // Private: No dealerId, no isDealerListing, sellerContact.type !== 'trade'
      const privateCars = availableVehicles.filter(car => 
        !car.dealerId && 
        !car.isDealerListing && 
        car.sellerContact?.type !== 'trade'
      );
      
      // Trade User: Has sellerContact.type = 'trade' but no dealerId
      const tradeCars = availableVehicles.filter(car => 
        car.sellerContact?.type === 'trade' && 
        !car.dealerId &&
        !car.isDealerListing
      );
      
      // Trade Dealer: Has dealerId or isDealerListing = true
      const dealerCars = availableVehicles.filter(car => 
        car.dealerId || car.isDealerListing === true
      );

      // Mix vehicles based on requirements
      // Desktop: 2 private + 2 trade + 4 dealer = 8 total
      // Mobile: 2 private + 2 trade + 2 dealer = 6 total
      const isMobileView = window.innerWidth <= 768;
      const dealerCount = isMobileView ? 2 : 4;
      
      const mixedVehicles = [
        ...privateCars.slice(0, 2),       // 2 private
        ...tradeCars.slice(0, 2),         // 2 trade user
        ...dealerCars.slice(0, dealerCount), // 4 dealer (desktop) or 2 dealer (mobile)
        // Extra buffer for "show all" functionality
        ...privateCars.slice(2, 4),
        ...tradeCars.slice(2, 4),
        ...dealerCars.slice(dealerCount, dealerCount * 2)
      ].filter(Boolean); // Remove undefined entries

      setLatestVehicles(mixedVehicles);
    } catch (err) {
      console.error('Error fetching latest vehicles:', err);
      setLatestVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const validatePostcode = (postcode) => {
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  };

  const handleSearch = () => {
    // Search with postcode, make, and model
    const trimmedPostcode = postcode.trim();
    if (!trimmedPostcode) {
      setError('Please enter a postcode');
      return;
    }
    if (!validatePostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    setError('');
    const queryParams = new URLSearchParams();
    queryParams.append('postcode', trimmedPostcode);
    queryParams.append('radius', radius);
    if (make && make !== 'Any') queryParams.append('make', make);
    if (model && model !== 'Any') queryParams.append('model', model);
    navigate(`/search-results?${queryParams.toString()}`);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setPostcode('SW1A 1AA'),
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
    setModel('Any');
  };

  const handleMoreOptions = () => {
    setError('');
    const trimmedPostcode = postcode.trim();
    if (!trimmedPostcode) {
      setError('Please enter a postcode first');
      return;
    }
    if (!validatePostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    const params = new URLSearchParams();
    params.append('postcode', trimmedPostcode);
    params.append('radius', radius);
    params.append('openFilter', 'true');
    if (make && make !== 'Any') params.append('make', make);
    if (model && model !== 'Any') params.append('model', model);
    navigate(`/search-results?${params.toString()}`);
  };

  const handleTabChange = (tab) => {
    setActiveSearchTab(tab);
    setError('');
    
    // Advanced Search tab pe click karne par directly redirect
    if (tab === 'advanced') {
      navigate('/search-results?postcode=SW1A+1AA&radius=1000&openFilter=true');
    }
  };

  const visibleVehicles = showAllVehicles
    ? latestVehicles.slice(0, EXPANDED_VEHICLE_COUNT)
    : latestVehicles.slice(0, DEFAULT_VEHICLE_COUNT);

  return (
    <>
      <SEOHelmet
        title="CarCatlog - Buy & Sell Cars, Bikes & Vans in UK | Best Deals"
        description={`Find your perfect vehicle from ${totalCars.toLocaleString()}+ cars, bikes and vans. Get instant vehicle checks, free valuations, and sell your vehicle quickly. Trusted UK marketplace.`}
        keywords="buy cars UK, sell cars online, used cars for sale, new cars, car valuation, vehicle check, MOT history, bikes for sale, vans for sale, car marketplace UK"
        url="/"
        schema={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema, websiteSchema]
        }}
      />

      <div className="home-page">

            {/* Hero Section - Modern Layout */}
            <section className="hero-section-new">
              {/* Mobile Car Image Banner */}
              <div className="hero-image-banner">
                <img 
                  src="/mobile responsive/ChatGPT Image Jul 30, 2026, 01_48_55 AM.png" 
                  alt="Featured Car" 
                  className="hero-car-image"
                />
              </div>

              <div className="container">
                <div className="hero-grid">
                  <div className="hero-left">
                    <h1 className="hero-main-title">
                      Find your next car<br />
                      with <span className="text-primary">confidence</span>
                    </h1>
                    <p className="hero-subtitle">
                      Search thousands of cars, vans and motorcycles from trusted sellers across the UK.
                    </p>
                  </div>

                  <div className="hero-right">
                    <img
                      src="/images/brands/homepagedektop.jfif"
                      alt="Featured Car"
                      className="hero-car-image"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Search Widget Section - Separate from Hero */}
            <section className="search-widget-section">
              <div className="container">
                <div className="hero-search-widget">
                      <div className="hero-search-box">
                        <div className="search-input-group-grid">
                          {/* Top row - three fields */}
                          <div className="search-field">
                            <label className="search-label">POSTCODE *</label>
                            <input
                              type="text"
                              placeholder="e.g. SW1A 1AA"
                              value={postcode}
                              onChange={(e) => {
                                setPostcode(e.target.value.toUpperCase());
                                if (error) setError('');
                              }}
                              className={`search-input ${error ? 'input-error' : ''}`}
                            />
                          </div>

                          <div className="search-field">
                            <label className="search-label">MAKE</label>
                            <select
                              value={make}
                              onChange={handleMakeChange}
                              disabled={loadingMakes}
                              className="search-select"
                            >
                              <option value="Any">Any</option>
                              {makes.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>

                          <div className="search-field">
                            <label className="search-label">MODEL</label>
                            <select
                              value={model}
                              onChange={(e) => setModel(e.target.value)}
                              disabled={loadingModels || make === 'Any'}
                              className="search-select"
                            >
                              <option value="Any">Any</option>
                              {models.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bottom row - More options under Postcode */}
                          <div className="search-actions-row">
                            <button className="more-options-btn" onClick={handleMoreOptions}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                              More options
                            </button>
                          </div>

                          {/* Bottom row - Search button under Make/Model */}
                          <div className="search-button-wrapper">
                            <button className="hero-search-btn-large" onClick={handleSearch}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                              </svg>
                              Search {totalCars > 0 ? `${totalCars.toLocaleString()} cars` : ''}
                            </button>
                          </div>
                        </div>

                        {error && <div className="hero-error-message">{error}</div>}
                      </div>
                  </div>
                </div>
              </section>

            {/* Trust Features Section */}
            <section className="trust-features-section">
              <div className="container">
                <div className="trust-features-grid-icons">
                  <div className="trust-icon-item">
                    <img src="/car/image-1012020805144907.jfif" alt="Auto Ad Population - Just add photos & description" />
                  </div>
                  <div className="trust-icon-item">
                    <img src="/car/image-1055113400391913.jfif" alt="Mot Status & History - Included on every vehicle" />
                  </div>
                  <div className="trust-icon-item">
                    <img src="/car/image-897020703460582.jfif" alt="Basic Vehicle History Checks - Included in every listing" />
                  </div>
                  <div className="trust-icon-item">
                    <img src="/car/image-2093432474577093.jfif" alt="Fair Pricing - A genuine alternative" />
                  </div>
                </div>
              </div>
            </section>

            {/* Browse by Category */}
            <section className="browse-category-section">
              <div className="container">
                <div className="section-header">
                  <h2>Browse by category</h2>
                  <button
                    className="view-all-btn-blue"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                  >
                    {showAllCategories ? 'Show less' : 'View all categories'}
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      style={{ transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                </div>
                <div className={`category-grid ${showAllCategories ? 'expanded' : ''}`}>
                  <div className="category-card" onClick={() => navigate('/search-results?bodyType=MPV')}>
                    <div className="category-image"><img src="/car/suv.jfif" alt="MPV" /></div>
                    <div className="category-info">
                      <h3>MPV</h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                  <div className="category-card" onClick={() => navigate('/search-results?bodyType=Estate')}>
                    <div className="category-image"><img src="/car/saloon.jfif" alt="Estate" /></div>
                    <div className="category-info">
                      <h3>Estate</h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                  <div className="category-card" onClick={() => navigate('/search-results?bodyType=Coupe')}>
                    <div className="category-image"><img src="/car/coupe.jfif" alt="Coupe" /></div>
                    <div className="category-info">
                      <h3>Coupe</h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                  <div className="category-card" onClick={() => navigate('/search-results?bodyType=Convertible')}>
                    <div className="category-image"><img src="/car/convertible.jfif" alt="Convertible" /></div>
                    <div className="category-info">
                      <h3>Convertible</h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>

                  {showAllCategories && (
                    <>
                      <div className="category-card" onClick={() => navigate('/search-results?bodyType=Hatchback')}>
                        <div className="category-image"><img src="/car/hatchback.jpeg" alt="Hatchback" /></div>
                        <div className="category-info">
                          <h3>Hatchback</h3>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
                      <div className="category-card" onClick={() => navigate('/search-results?bodyType=SUV')}>
                        <div className="category-image"><img src="/car/mpv.jfif" alt="SUV" /></div>
                        <div className="category-info">
                          <h3>SUV</h3>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
                      <div className="category-card" onClick={() => navigate('/search-results?bodyType=Saloon')}>
                        <div className="category-image"><img src="/car/estate.jfif" alt="Saloon" /></div>
                        <div className="category-info">
                          <h3>Saloon</h3>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
                      <div className="category-card" onClick={() => navigate('/search-results?bodyType=Sports')}>
                        <div className="category-image"><img src="/car/pickup.jfif" alt="Sports" /></div>
                        <div className="category-info">
                          <h3>Sports</h3>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Sell Your Vehicle - MOVED UP */}
            <section className="sell-vehicle-section-new">
              <div className="container">
                <div className="sell-vehicle-header">
                  <div className="sell-icon-large">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </div>
                  <div className="sell-text-content">
                    <h2>Sell your vehicle to thousands of buyers across the UK</h2>
                    <p>Choose a listing package that works for you and get your vehicle seen by the right audience.</p>
                  </div>
                  <div className="sell-cta-section">
                    <button className="btn-view-packages-large" onClick={() => navigate('/advertising-prices?viewOnly=true')}>
                      View listing packages / prices
                    </button>
                    <div className="sell-price-label">From £4.99</div>
                  </div>
                </div>

                <div className="key-benefits-area">
                  <h3>Key Benefits</h3>
                  <div className="benefits-cards">
                    <div className="benefit-item">
                      <div className="benefit-icon-simple">
                        <img src="/car/WhatsApp%20Image%202026-07-27%20at%2011.07.10%20PM.jpeg" alt="Auto Ad Population" />
                      </div>
                      <div className="benefit-text">
                        <h4>Auto Ad Population</h4>
                        <p>We automatically create your ad using your photos and vehicle details — quick, easy and hassle-free.</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="benefit-icon-simple">
                        <img src="/car/WhatsApp%20Image%202026-07-27%20at%2011.07.11%20PM%20(1).jpeg" alt="MOT Status" />
                      </div>
                      <div className="benefit-text">
                        <h4>MOT History & Basic History Shown</h4>
                        <p>Build trust with buyers by showing MOT history and basic vehicle history with every ad.</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <div className="benefit-icon-simple">
                        <img src="/car/WhatsApp%20Image%202026-07-27%20at%2011.07.11%20PM.jpeg" alt="Packages" />
                      </div>
                      <div className="benefit-text">
                        <h4>3 Packages to Choose From</h4>
                        <p>Flexible options to suit your needs. All packages are half the price of other leading sites.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dealership Promotion */}
            <section className="dealership-promo-section">
              <div className="container">
                <div className="dealership-content">
                  <div className="dealership-text">
                    <h2>
                      Grow your dealership with <span className="brand-car">Car</span><span className="brand-cat">Cat</span><span className="brand-a">A</span><span className="brand-log">Log</span>
                    </h2>
                    <ul className="dealership-features">
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Choose from our Pay As You Go or Subscription packages.</li>
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Dealer dashboard with Analytics & Performance tools.</li>
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Dealer branding</li>
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Stock feed integration with all CSV, Json & XML management system.</li>
                      <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Less than a third of the cost with 30 day free trial.</li>
                    </ul>
                    <button className="btn-trade-login" onClick={() => navigate('/trade/login')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Trade Login
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Latest Vehicles Added */}
            <section className="latest-vehicles-section">
              <div className="container">
                <div className="section-header">
                  <h2>Latest Vehicles Added</h2>
                  {latestVehicles.length > DEFAULT_VEHICLE_COUNT && (
                    <button
                      className="view-all-btn-blue"
                      onClick={() => setShowAllVehicles(!showAllVehicles)}
                    >
                      {showAllVehicles ? 'Show less' : 'View all'}
                      <svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        style={{ transform: showAllVehicles ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                  )}
                </div>
                {loadingVehicles ? (
                  <div className="loading-message">Loading latest vehicles...</div>
                ) : (
                  <div ref={carouselRef} className={`vehicles-carousel ${showAllVehicles ? 'expanded' : ''}`}>
                    {visibleVehicles.length > 0 ? (
                      visibleVehicles.map((vehicle) => {
                        return <CarCard key={vehicle._id} car={vehicle} />;
                      })
                    ) : (
                      <div className="no-vehicles-message"><p>No vehicles available at the moment. Check back soon!</p></div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Value Your Car - After Latest Vehicles */}
            <section className="value-car-section">
              <div className="container">
                <div className="value-car-content">
                  <div className="value-left">
                    <h2>Get an accurate valuation for your car</h2>
                    <p>Find out what your car is worth in seconds. Free, instant valuation powered by real-time market data from thousands of vehicles listed for sale in the UK.</p>
                    <button className="btn-primary-large" onClick={() => navigate('/valuation')}>Value your car</button>
                  </div>
                  <div className="value-right">
                    <div className="value-car-image">
                      <img src="/images/brands/image-1020804767590490.jfif" alt="Car valuation with phone" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Buying Essentials */}
            <section className="buying-essentials">
              <div className="container">
                <h2>Buying essentials</h2>
                <div className="essentials-grid-horizontal">
                  <div className="essential-card-horizontal clickable-card" onClick={() => navigate('/vehicle-check')}>
                    <img src="/car/WhatsApp Image 2026-07-31 at 5.58.34 AM.jpeg" alt="Check a car's history" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '220px' }} />
                  </div>
                  
                  <div className="essential-card-horizontal clickable-card" onClick={() => navigate('/safety')}>
                    <img src="/car/WhatsApp Image 2026-07-31 at 5.58.34 AM (1).jpeg" alt="Security advice" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '220px' }} />
                  </div>
                  
                  <div className="essential-card-horizontal clickable-card" onClick={() => navigate('/valuation')}>
                    <img src="/car/WhatsApp Image 2026-07-31 at 5.58.34 AM (2).jpeg" alt="What's it worth" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '220px' }} />
                  </div>
                  
                  <div className="essential-card-horizontal clickable-card" onClick={() => navigate('/car-advice')}>
                    <img src="/car/WhatsApp Image 2026-07-31 at 5.58.34 AM (3).jpeg" alt="Car advice & guides" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '220px' }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Partners Section */}
            <section className="partners-section">
              <div className="container">
                <h2>Please visit our partners for your vehicle essentials</h2>
              </div>
              <div className="partners-marquee-wrapper">
                <div className="partners-marquee-track">
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/3.jpeg" alt="Plates For Cars" /></div>
                    <a href="https://www.platesforcars.co.uk" target="_blank" rel="noopener noreferrer" className="partner-link">www.platesforcars.co.uk</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/1.jpeg" alt="Euro Car Parts" /></div>
                    <a href="https://www.eurocarparts.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.eurocarparts.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/2.jpeg" alt="Kwik Fit" /></div>
                    <a href="https://www.kwik-fit.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.kwik-fit.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/thea.jpeg" alt="The AA" /></div>
                    <a href="https://www.theaa.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.theaa.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/carverticle.jpeg" alt="CarVertical" /></div>
                    <a href="https://www.carvertical.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.carvertical.com</a>
                  </div>
                  {/* Duplicate set for seamless loop */}
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/3.jpeg" alt="Plates For Cars" /></div>
                    <a href="https://www.platesforcars.co.uk" target="_blank" rel="noopener noreferrer" className="partner-link">www.platesforcars.co.uk</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/1.jpeg" alt="Euro Car Parts" /></div>
                    <a href="https://www.eurocarparts.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.eurocarparts.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/2.jpeg" alt="Kwik Fit" /></div>
                    <a href="https://www.kwik-fit.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.kwik-fit.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/thea.jpeg" alt="The AA" /></div>
                    <a href="https://www.theaa.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.theaa.com</a>
                  </div>
                  <div className="partner-card">
                    <div className="partner-image"><img src="/images/dummy/carverticle.jpeg" alt="CarVertical" /></div>
                    <a href="https://www.carvertical.com" target="_blank" rel="noopener noreferrer" className="partner-link">www.carvertical.com</a>
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
                      <div className="social-icon-circle"><FaFacebookF /></div>
                      <span>Facebook</span>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-item">
                      <div className="social-icon-circle"><FaYoutube /></div>
                      <span>YouTube</span>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-item">
                      <div className="social-icon-circle"><FaInstagram /></div>
                      <span>Instagram</span>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-item">
                      <div className="social-icon-circle"><FaTiktok /></div>
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

      </div>
    </>
  );
};

export default HomePage;