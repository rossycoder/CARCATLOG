import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import './SearchResultsPage.css';

function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [savedCars, setSavedCars] = useState(new Set());
  const [searchSaved, setSearchSaved] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [filters, setFilters] = useState({
    make: 'All',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    transmission: 'All',
    fuelType: 'All',
    sortBy: 'distance'
  });

  const [activeFilter, setActiveFilter] = useState('All');

  // Load saved cars from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCars');
    if (saved) {
      try {
        setSavedCars(new Set(JSON.parse(saved)));
      } catch (err) {
        console.error('Error loading saved cars:', err);
      }
    }
  }, []);

  // Persist saved cars to localStorage whenever they change
  useEffect(() => {
    // Store both IDs and full car data
    localStorage.setItem('savedCars', JSON.stringify(Array.from(savedCars)));
    
    // Also store full car data for quick access
    if (filteredResults && filteredResults.results) {
      const savedCarsData = filteredResults.results.filter(car => savedCars.has(car._id));
      localStorage.setItem('savedCarsData', JSON.stringify(savedCarsData));
    }
  }, [savedCars, filteredResults]);

  useEffect(() => {
    // Get search parameters from URL or location state
    const params = new URLSearchParams(location.search);
    const postcodeParam = params.get('postcode') || location.state?.postcode;
    const radiusParam = params.get('radius') || location.state?.radius || 25;
    const makeParam = params.get('make') || location.state?.make;
    const modelParam = params.get('model') || location.state?.model;
    const openFilterParam = params.get('openFilter'); // Check if filter should auto-open

    console.log('SearchResultsPage mounted with params:', {
      postcodeParam,
      radiusParam,
      makeParam,
      modelParam,
      openFilterParam,
      urlSearch: location.search,
      locationState: location.state
    });

    // Auto-open filter if explicitly requested via URL parameter
    if (openFilterParam === 'true') {
      console.log('Auto-opening filter modal due to openFilter=true parameter');
      setShowFilterModal(true);
    }

    if (postcodeParam) {
      setPostcode(postcodeParam);
      setRadius(parseInt(radiusParam) || 25);
      performSearch(postcodeParam, parseInt(radiusParam) || 25, makeParam, modelParam);
    } else {
      // Load all cars if no postcode provided
      loadAllCars(makeParam, modelParam);
    }
  }, [location]);

  const performSearch = async (searchPostcode, searchRadius, make, model) => {
    setLoading(true);
    setError('');

    try {
      console.log('Performing search with:', { searchPostcode, searchRadius, make, model });
      const response = await carService.searchCarsByPostcode(searchPostcode, searchRadius);
      
      console.log('Full search response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      if (response.success && response.data) {
        let results = response.data.results || [];
        console.log('Results count before filtering:', results.length);
        
        // Apply make/model filters if provided
        if (make && make !== 'Any') {
          results = results.filter(car => car.make === make);
          console.log('Results after make filter:', results.length);
        }
        if (model && model !== 'Any') {
          results = results.filter(car => car.model === model);
          console.log('Results after model filter:', results.length);
        }
        
        // If no results found, load all cars from database
        if (results.length === 0) {
          console.log('No results in radius, loading all cars from database');
          await loadAllCarsAsFallback(make, model, searchPostcode, searchRadius);
          return;
        }
        
        const filteredData = {
          postcode: response.data.postcode,
          coordinates: response.data.coordinates,
          radius: response.data.radius,
          results,
          count: results.length
        };
        
        console.log('Setting search results:', filteredData);
        setSearchResults(filteredData);
        setFilteredResults(filteredData);
      } else {
        console.log('Response not successful:', response);
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCars = async (make, model) => {
    setLoading(true);
    setError('');

    try {
      const filterParams = {};
      if (make && make !== 'Any') filterParams.make = make;
      if (model && model !== 'Any') filterParams.model = model;
      
      const response = await carService.getCars(filterParams);
      
      // Backend returns: { success: true, data: [...], pagination: { total: X } }
      const cars = response.data || [];
      const total = response.pagination?.total || cars.length;
      
      // Transform to match search results format
      const transformedData = {
        postcode: 'All UK',
        radius: 0,
        count: total,
        results: cars.map(car => ({
          ...car,
          distance: 0 // No distance for "all cars" view
        })),
        showingAllCars: false
      };
      
      console.log('Loaded cars:', total);
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load cars');
      console.error('Error loading cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCarsAsFallback = async (make, model, originalPostcode, originalRadius) => {
    setLoading(true);
    setError('');

    try {
      const filterParams = {};
      if (make && make !== 'Any') filterParams.make = make;
      if (model && model !== 'Any') filterParams.model = model;
      
      const response = await carService.getCars(filterParams);
      
      // Backend returns: { success: true, data: [...], pagination: { total: X } }
      const cars = response.data || [];
      const total = response.pagination?.total || cars.length;
      
      // Transform to match search results format
      const transformedData = {
        postcode: originalPostcode,
        radius: originalRadius,
        count: total,
        results: cars.map(car => ({
          ...car,
          distance: 0 // No distance calculation for fallback
        })),
        showingAllCars: true // Flag to indicate we're showing all cars as fallback
      };
      
      console.log('Loaded all cars as fallback:', total);
      setSearchResults(transformedData);
      setFilteredResults(transformedData);
    } catch (err) {
      setError('Failed to load cars');
      console.error('Error loading cars:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to results
  useEffect(() => {
    if (!searchResults) return;

    let results = [...searchResults.results];

    // Filter by make
    if (filters.make !== 'All') {
      results = results.filter(car => car.make === filters.make);
    }

    // Filter by price
    if (filters.minPrice) {
      results = results.filter(car => car.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(car => car.price <= parseFloat(filters.maxPrice));
    }

    // Filter by year
    if (filters.minYear) {
      results = results.filter(car => car.year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      results = results.filter(car => car.year <= parseInt(filters.maxYear));
    }

    // Filter by mileage
    if (filters.maxMileage) {
      results = results.filter(car => car.mileage <= parseInt(filters.maxMileage));
    }

    // Filter by transmission
    if (filters.transmission !== 'All') {
      results = results.filter(car => car.transmission === filters.transmission);
    }

    // Filter by fuel type
    if (filters.fuelType !== 'All') {
      results = results.filter(car => car.fuelType === filters.fuelType);
    }

    // Sort results
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
      case 'distance':
      default:
        results.sort((a, b) => a.distance - b.distance);
        break;
    }

    setFilteredResults({
      ...searchResults,
      results,
      count: results.length
    });
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
        transmission: 'All',
        fuelType: 'All',
        sortBy: 'distance'
      });
    }
  };

  const handleSaveCar = (carId, carData = null) => {
    setSavedCars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(carId)) {
        newSet.delete(carId);
      } else {
        newSet.add(carId);
      }
      return newSet;
    });
  };

  const handleSaveSearch = () => {
    setSearchSaved(!searchSaved);
    if (!searchSaved) {
      // Save search to localStorage
      const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      savedSearches.push({
        postcode,
        radius,
        filters,
        date: new Date().toISOString()
      });
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
      alert('Search saved successfully!');
    } else {
      alert('Search removed from saved searches');
    }
  };

  const handleNewSearch = () => {
    navigate('/');
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    performSearch(postcode, newRadius);
  };

  const handleCarClick = (carId) => {
    navigate(`/cars/${carId}`);
  };

  // Get unique makes from results
  const getUniqueMakes = () => {
    if (!searchResults) return [];
    const makes = [...new Set(searchResults.results.map(car => car.make))];
    return makes.sort();
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{postcode ? `Searching for cars near ${postcode}...` : 'Loading cars...'}</p>
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
            <a href="/" className="back-link">
              ← Back to Home
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
              ⚙️ More options
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
            {searchResults?.showingAllCars ? (
              <span className="fallback-notice"> - Showing all available cars in our database</span>
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
            <div className="no-results-icon">🚗</div>
            <h2>No Cars Found</h2>
            <p>
              {postcode 
                ? `We couldn't find any cars within ${radius} miles of ${postcode}`
                : 'No cars match your search criteria'}
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
                {postcode ? 'Try Different Postcode' : 'Back to Home'}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-grid-autotrader">
            {filteredResults?.results.map((car, index) => (
              <div 
                key={car._id} 
                className="car-listing-card"
                onClick={() => handleCarClick(car._id)}
              >
                {/* Save Button */}
                <button 
                  className={`save-btn ${savedCars.has(car._id) ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCar(car._id);
                  }}
                >
                  {savedCars.has(car._id) ? '♥' : '♡'}
                </button>
                
                {/* Car Image */}
                <div className="car-image-wrapper">
                  <img 
                    src={car.images?.[0] || '/images/dummy/placeholder-car.jpg'} 
                    alt={`${car.make} ${car.model}`}
                    className="car-image"
                  />
                  <div className="image-counter">
                    {car.images?.length || 1}/{car.images?.length || 1}
                  </div>
                </div>
                
                {/* Car Details */}
                <div className="car-details">
                  <h3 className="car-name">{car.make} {car.model}</h3>
                  <p className="car-subtitle">
                    {car.year} {car.registrationNumber || 'REPLICA'}
                  </p>
                  
                  <div className="car-specs">
                    <span className="spec">{car.mileage?.toLocaleString() || '0'} miles</span>
                    <span className="spec-dot">•</span>
                    <span className="spec">{car.transmission || 'Manual'}</span>
                    <span className="spec-dot">•</span>
                    <span className="spec">{car.fuelType || 'Petrol'}</span>
                  </div>
                  
                  <div className="car-price">
                    £{car.price?.toLocaleString() || '0'}
                  </div>
                  
                  <div className="car-location">
                    <span className="location-icon">📍</span>
                    <span>
                      {car.locationName || car.postcode?.split(' ')[0] || 'Location'}
                      {car.distance > 0 && ` (${(car.distance || 0).toFixed(0)} miles)`}
                    </span>
                  </div>
                  
                  
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <FilterSidebar 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </div>
  );
}

export default SearchResultsPage;
