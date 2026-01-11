import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './UsedVansPage.css';

// Popular van brands
const VAN_BRANDS = [
  'Ford',
  'Mercedes-Benz',
  'Volkswagen',
  'Renault',
  'Peugeot',
  'Citroen',
  'Vauxhall',
  'Fiat',
  'Nissan',
  'Toyota',
  'Iveco',
  'MAN'
];

const UsedVansPage = () => {
  const navigate = useNavigate();
  const [vanCount, setVanCount] = useState(0);
  const [featuredVans, setFeaturedVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [selectedMake, setSelectedMake] = useState('');
  const [postcodeError, setPostcodeError] = useState('');

  useEffect(() => {
    document.title = 'Used Vans for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [countResult, vansResult] = await Promise.all([
        vanService.getVanCount({ condition: 'used' }),
        vanService.getVans({ condition: 'used', limit: 8 })
      ]);
      setVanCount(countResult);
      setFeaturedVans(vansResult.data || []);
    } catch (error) {
      console.error('Error fetching vans:', error);
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
    
    const trimmedPostcode = postcode.trim();
    
    // Validate postcode is entered
    if (!trimmedPostcode) {
      setPostcodeError('Please enter a postcode to search');
      return;
    }
    
    // Validate postcode format
    if (!validatePostcode(trimmedPostcode)) {
      setPostcodeError('Please enter a valid UK postcode (e.g. M1 1AE)');
      return;
    }
    
    // Clear error
    setPostcodeError('');
    
    const params = new URLSearchParams();
    if (postcode) params.append('postcode', trimmedPostcode);
    if (radius) params.append('radius', radius);
    if (selectedMake) params.append('make', selectedMake);
    params.append('condition', 'used');
    navigate(`/vans/search-results?${params.toString()}`);
  };

  const handleMoreOptions = () => {
    const trimmedPostcode = postcode.trim();
    
    // Validate postcode for more options too
    if (!trimmedPostcode) {
      setPostcodeError('Please enter a postcode first');
      return;
    }
    
    // Validate postcode format
    if (!validatePostcode(trimmedPostcode)) {
      setPostcodeError('Please enter a valid UK postcode (e.g. M1 1AE)');
      return;
    }
    
    // Clear error
    setPostcodeError('');
    
    const params = new URLSearchParams();
    if (postcode) params.append('postcode', trimmedPostcode);
    if (radius) params.append('radius', radius);
    if (selectedMake) params.append('make', selectedMake);
    params.append('condition', 'used');
    navigate(`/vans/search-results?${params.toString()}`);
  };

  return (
    <div className="used-vans-page">
      {/* Hero Section */}
      <section className="used-vans-hero">
        <div className="used-vans-hero-background">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">Used Vans</span>
              <h1>Find your perfect used van</h1>
              <p>{loading ? 'Loading...' : `${vanCount.toLocaleString()} used vans available`}</p>
            </div>

            <form className="search-card" onSubmit={handleSearch}>
              <div className="search-fields">
                <div className="search-field">
                  <label>Make</label>
                  <select value={selectedMake} onChange={(e) => setSelectedMake(e.target.value)}>
                    <option value="">Any Make</option>
                    {VAN_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <label>Postcode</label>
                  <input
                    type="text"
                    placeholder="e.g. SW1A 1AA"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      if (postcodeError) setPostcodeError('');
                    }}
                    className={postcodeError ? 'input-error' : ''}
                  />
                  {postcodeError && (
                    <div className="field-error-message">{postcodeError}</div>
                  )}
                </div>
                <div className="search-field">
                  <label>Radius</label>
                  <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                  </select>
                </div>
                <div className="search-actions">
                  <button 
                    type="button"
                    className="more-options-link"
                    onClick={handleMoreOptions}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    More options
                  </button>
                  <button type="submit" className="search-btn">🔍 Search used vans</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>


      {/* Featured Vans */}
      <section className="featured-vans">
        <div className="container">
          <h2>Featured Used Vans</h2>
          {loading ? (
            <div className="loading">Loading vans...</div>
          ) : featuredVans.length > 0 ? (
            <>
              <div className="vans-grid">
                {featuredVans.map(van => (
                  <div
                    key={van._id}
                    className="van-card"
                    onClick={() => navigate(`/vans/${van._id}`)}
                  >
                    <div className="van-image">
                      {van.images && van.images.length > 0 ? (
                        <img src={van.images[0]} alt={`${van.make} ${van.model}`} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="van-details">
                      <h3>{van.make} {van.model}</h3>
                      <p className="van-specs">
                        {van.year} • {van.mileage?.toLocaleString()} miles
                      </p>
                      <p className="van-price">£{van.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="view-all-btn"
                onClick={() => navigate('/vans/search-results?condition=used')}
              >
                View all used vans →
              </button>
            </>
          ) : (
            <p className="no-vans">No used vans available at the moment.</p>
          )}
        </div>
      </section>

      {/* Why Buy Used */}
      <section className="why-used">
        <div className="container">
          <h2>Why buy a used van?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">💰</span>
              <h3>Better Value</h3>
              <p>Save thousands compared to buying new, with minimal depreciation.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🔍</span>
              <h3>More Choice</h3>
              <p>Access to a wider range of models and configurations.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">✅</span>
              <h3>Proven Reliability</h3>
              <p>Check service history and owner reviews before you buy.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h3>Lower Insurance</h3>
              <p>Used vans typically cost less to insure than brand new models.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsedVansPage;
