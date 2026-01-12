import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import './BikesPage.css';

const BikesPage = () => {
  const navigate = useNavigate();
  const [bikeCount, setBikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Bikes for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchBikeCount();
  }, []);

  const fetchBikeCount = async () => {
    try {
      const count = await bikeService.getBikeCount();
      setBikeCount(count);
    } catch (error) {
      console.error('Error fetching bike count:', error);
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
    
    navigate(`/bikes/search-results?${params.toString()}`);
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
    navigate(`/bikes/search-results?${params.toString()}`);
  };

  const handleMakeChange = (e) => {
    const selectedMake = e.target.value;
    setMake(selectedMake);
    setModel(''); // Reset model when make changes
  };

  return (
    <div className="bikes-page">
      {/* Hero Section with Background Image */}
      <section className="bikes-hero">
        <div className="bikes-hero-background">
          <div className="bikes-hero-overlay"></div>
          <div className="bikes-hero-content">
            <div className="bikes-hero-text">
              <span className="bikes-hero-label">Used Bikes</span>
              <h1 className="bikes-hero-title">Find your perfect ride</h1>
            </div>

            {/* Search Form */}
            <form className="bikes-search-form" onSubmit={handleSearch}>
              <div className="bikes-search-main">
                <div className="bikes-search-field bikes-search-postcode">
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
                <div className="bikes-search-field">
                  <label>Make</label>
                  <select 
                    value={make}
                    onChange={handleMakeChange}
                  >
                    <option value="">Any</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Ducati">Ducati</option>
                    <option value="BMW">BMW</option>
                    <option value="Harley-Davidson">Harley-Davidson</option>
                    <option value="Triumph">Triumph</option>
                    <option value="KTM">KTM</option>
                    <option value="Aprilia">Aprilia</option>
                  </select>
                </div>
                <div className="bikes-search-field">
                  <label>Model</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>

              <div className="bikes-search-buttons">
                <a 
                  className="bikes-more-options-link"
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
                <button type="submit" className="bikes-search-btn">
                  🔍 {loading ? 'Search bikes' : `Search ${bikeCount.toLocaleString()} bikes`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bikes-quick-links">
        <div className="container">
          <div className="quick-links-grid">
            <div className="quick-link-card" onClick={() => navigate('/bikes/used-bikes')}>
              <h3>Used Bikes</h3>
              <p>Browse pre-owned motorcycles</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/bikes/new-bikes')}>
              <h3>New Bikes</h3>
              <p>Explore brand new models</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/bikes/sell-your-bike')}>
              <h3>Sell Your Bike</h3>
              <p>List your motorcycle for sale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2>Please visit our partners for your bike essentials</h2>
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
      <section className="bikes-stats">
        <div className="container">
          <div className="stats-content">
            <div className="stats-number">
              <h2>{bikeCount.toLocaleString()}</h2>
              <p>Bikes available</p>
            </div>
            <div className="stats-text">
              <h3>Find your next adventure</h3>
              <p>Whether you're looking for a sports bike, cruiser, or adventure tourer, we have thousands of motorcycles from trusted sellers across the UK.</p>
              <button className="outline-btn" onClick={() => navigate('/bikes/used-bikes')}>
                Browse all bikes
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BikesPage;
