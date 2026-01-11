import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './NewVansPage.css';

const VAN_BRANDS = [
  'Ford', 'Mercedes-Benz', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Vauxhall', 'Fiat'
];

const FEATURED_VANS = [
  {
    id: 1,
    name: 'Ford Transit Custom',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
    description: 'The UK\'s best-selling van for good reason'
  },
  {
    id: 2,
    name: 'Mercedes-Benz Sprinter',
    image: 'https://images.unsplash.com/photo-1562519819-016930ada31b?w=400&h=300&fit=crop',
    description: 'Premium quality and exceptional reliability'
  },
  {
    id: 3,
    name: 'Volkswagen Transporter',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop',
    description: 'Iconic design with modern technology'
  },
  {
    id: 4,
    name: 'Renault Trafic',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
    description: 'Versatile and efficient for any business'
  }
];

const NewVansPage = () => {
  const navigate = useNavigate();
  const [newVans, setNewVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'New Vans for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchNewVans();
  }, []);

  const fetchNewVans = async () => {
    try {
      const result = await vanService.getVans({ condition: 'new', limit: 8 });
      setNewVans(result.data || []);
    } catch (error) {
      console.error('Error fetching new vans:', error);
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
    params.append('condition', 'new');
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
    params.append('condition', 'new');
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
    <div className="new-vans-page">
      {/* Hero Section */}
      <section className="new-vans-hero">
        <div className="new-vans-hero-background">
          <div className="new-vans-hero-overlay"></div>
          <div className="hero-container">
            <div className="new-vans-hero-text">
              <span className="hero-label">New Vans</span>
              <h1>Nothing beats brand new</h1>
            </div>
            
            {/* Search Form */}
            <form className="new-vans-search-form" onSubmit={handleSearch}>
              <div className="new-vans-search-main">
                <div className="new-vans-search-field new-vans-search-postcode">
                  <label>Postcode *</label>
                  <input
                    type="text"
                    placeholder="e.g. M11AE"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    className={error ? 'error' : ''}
                  />
                  {error && (
                    <div className="field-error-message">
                      {error}
                    </div>
                  )}
                </div>
                <div className="new-vans-search-field">
                  <label>Make</label>
                  <select 
                    value={make}
                    onChange={handleMakeChange}
                  >
                    <option value="">Any</option>
                    {VAN_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="new-vans-search-field">
                  <label>Model</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>

              <div className="new-vans-search-buttons">
                <a 
                  className="new-vans-more-options-link"
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
                <button type="submit" className="new-vans-search-btn">
                  🔍 Search new vans
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* New Vans Available */}
      <section className="new-vans-section">
        <h2>Brand New Vans Available Now</h2>
        <p className="section-subtitle">Explore our latest collection of new vans</p>
        {loading ? (
          <div className="loading-state">Loading new vans...</div>
        ) : newVans.length > 0 ? (
          <>
            <div className="vans-scroll">
              {newVans.map(van => (
                <div 
                  key={van._id} 
                  className="van-card"
                  onClick={() => navigate(`/vans/${van._id}`)}
                >
                  <div className="van-image">
                    {van.images && van.images.length > 0 && (
                      <img src={van.images[0]} alt={`${van.make} ${van.model}`} />
                    )}
                  </div>
                  <div className="van-details">
                    <h3>{van.make} {van.model}</h3>
                    <p className="van-specs">{van.year} • {van.vanType || 'Panel Van'}</p>
                    <p className="van-price">£{van.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </>
        ) : (
          <div className="featured-vans-section">
            <p className="coming-soon-text">New vans coming soon! Check out these popular models:</p>
            <div className="featured-vans-grid">
              {FEATURED_VANS.map(van => (
                <div key={van.id} className="featured-van-card">
                  <div className="featured-van-image">
                    <img src={van.image} alt={van.name} />
                  </div>
                  <div className="featured-van-details">
                    <h3>{van.name}</h3>
                    <p className="featured-van-desc">{van.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-link" onClick={() => navigate('/vans/search-results')}>
              Browse all vans →
            </button>
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Buy a New Van?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">⚡</span>
              <h3>Latest Technology</h3>
              <p>Modern safety features, fuel efficiency, and connectivity.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h3>Full Warranty</h3>
              <p>Complete manufacturer warranty coverage for peace of mind.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🔧</span>
              <h3>Zero Maintenance</h3>
              <p>No unexpected repairs - everything is brand new.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💳</span>
              <h3>Finance Options</h3>
              <p>Flexible financing plans to suit your business needs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewVansPage;
