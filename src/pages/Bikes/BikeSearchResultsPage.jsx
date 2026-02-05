import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bikeService } from '../../services/bikeService';
import { extractTownName } from '../../utils/vehicleFormatter';
import BikeFilterSidebar from '../../components/FilterSidebar/BikeFilterSidebar';
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
  const [searchSaved, setSearchSaved] = useState(false);
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

  const [activeFilter, setActiveFilter] = useState('All');

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
    
    // Check if we have any filter parameters
    const hasFilters = Array.from(params.keys()).length > 0;
    
    console.log('BikeSearchResultsPage mounted with params:', Object.fromEntries(params));

    if (hasFilters) {
      // Perform filtered search
      performFilteredSearch(params);
    } else {
      // Load all bikes if no filters provided
      loadAllBikes();
      // Auto-open filter modal if no search params
      setTimeout(() => setShowFilterModal(true), 300);
    }
  }, [location.search]);

  const performFilteredSearch = async (params) => {
    setLoading(true);
    setError('');

    try {
      // Convert URLSearchParams to object
      const filterParams = {};
      for (const [key, value] of params.entries()) {
        filterParams[key] = value;
      }
      
      console.log('[BikeSearchResultsPage] Performing filtered search with:', filterParams);
      const response = await bikeService.searchBikes(filterParams);
      
      console.log('[BikeSearchResultsPage] Search response:', response);
      
      if (response.success) {
        const bikes = response.bikes || [];
        const total = response.total || 0;
        
        console.log('[BikeSearchResultsPage] Found bikes:', total);
        
        // Transform to match expected format
        const transformedData = {
          postcode: filterParams.postcode || 'All UK',
          radius: filterParams.distance || 0,
          count: total,
          results: bikes,
          showingAllBikes: false
        };
        
        console.log('[BikeSearchResultsPage] Setting filtered results:', transformedData);
        setSearchResults(transformedData);
        setFilteredResults(transformedData);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('[BikeSearchResultsPage] Search error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

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

  const loadAllBikes = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await bikeService.getBikes({});
      
      const bikes = response.data?.bikes || response.data || [];
      const total = response.data?.pagination?.total || bikes.length;
      
      const transformedData = {
        postcode: 'All UK',
        radius: 0,
        count: total,
        results: bikes.map(bike => ({ ...bike, distance: 0 })),
        showingAllBikes: false
      };
      
      console.log('Loaded bikes:', total);
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load bikes');
      console.error('Error loading bikes:', err);
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

  const handleFilterPillClick = (filterType) => {
    setActiveFilter(filterType);
    
    if (filterType === 'All') {
      setFilters({
        make: 'All',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        maxMileage: '',
        sortBy: 'distance'
      });
    }
  };

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

  const handleSaveSearch = () => {
    setSearchSaved(!searchSaved);
    if (!searchSaved) {
      const savedSearches = JSON.parse(localStorage.getItem('savedBikeSearches') || '[]');
      savedSearches.push({
        postcode,
        radius,
        filters,
        date: new Date().toISOString()
      });
      localStorage.setItem('savedBikeSearches', JSON.stringify(savedSearches));
      alert('Search saved successfully!');
    } else {
      alert('Search removed from saved searches');
    }
  };

  const handleNewSearch = () => {
    navigate('/bikes');
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    performSearch(postcode, newRadius);
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
      <div className="search-results-page">
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
      <div className="search-results-page">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Search Error</h2>
            <p>{error}</p>
            <a href="/bikes" className="back-link">
              ← Back to Bikes
            </a>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="search-results-page">
      {/* Top Filter Bar - Autotrader Style */}
      <div className="top-filter-bar">
        <div className="container-wide">
          <div className="filter-pills">
            <button 
              className={`filter-pill ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => handleFilterPillClick('All')}
            >
              All
            </button>
            {getUniqueMakes().slice(0, 3).map(make => (
              <button 
                key={make}
                className={`filter-pill ${activeFilter === make ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(make);
                  setFilters(prev => ({ ...prev, make }));
                }}
              >
                {make}
              </button>
            ))}
            <button 
              className={`filter-pill ${activeFilter === 'Price' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('Price');
                setShowFilterModal(true);
              }}
            >
              Price
            </button>
            <button 
              className={`filter-pill ${activeFilter === 'Year' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('Year');
                setShowFilterModal(true);
              }}
            >
              Year
            </button>
            <button 
              className={`filter-pill ${activeFilter === 'Mileage' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('Mileage');
                setShowFilterModal(true);
              }}
            >
              Mileage
            </button>
          </div>
          <div className="filter-actions">
            <button 
              className="filter-sort-btn"
              onClick={() => setShowFilterModal(true)}
            >
             Filter and Sort
            </button>
            <button 
              className={`save-search-btn ${searchSaved ? 'saved' : ''}`}
              onClick={handleSaveSearch}
            >
              Save search {searchSaved ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-header">
        <div className="container-wide">
          <p className="results-count">
            <span className="count-number">{filteredResults?.count || 0}</span> results
            {searchResults?.showingAllBikes ? (
              <span className="fallback-notice"> - Showing all available bikes in our database</span>
            ) : (
              postcode && ` near ${postcode}`
            )} ⓘ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide">
        {/* Results Grid */}
        {searchResults?.count === 0 ? (
          <div className="no-results-state">
            <div className="no-results-icon">🏍️</div>
            <h2>No Bikes Found</h2>
            <p>
              {postcode 
                ? `We couldn't find any bikes within ${radius} miles of ${postcode}`
                : 'No bikes match your search criteria'}
            </p>
            <div className="no-results-actions">
              {postcode && (
                <button 
                  onClick={() => handleRadiusChange(radius + 25)} 
                  className="btn-primary"
                >
                  Increase Radius to {radius + 25} miles
                </button>
              )}
              <button onClick={handleNewSearch} className="btn-secondary">
                {postcode ? 'Try Different Postcode' : 'Back to Bikes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-grid-autotrader">
            {filteredResults?.results.map((bike) => (
              <div 
                key={bike._id} 
                className="car-listing-card"
                onClick={() => handleBikeClick(bike._id)}
              >
                {/* Save Button */}
                <button 
                  className={`save-btn ${savedBikes.has(bike._id) ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveBike(bike._id);
                  }}
                >
                  {savedBikes.has(bike._id) ? '♥' : '♡'}
                </button>
                
                {/* Bike Image */}
                <div className="car-image-wrapper">
                  <img 
                    src={bike.images?.[0] || '/images/dummy/placeholder-bike.jpg'} 
                    alt={`${bike.make} ${bike.model}`}
                    className="car-image"
                  />
                  <div className="image-counter">
                    {bike.images?.length || 1}/{bike.images?.length || 1}
                  </div>
                </div>
                
                {/* Bike Details */}
                <div className="car-details">
                  <h3 className="car-name">{bike.make} {bike.model}</h3>
                  <p className="car-subtitle">
                    {bike.year} {bike.registrationNumber || 'REPLICA'}
                  </p>
                  
                  <div className="car-specs">
                    <span className="spec">{bike.mileage?.toLocaleString() || '0'} miles</span>
                    <span className="spec-dot">•</span>
                    <span className="spec">{bike.fuelType || 'Petrol'}</span>
                  </div>
                  
                  <div className="car-price">
                    £{bike.price?.toLocaleString() || '0'}
                  </div>
                  
                  <div className="car-location">
                    <span className="location-icon">📍</span>
                    <span>
                      {extractTownName(bike.locationName) || 'Location not available'}
                      {bike.distance > 0 && ` • ${(bike.distance || 0).toFixed(0)} miles away`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BikeFilterSidebar 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </div>
  );
}

export default BikeSearchResultsPage;
