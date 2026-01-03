import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './VansPage.css';

const VansPage = () => {
  const navigate = useNavigate();
  const [vanCount, setVanCount] = useState(0);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(true);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (postcode.trim()) {
      navigate(`/vans/search-results?postcode=${encodeURIComponent(postcode)}&radius=${radius}`);
    }
  };

  return (
    <div className="vans-page">
      {/* Hero Section */}
      <section className="vans-hero">
        <div className="vans-hero-background">
          <div className="vans-hero-content">
            <span className="vans-hero-label">Vans</span>
            <h1 className="vans-hero-title">Find your perfect van</h1>
            <p className="vans-hero-subtitle">
              {loading ? 'Loading...' : `${vanCount.toLocaleString()} vans available`}
            </p>

            {/* Search Form */}
            <form className="vans-search-form" onSubmit={handleSearch}>
              <div className="vans-search-inputs">
                <div className="vans-search-field">
                  <label>Postcode</label>
                  <input
                    type="text"
                    placeholder="Enter postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
                <div className="vans-search-field">
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
              <button type="submit" className="vans-search-btn">
                🔍 Search vans
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="vans-quick-links">
        <div className="container">
          <div className="quick-links-grid">
            <div className="quick-link-card" onClick={() => navigate('/vans/used-vans')}>
              <span className="quick-link-icon">🚐</span>
              <h3>Used Vans</h3>
              <p>Browse pre-owned vans</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/vans/new-vans')}>
              <span className="quick-link-icon">✨</span>
              <h3>New Vans</h3>
              <p>Explore brand new models</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/vans/sell-your-van')}>
              <span className="quick-link-icon">💰</span>
              <h3>Sell Your Van</h3>
              <p>List your van for sale</p>
            </div>
            <div className="quick-link-card" onClick={() => navigate('/vans/valuation')}>
              <span className="quick-link-icon">📊</span>
              <h3>Van Valuation</h3>
              <p>Get your van valued</p>
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

      {/* Why Choose Us */}
      <section className="vans-benefits">
        <div className="container">
          <h2>Why buy a van with us?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">✅</span>
              <h3>Verified Sellers</h3>
              <p>All our dealers are verified and trusted</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📋</span>
              <h3>Full History</h3>
              <p>Complete vehicle history checks available</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💳</span>
              <h3>Finance Options</h3>
              <p>Flexible finance available on most vans</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h3>Buyer Protection</h3>
              <p>Peace of mind with our buyer guarantee</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VansPage;
