import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './NewVansPage.css';

const VAN_BRANDS = [
  'Ford', 'Mercedes-Benz', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Vauxhall', 'Fiat'
];

const NewVansPage = () => {
  const navigate = useNavigate();
  const [newVans, setNewVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    maxPrice: '',
    postcode: ''
  });

  const VANS_PER_VIEW = 4;

  useEffect(() => {
    document.title = 'New Vans for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchNewVans();
  }, []);

  const fetchNewVans = async () => {
    try {
      const result = await vanService.getVans({ condition: 'new', limit: 10, status: 'active' });
      const vans = result.data?.vans || result.data || [];
      // Filter only new vans (not used/old)
      const filteredVans = vans.filter(van => van.condition === 'new');
      setNewVans(filteredVans.slice(0, 10)); // Limit to 10 vans
    } catch (error) {
      console.error('Error fetching new vans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.make) params.append('make', searchFilters.make);
    if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);
    if (searchFilters.postcode) params.append('postcode', searchFilters.postcode);
    params.append('condition', 'new');
    navigate(`/vans/search-results?${params.toString()}`);
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, newVans.length - VANS_PER_VIEW);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < newVans.length - VANS_PER_VIEW;

  return (
    <div className="new-vans-page">
      {/* Hero Section */}
      <section className="new-vans-hero">
        <div className="new-vans-hero-background">
          <div className="hero-container">
            <span className="hero-label">New Vans</span>
            <h1>Nothing beats brand new</h1>
            
            <div className="search-card">
              <div className="search-fields">
                <div className="search-field">
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
                <div className="search-field">
                  <label>Make</label>
                  <select
                    value={searchFilters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                  >
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
                    placeholder="Enter postcode"
                    value={searchFilters.postcode}
                    onChange={(e) => handleFilterChange('postcode', e.target.value)}
                  />
                </div>
              </div>
              <button className="search-btn" onClick={handleSearch}>🔍 Search new vans</button>
            </div>
          </div>
        </div>
      </section>

      {/* New Vans Carousel Section */}
      <section className="new-vans-section">
        <h2>Buying? Thought about leasing?</h2>
        <p className="section-subtitle">Explore our latest collection of brand new vans</p>
        
        {loading ? (
          <div className="loading-state">Loading new vans...</div>
        ) : newVans.length > 0 ? (
          <div className="vans-carousel-container">
            {/* Left Arrow */}
            <button 
              className={`carousel-arrow carousel-arrow-left ${!canGoPrevious ? 'disabled' : ''}`}
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              ‹
            </button>

            {/* Carousel */}
            <div className="vans-carousel-wrapper">
              <div 
                className="vans-carousel"
                ref={carouselRef}
                style={{ transform: `translateX(-${currentIndex * (100 / VANS_PER_VIEW)}%)` }}
              >
                {newVans.map(van => (
                  <div 
                    key={van._id} 
                    className="van-carousel-card"
                    onClick={() => navigate(`/vans/${van._id}`)}
                  >
                    <div className="van-card-image">
                      {van.images && van.images.length > 0 ? (
                        <>
                          <span className="image-count">📷 {van.images.length}</span>
                          <img src={van.images[0]} alt={`${van.make} ${van.model}`} />
                        </>
                      ) : (
                        <div className="no-image-placeholder">
                          <span>🚐</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="van-card-pricing">
                      <div className="price-main">
                        <span className="price-label">From</span>
                        <span className="price-value">£{van.price?.toLocaleString()}</span>
                        <span className="price-term">Purchase price</span>
                      </div>
                      {van.year && (
                        <div className="delivery-info">
                          {van.year} model
                        </div>
                      )}
                    </div>
                    
                    <div className="van-card-details">
                      <h3>{van.make} {van.model}</h3>
                      <p className="van-specs-text">
                        {van.vanType || 'Van'} • {van.fuelType || 'Diesel'} • {van.transmission || 'Manual'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button 
              className={`carousel-arrow carousel-arrow-right ${!canGoNext ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={!canGoNext}
            >
              ›
            </button>
          </div>
        ) : (
          <div className="no-results">
            <p>No new vans available at the moment. Check back soon!</p>
          </div>
        )}

        {newVans.length > 0 && (
          <button className="view-all-link" onClick={() => navigate('/vans/search-results?condition=new')}>
            View all new vans →
          </button>
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
              <p>Cutting-edge safety features, fuel efficiency, and connectivity.</p>
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
              <p>Flexible financing plans to suit your business budget.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewVansPage;
