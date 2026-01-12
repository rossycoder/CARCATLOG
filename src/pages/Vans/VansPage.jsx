import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './VansPage.css';

const VansPage = () => {
  const navigate = useNavigate();
  const [vanCount, setVanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Vans for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchVanCount();
  }, []);

  const fetchVanCount = async () => {
    try {
      const count = await vanService.getVanCount();
      setVanCount(count);
    } catch (error) {
      console.error('Error fetching van count:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePostcode = (postcode) => {
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    const trimmedPostcode = postcode.trim();
    
    // Validate postcode - it's required
    if (!trimmedPostcode) {
      setError('Please enter a postcode');
      return;
    }
    
    // Validate postcode format
    if (!validatePostcode(trimmedPostcode)) {
      setError('Please enter a valid UK postcode (e.g. M1 1AE)');
      return;
    }
    
    // Build query string for URL
    const params = new URLSearchParams();
    params.append('postcode', trimmedPostcode);
    params.append('radius', '25');
    if (make) params.append('make', make);
    if (model) params.append('model', model);
    
    navigate(`/vans/search-results?${params.toString()}`);
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
      setError('Please enter a valid UK postcode (e.g. M1 1AE)');
      return;
    }
    
    // Build query params with current search values
    const params = new URLSearchParams();
    
    params.append('postcode', trimmedPostcode);
    params.append('openFilter', 'true'); // Flag to auto-open filter
    if (make) {
      params.append('make', make);
    }
    if (model) {
      params.append('model', model);
    }
    
    // Navigate to search results page
    navigate(`/vans/search-results?${params.toString()}`);
  };

  const handleMakeChange = (e) => {
    const selectedMake = e.target.value;
    setMake(selectedMake);
    setModel(''); // Reset model when make changes
  };

  return (
    <div className="vans-page">
      {/* Hero Section with Background Image */}
      <section className="vans-hero">
        <div className="vans-hero-background">
          <div className="vans-hero-overlay"></div>
          <div className="vans-hero-content">
            <div className="vans-hero-text">
              <span className="vans-hero-label">Used Vans</span>
              <h1 className="vans-hero-title">Find your perfect van</h1>
            </div>

            {/* Search Form */}
            <form className="vans-search-form" onSubmit={handleSearch}>
              <div className="vans-search-main">
                <div className="vans-search-field vans-search-postcode">
                  <label>Postcode *</label>
                  <input
                    type="text"
                    placeholder="e.g. M11AE"
                    value={postcode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPostcode(value.toUpperCase());
                    }}
                    className={error ? 'error' : ''}
                  />
                  {error && (
                    <div className="field-error-message">
                      {error}
                    </div>
                  )}
                </div>
                <div className="vans-search-field">
                  <label>Make</label>
                  <select 
                    value={make}
                    onChange={handleMakeChange}
                  >
                    <option value="">Any</option>
                    <option value="Ford">Ford</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Renault">Renault</option>
                    <option value="Peugeot">Peugeot</option>
                    <option value="Citroen">Citroen</option>
                    <option value="Vauxhall">Vauxhall</option>
                    <option value="Fiat">Fiat</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Toyota">Toyota</option>
                  </select>
                </div>
                <div className="vans-search-field">
                  <label>Model</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>

              <div className="vans-search-buttons">
                <a 
                  className="vans-more-options-link"
                  onClick={handleMoreOptions}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMoreOptions()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M7 12h10M11 18h2"/>
                  </svg>
                  More options
                </a>
                <button type="submit" className="vans-search-btn">
                  🔍 {loading ? 'Search vans' : `Search ${vanCount.toLocaleString()} vans`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="vans-quick-links">
        <div className="container">
          <div className="quick-links-grid">
            <div className="quick-link-card" onClick={() => navigate('/vans/used-vans')}>
              <h3>Used Vans</h3>
              <p>Browse pre-owned vans</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/vans/new-vans')}>
              <h3>New Vans</h3>
              <p>Explore brand new models</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/vans/sell-your-van')}>
              <h3>Sell Your Van</h3>
              <p>List your van for sale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2>Please visit our partners for your van essentials</h2>
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

      {/* Statistics Section */}
      <section className="vans-stats">
        <div className="container">
          <div className="stats-content">
            <div className="stats-number">
              <h2>{vanCount.toLocaleString()}</h2>
              <p>Vans available</p>
            </div>
            <div className="stats-text">
              <h3>Find your next work partner</h3>
              <p>Whether you need a panel van for deliveries, a crew van for your team, or a tipper for construction, we have thousands of vans from trusted sellers across the UK.</p>
              <button className="outline-btn" onClick={() => navigate('/vans/used-vans')}>
                Browse all vans
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VansPage;
