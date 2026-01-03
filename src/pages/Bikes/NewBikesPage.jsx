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
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    maxPrice: '',
    postcode: ''
  });

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.make) params.append('make', searchFilters.make);
    if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);
    if (searchFilters.postcode) params.append('postcode', searchFilters.postcode);
    params.append('condition', 'new');
    navigate(`/bikes/search-results?${params.toString()}`);
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="new-bikes-page">
      {/* Hero Section */}
      <section className="new-bikes-hero">
        <div className="new-bikes-hero-background">
          <div className="hero-container">
            <span className="hero-label">New Bikes</span>
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
                    <option value="5000">Up to £5,000</option>
                    <option value="10000">Up to £10,000</option>
                    <option value="15000">Up to £15,000</option>
                    <option value="20000">Up to £20,000</option>
                    <option value="30000">Up to £30,000</option>
                  </select>
                </div>
                <div className="search-field">
                  <label>Make</label>
                  <select
                    value={searchFilters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                  >
                    <option value="">Any Make</option>
                    {BIKE_BRANDS.map(brand => (
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
              <button className="search-btn" onClick={handleSearch}>🔍 Search new bikes</button>
            </div>
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
