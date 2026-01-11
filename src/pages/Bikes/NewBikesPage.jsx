import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import './NewBikesPage.css';

const BIKE_BRANDS = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Triumph', 'KTM'
];

const FEATURED_BIKES = [
  {
    id: 1,
    name: 'Honda CBR650R',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop',
   
    description: 'Sport performance meets everyday usability'
  },
  {
    id: 2,
    name: 'Yamaha MT-07',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop',
   
    description: 'The perfect balance of power and agility'
  },
  {
    id: 3,
    name: 'Kawasaki Ninja 400',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop',
   
    description: 'Lightweight sportbike for all skill levels'
  },
  {
    id: 4,
    name: 'BMW R 1250 GS',
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=300&fit=crop',
    
    description: 'The ultimate adventure touring machine'
  }
];

const NewBikesPage = () => {
  const navigate = useNavigate();
  const [newBikes, setNewBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'New Bikes for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchNewBikes();
  }, []);

  const fetchNewBikes = async () => {
    try {
      const result = await bikeService.getBikes({ condition: 'new', limit: 8 });
      setNewBikes(result.data || []);
    } catch (error) {
      console.error('Error fetching new bikes:', error);
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
    params.append('condition', 'new');
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
    <div className="new-bikes-page">
      {/* Hero Section */}
      <section className="new-bikes-hero">
        <div className="new-bikes-hero-background">
          <div className="new-bikes-hero-overlay"></div>
          <div className="hero-container">
            <div className="new-bikes-hero-text">
              <span className="hero-label">New Bikes</span>
              <h1>Nothing beats brand new</h1>
            </div>
            
            {/* Search Form */}
            <form className="new-bikes-search-form" onSubmit={handleSearch}>
              <div className="new-bikes-search-main">
                <div className="new-bikes-search-field new-bikes-search-postcode">
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
                <div className="new-bikes-search-field">
                  <label>Make</label>
                  <select 
                    value={make}
                    onChange={handleMakeChange}
                  >
                    <option value="">Any</option>
                    {BIKE_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="new-bikes-search-field">
                  <label>Model</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Any</option>
                  </select>
                </div>
              </div>

              <div className="new-bikes-search-buttons">
                <a 
                  className="new-bikes-more-options-link"
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
                <button type="submit" className="new-bikes-search-btn">
                  🔍 Search new bikes
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* New Bikes Available */}
      <section className="new-bikes-section">
        <h2>Brand New Bikes Available Now</h2>
        <p className="section-subtitle">Explore our latest collection of new motorcycles</p>
        {loading ? (
          <div className="loading-state">Loading new bikes...</div>
        ) : newBikes.length > 0 ? (
          <>
            <div className="bikes-scroll">
              {newBikes.map(bike => (
                <div 
                  key={bike._id} 
                  className="bike-card"
                  onClick={() => navigate(`/bikes/${bike._id}`)}
                >
                  <div className="bike-image">
                    {bike.images && bike.images.length > 0 && (
                      <img src={bike.images[0]} alt={`${bike.make} ${bike.model}`} />
                    )}
                  </div>
                  <div className="bike-details">
                    <h3>{bike.make} {bike.model}</h3>
                    <p className="bike-specs">{bike.year} • {bike.engineCC || 'N/A'}cc</p>
                    <p className="bike-price">£{bike.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </>
        ) : (
          <div className="featured-bikes-section">
            <p className="coming-soon-text">New bikes coming soon! Check out these popular models:</p>
            <div className="featured-bikes-grid">
              {FEATURED_BIKES.map(bike => (
                <div key={bike.id} className="featured-bike-card">
                  <div className="featured-bike-image">
                    <img src={bike.image} alt={bike.name} />
                  </div>
                  <div className="featured-bike-details">
                    <h3>{bike.name}</h3>
                    <p className="featured-bike-desc">{bike.description}</p>
                    <p className="featured-bike-price">From {bike.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-link" onClick={() => navigate('/bikes/search-results')}>
              Browse all bikes →
            </button>
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Buy a New Bike?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">⚡</span>
              <h3>Latest Technology</h3>
              <p>Cutting-edge safety features, electronics, and performance.</p>
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
              <p>Flexible financing plans to suit your budget.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewBikesPage;
