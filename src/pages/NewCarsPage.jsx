import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { filterService } from '../services/filterService';
import './NewCarsPage.css';

const NewCarsPage = () => {
  const navigate = useNavigate();
  const [newCars, setNewCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    maxPrice: '',
    postcode: ''
  });
  const [postcodeError, setPostcodeError] = useState('');

  useEffect(() => {
    document.title = 'New Cars for Sale | CarCatalog';
    window.scrollTo(0, 0);
    fetchNewCars();
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    try {
      setLoadingMakes(true);
      const makesData = await filterService.getMakes();
      setMakes(makesData);
      console.log('Fetched makes from database:', makesData.length);
    } catch (err) {
      console.error('Error fetching makes:', err);
      setMakes([]);
    } finally {
      setLoadingMakes(false);
    }
  };

  const fetchNewCars = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_BASE_URL}/vehicles`, {
        params: {
          condition: 'new',
          limit: 8,
          advertStatus: 'active',
          isDealerListing: true
        }
      });
      setNewCars(response.data.data || []);
    } catch (error) {
      console.error('Error fetching new cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Validate postcode is entered
    if (!searchFilters.postcode.trim()) {
      setPostcodeError('Please enter a postcode to search');
      return;
    }

    const params = new URLSearchParams();
    if (searchFilters.make) params.append('make', searchFilters.make);
    if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);
    if (searchFilters.postcode) params.append('postcode', searchFilters.postcode);
    params.append('condition', 'new');
    navigate(`/search-results?${params.toString()}`);
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing in postcode field
    if (field === 'postcode' && postcodeError) {
      setPostcodeError('');
    }
  };

  return (
    <div className="new-cars-page">
      {/* Hero Section */}
      <section className="new-hero">
        <div className="new-hero-background">
          <div className="new-hero-container">
            <span className="new-hero-label">New Cars</span>
            <h1 className="new-hero-title">Nothing like that smell of a new car</h1>
            
            <div className="new-search-card">
              <div className="new-search-fields">
                <div className="new-search-field">
                  <label>Max Price</label>
                  <select 
                    value={searchFilters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  >
                    <option value="">Any Price</option>
                    <option value="20000">Up to £20,000</option>
                    <option value="30000">Up to £30,000</option>
                    <option value="40000">Up to £40,000</option>
                    <option value="50000">Up to £50,000</option>
                    <option value="75000">Up to £75,000</option>
                  </select>
                </div>
                <div className="new-search-field">
                  <label>Make</label>
                  <select
                    value={searchFilters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    disabled={loadingMakes}
                  >
                    <option value="">Any Make</option>
                    {loadingMakes ? (
                      <option disabled>Loading makes...</option>
                    ) : (
                      makes.map(makeName => (
                        <option key={makeName} value={makeName}>{makeName}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="new-search-field">
                  <label>Postcode</label>
                  <input 
                    type="text" 
                    placeholder="Enter postcode"
                    value={searchFilters.postcode}
                    onChange={(e) => handleFilterChange('postcode', e.target.value.toUpperCase())}
                    className={postcodeError ? 'input-error' : ''}
                  />
                  {postcodeError && (
                    <div className="field-error-message">{postcodeError}</div>
                  )}
                </div>
              </div>
              <button className="new-search-btn" onClick={handleSearch}>🔍 Search new</button>
            </div>
          </div>
        </div>
      </section>

      {/* New Cars Available */}
      <section className="new-deals">
        <h2>Brand New Cars Available Now</h2>
        <p className="section-subtitle">Explore our latest collection of new vehicles</p>
        {loading ? (
          <div className="loading-state">Loading new cars...</div>
        ) : newCars.length > 0 ? (
          <>
            <div className="deals-scroll">
              {newCars.map(car => (
                <div 
                  key={car._id} 
                  className="lease-card"
                  onClick={() => navigate(`/cars/${car._id}`)}
                >
                  <div className="lease-image">
                    {car.images && car.images.length > 0 && (
                      <>
                        <span className="image-count">📷 {car.images.length}</span>
                        <img src={car.images[0]} alt={`${car.make} ${car.model}`} />
                      </>
                    )}
                  </div>
                  <div className="lease-details">
                    <div className="lease-prices">
                      <div className="price-col">
                        <span className="price-label">Price</span>
                        <span className="price-value">£{car.price?.toLocaleString()}</span>
                        <span className="price-period">{car.year} • {car.mileage?.toLocaleString()} miles</span>
                      </div>
                      <div className="price-col">
                        <span className="price-label">{car.fuelType}</span>
                        <span className="price-label">{car.transmission}</span>
                        <span className="price-period">{car.color}</span>
                      </div>
                    </div>
                    <h3 className="lease-title">{car.make} {car.model}</h3>
                    <p className="lease-spec">{car.description?.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-link" onClick={() => navigate('/search-results?condition=new')}>
              View all new cars →
            </button>
          </>
        ) : (
          <div className="no-results">
            <p>No new cars available at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
         
          <h2>APP</h2>
          <p>Coming Soon .</p>
         
        </div>
        <div className="promo-image">
          
          <img src="/images/brands/background1.jpeg "/>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2>Please visit our partners for your vehicle essentials</h2>
          <div className="partners-grid">
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/3.jpeg" alt="Plates For Cars" />
              </div>
              <a href="https://www.platesforcars.co.uk" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.platesforcars.co.uk
              </a>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/1.jpeg" alt="Euro Car Parts" />
              </div>
              <a href="https://www.eurocarparts.com" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.eurocarparts.com
              </a>
            </div>
            <div className="partner-card partner-card-extended">
              <div className="partner-image">
                <img src="/images/dummy/2.jpeg" alt="Kwik Fit" />
              </div>
              <a href="https://www.kwik-fit.com" target="_blank" rel="noopener noreferrer" className="partner-link">
                www.kwik-fit.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Professional */}
      <section className="benefits-section-pro">
        <div className="benefits-container">
          <div className="benefits-header">
            <h2>Why Buy a New Car?</h2>
            <p>Discover the advantages of owning a brand new vehicle</p>
          </div>
          <div className="benefits-grid-pro">
            <div className="benefit-card">
              <div className="benefit-icon-pro">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3>Latest Technology</h3>
              <p>Benefit from cutting-edge safety features, advanced infotainment systems, and the most efficient engines available.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon-pro">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Full Warranty Coverage</h3>
              <p>Enjoy complete peace of mind with comprehensive manufacturer warranties covering all major components.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon-pro">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Zero Maintenance Worries</h3>
              <p>No unexpected repair costs or maintenance issues. Everything is brand new and covered under warranty.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon-pro">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3>Flexible Finance Options</h3>
              <p>Choose from various financing plans including PCP, HP, and leasing to suit your budget and lifestyle.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewCarsPage;
