import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import './UsedBikesPage.css';

// Popular bike brands
const BIKE_BRANDS = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Ducati',
  'BMW',
  'Harley-Davidson',
  'Triumph',
  'KTM',
  'Aprilia',
  'Royal Enfield',
  'Indian'
];

const UsedBikesPage = () => {
  const navigate = useNavigate();
  const [bikeCount, setBikeCount] = useState(0);
  const [featuredBikes, setFeaturedBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [selectedMake, setSelectedMake] = useState('');

  useEffect(() => {
    document.title = 'Used Bikes for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [countResult, bikesResult] = await Promise.all([
        bikeService.getBikeCount({ condition: 'used' }),
        bikeService.getBikes({ condition: 'used', limit: 8 })
      ]);
      setBikeCount(countResult);
      setFeaturedBikes(bikesResult.data || []);
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (postcode) params.append('postcode', postcode);
    if (radius) params.append('radius', radius);
    if (selectedMake) params.append('make', selectedMake);
    params.append('condition', 'used');
    navigate(`/bikes/search-results?${params.toString()}`);
  };

  return (
    <div className="used-bikes-page">
      {/* Hero Section */}
      <section className="used-bikes-hero">
        <div className="used-bikes-hero-background">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">Used Bikes</span>
              <h1>Find your perfect used motorcycle</h1>
              <p>{loading ? 'Loading...' : `${bikeCount.toLocaleString()} used bikes available`}</p>
            </div>

            <form className="search-card" onSubmit={handleSearch}>
              <div className="search-fields">
                <div className="search-field">
                  <label>Make</label>
                  <select value={selectedMake} onChange={(e) => setSelectedMake(e.target.value)}>
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
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
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
              </div>
              <button type="submit" className="search-btn">🔍 Search used bikes</button>
            </form>
          </div>
        </div>
      </section>


      {/* Featured Bikes */}
      <section className="featured-bikes">
        <div className="container">
          <h2>Featured Used Bikes</h2>
          {loading ? (
            <div className="loading">Loading bikes...</div>
          ) : featuredBikes.length > 0 ? (
            <>
              <div className="bikes-grid">
                {featuredBikes.map(bike => (
                  <div
                    key={bike._id}
                    className="bike-card"
                    onClick={() => navigate(`/bikes/${bike._id}`)}
                  >
                    <div className="bike-image">
                      {bike.images && bike.images.length > 0 ? (
                        <img src={bike.images[0]} alt={`${bike.make} ${bike.model}`} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="bike-details">
                      <h3>{bike.make} {bike.model}</h3>
                      <p className="bike-specs">
                        {bike.year} • {bike.mileage?.toLocaleString()} miles
                      </p>
                      <p className="bike-price">£{bike.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="view-all-btn"
                onClick={() => navigate('/bikes/search-results?condition=used')}
              >
                View all used bikes →
              </button>
            </>
          ) : (
            <p className="no-bikes">No used bikes available at the moment.</p>
          )}
        </div>
      </section>

      {/* Why Buy Used */}
      <section className="why-used">
        <div className="container">
          <h2>Why buy a used bike?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">💰</span>
              <h3>Better Value</h3>
              <p>Save thousands compared to buying new, with minimal depreciation.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🔍</span>
              <h3>More Choice</h3>
              <p>Access to a wider range of models, including discontinued classics.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">✅</span>
              <h3>Proven Reliability</h3>
              <p>Check service history and owner reviews before you buy.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h3>Lower Insurance</h3>
              <p>Used bikes typically cost less to insure than brand new models.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsedBikesPage;
