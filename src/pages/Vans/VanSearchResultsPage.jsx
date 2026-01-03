import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import './VanSearchResultsPage.css';

function VanSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [savedVans, setSavedVans] = useState(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [filters, setFilters] = useState({
    make: 'All',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    vanType: 'All',
    sortBy: 'distance'
  });

  useEffect(() => {
    const saved = localStorage.getItem('savedVans');
    if (saved) {
      try {
        setSavedVans(new Set(JSON.parse(saved)));
      } catch (err) {
        console.error('Error loading saved vans:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedVans', JSON.stringify(Array.from(savedVans)));
  }, [savedVans]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postcodeParam = params.get('postcode');
    const radiusParam = params.get('radius') || 25;
    const makeParam = params.get('make');
    const conditionParam = params.get('condition');

    if (postcodeParam) {
      setPostcode(postcodeParam);
      setRadius(parseInt(radiusParam) || 25);
      performSearch(postcodeParam, parseInt(radiusParam) || 25, makeParam, conditionParam);
    } else {
      loadAllVans(makeParam, conditionParam);
    }
  }, [location]);

  const performSearch = async (searchPostcode, searchRadius, make, condition) => {
    setLoading(true);
    setError('');

    try {
      const response = await vanService.searchVansByPostcode(searchPostcode, searchRadius);
      
      if (response.success && response.data) {
        let results = response.data.results || [];
        
        if (make && make !== 'Any') {
          results = results.filter(van => van.make === make);
        }
        if (condition) {
          results = results.filter(van => van.condition === condition);
        }
        
        const filteredData = {
          postcode: response.data.postcode,
          coordinates: response.data.coordinates,
          radius: response.data.radius,
          results,
          count: results.length
        };
        
        setSearchResults(filteredData);
        setFilteredResults(filteredData);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAllVans = async (make, condition) => {
    setLoading(true);
    setError('');

    try {
      const filterParams = {};
      if (make && make !== 'Any') filterParams.make = make;
      if (condition) filterParams.condition = condition;
      
      const response = await vanService.getVans(filterParams);
      const vans = response.data?.vans || response.data || [];
      const total = response.data?.pagination?.total || vans.length;
      
      const transformedData = {
        postcode: 'All UK',
        radius: 0,
        count: total,
        results: vans.map(van => ({ ...van, distance: 0 }))
      };
      
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load vans');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!searchResults) return;

    let results = [...searchResults.results];

    if (filters.make !== 'All') {
      results = results.filter(van => van.make === filters.make);
    }
    if (filters.vanType !== 'All') {
      results = results.filter(van => van.vanType === filters.vanType);
    }
    if (filters.minPrice) {
      results = results.filter(van => van.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(van => van.price <= parseFloat(filters.maxPrice));
    }
    if (filters.minYear) {
      results = results.filter(van => van.year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      results = results.filter(van => van.year <= parseInt(filters.maxYear));
    }
    if (filters.maxMileage) {
      results = results.filter(van => van.mileage <= parseInt(filters.maxMileage));
    }

    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'mileage-low':
        results.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'year-new':
        results.sort((a, b) => b.year - a.year);
        break;
      default:
        results.sort((a, b) => a.distance - b.distance);
    }

    setFilteredResults({ ...searchResults, results, count: results.length });
  }, [filters, searchResults]);

  const handleSaveVan = (vanId) => {
    setSavedVans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vanId)) {
        newSet.delete(vanId);
      } else {
        newSet.add(vanId);
      }
      return newSet;
    });
  };

  const handleVanClick = (vanId) => {
    navigate(`/vans/${vanId}`);
  };

  const getUniqueMakes = () => {
    if (!searchResults) return [];
    return [...new Set(searchResults.results.map(van => van.make))].sort();
  };

  const getUniqueVanTypes = () => {
    if (!searchResults) return [];
    return [...new Set(searchResults.results.map(van => van.vanType).filter(Boolean))].sort();
  };

  if (loading) {
    return (
      <div className="van-search-results">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{postcode ? `Searching for vans near ${postcode}...` : 'Loading vans...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="van-search-results">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Search Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/vans')} className="btn-primary">
              Back to Vans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="van-search-results">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="container-wide">
          <div className="filter-pills">
            <button 
              className={`filter-pill ${filters.make === 'All' ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, make: 'All' }))}
            >
              All
            </button>
            {getUniqueMakes().slice(0, 4).map(make => (
              <button 
                key={make}
                className={`filter-pill ${filters.make === make ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, make }))}
              >
                {make}
              </button>
            ))}
          </div>
          <button className="filter-btn" onClick={() => setShowFilterModal(true)}>
            ≡ Filter and sort
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-header">
        <div className="container-wide">
          <p className="results-count">
            <span className="count-number">{filteredResults?.count || 0}</span> vans
            {postcode && ` near ${postcode}`}
          </p>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter and Sort</h2>
              <button className="close-btn" onClick={() => setShowFilterModal(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="filter-section">
                <h3>Van Type</h3>
                <select
                  value={filters.vanType}
                  onChange={(e) => setFilters(prev => ({ ...prev, vanType: e.target.value }))}
                >
                  <option value="All">All Types</option>
                  {getUniqueVanTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <h3>Price</h3>
                <div className="filter-inputs">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="filter-section">
                <h3>Year</h3>
                <div className="filter-inputs">
                  <input
                    type="number"
                    placeholder="Min year"
                    value={filters.minYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, minYear: e.target.value }))}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max year"
                    value={filters.maxYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="filter-section">
                <h3>Maximum Mileage</h3>
                <input
                  type="number"
                  placeholder="Max mileage"
                  value={filters.maxMileage}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxMileage: e.target.value }))}
                />
              </div>

              <div className="filter-section">
                <h3>Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="distance">Distance (nearest first)</option>
                  <option value="price-low">Price (low to high)</option>
                  <option value="price-high">Price (high to low)</option>
                  <option value="mileage-low">Mileage (low to high)</option>
                  <option value="year-new">Year (newest first)</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setFilters({
                    make: 'All',
                    minPrice: '',
                    maxPrice: '',
                    minYear: '',
                    maxYear: '',
                    maxMileage: '',
                    vanType: 'All',
                    sortBy: 'distance'
                  });
                }}
              >
                Clear All
              </button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="container-wide">
        {filteredResults?.count === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🚐</div>
            <h2>No Vans Found</h2>
            <p>
              {postcode 
                ? `We couldn't find any vans within ${radius} miles of ${postcode}`
                : 'No vans match your search criteria'}
            </p>
            <button onClick={() => navigate('/vans')} className="btn-primary">
              Back to Vans
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {filteredResults?.results.map((van) => (
              <div 
                key={van._id} 
                className="van-listing-card"
                onClick={() => handleVanClick(van._id)}
              >
                <button 
                  className={`save-btn ${savedVans.has(van._id) ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveVan(van._id);
                  }}
                >
                  {savedVans.has(van._id) ? '♥' : '♡'}
                </button>
                
                <div className="van-image-wrapper">
                  <img 
                    src={van.images?.[0] || '/images/dummy/placeholder-van.jpg'} 
                    alt={`${van.make} ${van.model}`}
                  />
                </div>
                
                <div className="van-details">
                  <h3>{van.make} {van.model}</h3>
                  <p className="van-subtitle">{van.year} {van.vanType && `• ${van.vanType}`}</p>
                  
                  <div className="van-specs">
                    <span>{van.mileage?.toLocaleString() || '0'} miles</span>
                    <span>•</span>
                    <span>{van.fuelType || 'Diesel'}</span>
                  </div>
                  
                  <div className="van-price">£{van.price?.toLocaleString() || '0'}</div>
                  
                  <div className="van-location">
                    <span>📍</span>
                    <span>
                      {van.locationName || van.postcode?.split(' ')[0] || 'Location'}
                      {van.distance > 0 && ` (${van.distance.toFixed(0)} miles)`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VanSearchResultsPage;
