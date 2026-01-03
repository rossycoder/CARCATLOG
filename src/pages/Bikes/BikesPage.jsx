import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import './BikesPage.css';

const BikesPage = () => {
  const navigate = useNavigate();
  const [bikeCount, setBikeCount] = useState(0);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(true);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (postcode.trim()) {
      navigate(`/bikes/search-results?postcode=${encodeURIComponent(postcode)}&radius=${radius}`);
    }
  };

  return (
    <div className="bikes-page">
      {/* Hero Section */}
      <section className="bikes-hero">
        <div className="bikes-hero-background">
          <div className="bikes-hero-content">
            <span className="bikes-hero-label">Bikes</span>
            <h1 className="bikes-hero-title">Find your perfect ride</h1>
            <p className="bikes-hero-subtitle">
              {loading ? 'Loading...' : `${bikeCount.toLocaleString()} bikes available`}
            </p>

            {/* Search Form */}
            <form className="bikes-search-form" onSubmit={handleSearch}>
              <div className="bikes-search-inputs">
                <div className="bikes-search-field">
                  <label>Postcode</label>
                  <input
                    type="text"
                    placeholder="Enter postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
                <div className="bikes-search-field">
                  <label>Radius</label>
                  <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="200">National</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="bikes-search-btn">
                🔍 {loading ? 'Search bikes' : `Search ${bikeCount.toLocaleString()} bikes`}
              </button>
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
                <img src="/images/dummy/1.jpeg" alt="Partner 1" />
              </div>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/2.jpeg" alt="Partner 2" />
              </div>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/3.jpeg" alt="Partner 3" />
              </div>
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
