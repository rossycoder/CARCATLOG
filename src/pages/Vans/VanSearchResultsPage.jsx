import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { vanService } from '../../services/vanService';
import VanFilterSidebar from '../../components/FilterSidebar/VanFilterSidebar';
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
  const [searchSaved, setSearchSaved] = useState(false);
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

  const [activeFilter, setActiveFilter] = useState('All');

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
    
    // Check if we have any filter parameters
    const hasFilters = Array.from(params.keys()).length > 0;
    
    console.log('VanSearchResultsPage mounted with params:', Object.fromEntries(params));

    if (hasFilters) {
      // Perform filtered search
      performFilteredSearch(params);
    } else {
      // Load all vans if no filters provided
      loadAllVans();
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
      
      console.log('[VanSearchResultsPage] Performing filtered search with:', filterParams);
      const response = await vanService.searchVans(filterParams);
      
      console.log('[VanSearchResultsPage] Search response:', response);
      
      if (response.success) {
        const vans = response.vans || [];
        const total = response.total || 0;
        
        console.log('[VanSearchResultsPage] Found vans:', total);
        
        // Transform to match expected format
        const transformedData = {
          postcode: filterParams.postcode || 'All UK',
          radius: filterParams.distance || 0,
          count: total,
          results: vans,
          showingAllVans: false
        };
        
        console.log('[VanSearchResultsPage] Setting filtered results:', transformedData);
        setSearchResults(transformedData);
        setFilteredResults(transformedData);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('[VanSearchResultsPage] Search error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

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

  const loadAllVans = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await vanService.getVans({});
      
      const vans = response.data?.vans || response.data || [];
      const total = response.data?.pagination?.total || vans.length;
      
      const transformedData = {
        postcode: 'All UK',
        radius: 0,
        count: total,
        results: vans.map(van => ({ ...van, distance: 0 })),
        showingAllVans: false
      };
      
      console.log('Loaded vans:', total);
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load vans');
      console.error('Error loading vans:', err);
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
        vanType: 'All',
        sortBy: 'distance'
      });
    }
  };

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

  const handleSaveSearch = () => {
    setSearchSaved(!searchSaved);
    if (!searchSaved) {
      const savedSearches = JSON.parse(localStorage.getItem('savedVanSearches') || '[]');
      savedSearches.push({
        postcode,
        radius,
        filters,
        date: new Date().toISOString()
      });
      localStorage.setItem('savedVanSearches', JSON.stringify(savedSearches));
      alert('Search saved successfully!');
    } else {
      alert('Search removed from saved searches');
    }
  };

  const handleNewSearch = () => {
    navigate('/vans');
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    performSearch(postcode, newRadius);
  };

  const handleVanClick = (vanId) => {
    navigate(`/vans/${vanId}`);
  };

  const getUniqueMakes = () => {
    if (!searchResults) return [];
    return [...new Set(searchResults.results.map(van => van.make))].sort();
  };

  if (loading) {
    return (
      <div className="search-results-page">
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
      <div className="search-results-page">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Search Error</h2>
            <p>{error}</p>
            <a href="/vans" className="back-link">
              ← Back to Vans
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
            {searchResults?.showingAllVans ? (
              <span className="fallback-notice"> - Showing all available vans in our database</span>
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
            <div className="no-results-icon">🚐</div>
            <h2>No Vans Found</h2>
            <p>
              {postcode 
                ? `We couldn't find any vans within ${radius} miles of ${postcode}`
                : 'No vans match your search criteria'}
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
                {postcode ? 'Try Different Postcode' : 'Back to Vans'}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-grid-autotrader">
            {filteredResults?.results.map((van) => (
              <div 
                key={van._id} 
                className="car-listing-card"
                onClick={() => handleVanClick(van._id)}
              >
                {/* Save Button */}
                <button 
                  className={`save-btn ${savedVans.has(van._id) ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveVan(van._id);
                  }}
                >
                  {savedVans.has(van._id) ? '♥' : '♡'}
                </button>
                
                {/* Van Image */}
                <div className="car-image-wrapper">
                  <img 
                    src={van.images?.[0] || '/images/dummy/placeholder-van.jpg'} 
                    alt={`${van.make} ${van.model}`}
                    className="car-image"
                  />
                  <div className="image-counter">
                    {van.images?.length || 1}/{van.images?.length || 1}
                  </div>
                </div>
                
                {/* Van Details */}
                <div className="car-details">
                  <h3 className="car-name">{van.make} {van.model}</h3>
                  <p className="car-subtitle">
                    {van.year} {van.registrationNumber || 'REPLICA'}
                  </p>
                  
                  <div className="car-specs">
                    <span className="spec">{van.mileage?.toLocaleString() || '0'} miles</span>
                    <span className="spec-dot">•</span>
                    <span className="spec">{van.fuelType || 'Diesel'}</span>
                    {van.vanType && (
                      <>
                        <span className="spec-dot">•</span>
                        <span className="spec">{van.vanType}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="car-price">
                    £{van.price?.toLocaleString() || '0'}
                  </div>
                  
                  <div className="car-location">
                    <span className="location-icon">📍</span>
                    <span>
                      {van.locationName || van.postcode?.split(' ')[0] || 'Location'}
                      {van.distance > 0 && ` (${(van.distance || 0).toFixed(0)} miles)`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <VanFilterSidebar 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </div>
  );
}

export default VanSearchResultsPage;
