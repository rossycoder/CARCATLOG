import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import './BikeSearchResultsPage.css';

function BikeSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [savedBikes, setSavedBikes] = useState(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [filters, setFilters] = useState({
    make: 'All',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    sortBy: 'distance'
  });

  useEffect(() => {
    const saved = localStorage.getItem('savedBikes');
    if (saved) {
      try {
        setSavedBikes(new Set(JSON.parse(saved)));
      } catch (err) {
        console.error('Error loading saved bikes:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedBikes', JSON.stringify(Array.from(savedBikes)));
  }, [savedBikes]);

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
      loadAllBikes(makeParam, conditionParam);
    }
  }, [location]);

  const performSearch = async (searchPostcode, searchRadius, make, condition) => {
    setLoading(true);
    setError('');

    try {
      const response = await bikeService.searchBikesByPostcode(searchPostcode, searchRadius);
      
      if (response.success && response.data) {
        let results = response.data.results || [];
        
        if (make && make !== 'Any') {
          results = results.filter(bike => bike.make === make);
        }
        if (condition) {
          results = results.filter(bike => bike.condition === condition);
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

  const loadAllBikes = async (make, condition) => {
    setLoading(true);
    setError('');

    try {
      const filterParams = {};
      if (make && make !== 'Any') filterParams.make = make;
      if (condition) filterParams.condition = condition;
      
      const response = await bikeService.getBikes(filterParams);
      const bikes = response.data || [];
      const total = response.pagination?.total || bikes.length;
      
      const transformedData = {
        postcode: 'All UK',
        radius: 0,
        count: total,
        results: bikes.map(bike => ({ ...bike, distance: 0 }))
      };
      
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load bikes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchResults) return;

    let results = [...searchResults.results];

    if (filters.make !== 'All') {
      results = results.filter(bike => bike.make === filters.make);
    }
    if (filters.minPrice) {
      results = results.filter(bike => bike.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(bike => bike.price <= parseFloat(filters.maxPrice));
    }
    if (filters.minYear) {
      results = results.filter(bike => bike.year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      results = results.filter(bike => bike.year <= parseInt(filters.maxYear));
    }
    if (filters.maxMileage) {
      results = results.filter(bike => bike.mileage <= parseInt(filters.maxMileage));
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

  const handleSaveBike = (bikeId) => {
    setSavedBikes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bikeId)) {
        newSet.delete(bikeId);
      } else {
        newSet.add(bikeId);
      }
      return newSet;
    });
  };

  const handleBikeClick = (bikeId) => {
    navigate(`/bikes/${bikeId}`);
  };

  const getUniqueMakes = () => {
    if (!searchResults) return [];
    return [...new Set(searchResults.results.map(bike => bike.make))].sort();
  };

  if (loading) {
    return (
      <div className="bike-search-results">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{postcode ? `Searching for bikes near ${postcode}...` : 'Loading bikes...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bike-search-results">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Search Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/bikes')} className="btn-primary">
              Back to Bikes
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="bike-search-results">
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
            <span className="count-number">{filteredResults?.count || 0}</span> bikes
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
            <div className="no-results-icon">🏍️</div>
            <h2>No Bikes Found</h2>
            <p>
              {postcode 
                ? `We couldn't find any bikes within ${radius} miles of ${postcode}`
                : 'No bikes match your search criteria'}
            </p>
            <button onClick={() => navigate('/bikes')} className="btn-primary">
              Back to Bikes
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {filteredResults?.results.map((bike) => (
              <div 
                key={bike._id} 
                className="bike-listing-card"
                onClick={() => handleBikeClick(bike._id)}
              >
                <button 
                  className={`save-btn ${savedBikes.has(bike._id) ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveBike(bike._id);
                  }}
                >
                  {savedBikes.has(bike._id) ? '♥' : '♡'}
                </button>
                
                <div className="bike-image-wrapper">
                  <img 
                    src={bike.images?.[0] || '/images/dummy/placeholder-bike.jpg'} 
                    alt={`${bike.make} ${bike.model}`}
                  />
                </div>
                
                <div className="bike-details">
                  <h3>{bike.make} {bike.model}</h3>
                  <p className="bike-subtitle">{bike.year}</p>
                  
                  <div className="bike-specs">
                    <span>{bike.mileage?.toLocaleString() || '0'} miles</span>
                    <span>•</span>
                    <span>{bike.fuelType || 'Petrol'}</span>
                  </div>
                  
                  <div className="bike-price">£{bike.price?.toLocaleString() || '0'}</div>
                  
                  <div className="bike-location">
                    <span>📍</span>
                    <span>
                      {bike.locationName || bike.postcode?.split(' ')[0] || 'Location'}
                      {bike.distance > 0 && ` (${bike.distance.toFixed(0)} miles)`}
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

export default BikeSearchResultsPage;
