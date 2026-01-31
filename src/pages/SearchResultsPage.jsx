import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import CarCard from '../components/CarCard';
import './SearchResultsPage.css';

function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(1000); // National search by default (1000 miles covers all UK)
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
    colour: 'All',
    bodyType: 'All',
    doors: 'All',
    seats: 'All',
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
    const radiusParam = params.get('radius') || location.state?.radius || 1000; // National search by default
    const makeParam = params.get('make') || location.state?.make;
    const modelParam = params.get('model') || location.state?.model;
    const submodelParam = params.get('submodel');
    const colourParam = params.get('colour');
    const bodyTypeParam = params.get('bodyType');
    const doorsParam = params.get('doors');
    const seatsParam = params.get('seats');
    const gearboxParam = params.get('gearbox');
    const fuelTypeParam = params.get('fuelType');
    const priceFromParam = params.get('priceFrom');
    const priceToParam = params.get('priceTo');
    const yearFromParam = params.get('yearFrom');
    const yearToParam = params.get('yearTo');
    const mileageFromParam = params.get('mileageFrom');
    const mileageToParam = params.get('mileageTo');
    const openFilterParam = params.get('openFilter'); // Check if filter should auto-open

    console.log('SearchResultsPage mounted with params:', {
      postcodeParam,
      radiusParam,
      makeParam,
      modelParam,
      submodelParam,
      colourParam,
      bodyTypeParam,
      doorsParam,
      seatsParam,
      gearboxParam,
      fuelTypeParam,
      priceFromParam,
      priceToParam,
      yearFromParam,
      yearToParam,
      mileageFromParam,
      mileageToParam,
      openFilterParam,
      urlSearch: location.search,
      locationState: location.state
    });

    // Auto-open filter if explicitly requested via URL parameter
    if (openFilterParam === 'true') {
      console.log('Auto-opening filter modal due to openFilter=true parameter');
      setShowFilterModal(true);
    }

    // Build filter params object
    const filterParams = {
      make: makeParam,
      model: modelParam,
      submodel: submodelParam,
      colour: colourParam,
      bodyType: bodyTypeParam,
      doors: doorsParam,
      seats: seatsParam,
      gearbox: gearboxParam,
      fuelType: fuelTypeParam,
      priceFrom: priceFromParam,
      priceTo: priceToParam,
      yearFrom: yearFromParam,
      yearTo: yearToParam,
      mileageFrom: mileageFromParam,
      mileageTo: mileageToParam
    };

    if (postcodeParam) {
      setPostcode(postcodeParam);
      setRadius(parseInt(radiusParam) || 25);
      // Save postcode to localStorage for use on detail pages
      localStorage.setItem('userPostcode', postcodeParam);
      performSearch(postcodeParam, parseInt(radiusParam) || 25, filterParams);
    } else {
      // Load all cars if no postcode provided
      // Clear saved postcode if no postcode search
      localStorage.removeItem('userPostcode');
      loadAllCars(filterParams);
    }
  }, [location]);

  const performSearch = async (searchPostcode, searchRadius, filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      console.log('Performing search with:', { searchPostcode, searchRadius, filterParams });
      const response = await carService.searchCarsByPostcode(searchPostcode, searchRadius);
      
      console.log('Full search response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('🔍 RAW API RESULTS:', response.data?.results);
      console.log('🔍 FIRST CAR DISTANCE:', response.data?.results?.[0]?.distance);
      
      if (response.success && response.data) {
        let results = response.data.results || [];
        console.log('Results count before filtering:', results.length);
        console.log('🔍 RESULTS BEFORE FILTER:', results[0]);
        
        // Apply filters if provided
        if (filterParams.make && filterParams.make !== 'Any') {
          results = results.filter(car => car.make === filterParams.make);
          console.log('Results after make filter:', results.length);
        }
        if (filterParams.model && filterParams.model !== 'Any') {
          results = results.filter(car => car.model === filterParams.model);
          console.log('Results after model filter:', results.length);
        }
        if (filterParams.submodel) {
          results = results.filter(car => car.variant === filterParams.submodel);
          console.log('Results after submodel/variant filter:', results.length);
        }
        if (filterParams.colour) {
          results = results.filter(car => car.color === filterParams.colour);
          console.log('Results after colour filter:', results.length);
        }
        if (filterParams.bodyType) {
          results = results.filter(car => car.bodyType === filterParams.bodyType);
          console.log('Results after bodyType filter:', results.length);
        }
        if (filterParams.doors) {
          results = results.filter(car => car.doors === parseInt(filterParams.doors));
          console.log('Results after doors filter:', results.length);
        }
        if (filterParams.seats) {
          results = results.filter(car => car.seats === parseInt(filterParams.seats));
          console.log('Results after seats filter:', results.length);
        }
        if (filterParams.gearbox) {
          results = results.filter(car => car.transmission === filterParams.gearbox);
          console.log('Results after gearbox filter:', results.length);
        }
        if (filterParams.fuelType) {
          results = results.filter(car => car.fuelType === filterParams.fuelType);
          console.log('Results after fuelType filter:', results.length);
        }
        if (filterParams.priceFrom) {
          results = results.filter(car => car.price >= parseFloat(filterParams.priceFrom));
          console.log('Results after priceFrom filter:', results.length);
        }
        if (filterParams.priceTo) {
          results = results.filter(car => car.price <= parseFloat(filterParams.priceTo));
          console.log('Results after priceTo filter:', results.length);
        }
        if (filterParams.yearFrom) {
          results = results.filter(car => car.year >= parseInt(filterParams.yearFrom));
          console.log('Results after yearFrom filter:', results.length);
        }
        if (filterParams.yearTo) {
          results = results.filter(car => car.year <= parseInt(filterParams.yearTo));
          console.log('Results after yearTo filter:', results.length);
        }
        if (filterParams.mileageFrom) {
          results = results.filter(car => car.mileage >= parseInt(filterParams.mileageFrom));
          console.log('Results after mileageFrom filter:', results.length);
        }
        if (filterParams.mileageTo) {
          results = results.filter(car => car.mileage <= parseInt(filterParams.mileageTo));
          console.log('Results after mileageTo filter:', results.length);
        }
        
        // If no results found, load all cars from database
        if (results.length === 0) {
          console.log(`⚠️ No results in ${searchRadius} miles radius`);
          console.log(`⚠️ Calling fallback to show all available cars`);
          await loadAllCarsAsFallback(filterParams, searchPostcode, searchRadius);
          return;
        }
        
        console.log(`✅ Found ${results.length} results in ${searchRadius} miles radius`);
        console.log('✅ Results found in radius, NOT calling fallback');
        
        const filteredData = {
          postcode: response.data.postcode,
          coordinates: response.data.coordinates,
          radius: response.data.radius,
          results,
          count: results.length
        };
        
        console.log('Setting search results:', filteredData);
        console.log('First car distance:', results[0]?.distance);
        console.log('First car full data:', results[0]);
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

  const loadAllCars = async (filterParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const apiFilterParams = {};
      if (filterParams.make && filterParams.make !== 'Any') apiFilterParams.make = filterParams.make;
      if (filterParams.model && filterParams.model !== 'Any') apiFilterParams.model = filterParams.model;
      if (filterParams.submodel) apiFilterParams.submodel = filterParams.submodel;
      if (filterParams.colour) apiFilterParams.colour = filterParams.colour;
      if (filterParams.bodyType) apiFilterParams.bodyType = filterParams.bodyType;
      if (filterParams.doors) apiFilterParams.doors = filterParams.doors;
      if (filterParams.seats) apiFilterParams.seats = filterParams.seats;
      if (filterParams.gearbox) apiFilterParams.gearbox = filterParams.gearbox;
      if (filterParams.fuelType) apiFilterParams.fuelType = filterParams.fuelType;
      if (filterParams.priceFrom) apiFilterParams.priceFrom = filterParams.priceFrom;
      if (filterParams.priceTo) apiFilterParams.priceTo = filterParams.priceTo;
      if (filterParams.yearFrom) apiFilterParams.yearFrom = filterParams.yearFrom;
      if (filterParams.yearTo) apiFilterParams.yearTo = filterParams.yearTo;
      if (filterParams.mileageFrom) apiFilterParams.mileageFrom = filterParams.mileageFrom;
      if (filterParams.mileageTo) apiFilterParams.mileageTo = filterParams.mileageTo;
      
      const response = await carService.searchCars(apiFilterParams);
      
      // Backend returns: { success: true, cars: [...], total: X }
      const cars = response.cars || [];
      const total = response.total || cars.length;
      
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

  const loadAllCarsAsFallback = async (filterParams = {}, originalPostcode, originalRadius) => {
    setLoading(true);
    setError('');

    try {
      const apiFilterParams = {};
      if (filterParams.make && filterParams.make !== 'Any') apiFilterParams.make = filterParams.make;
      if (filterParams.model && filterParams.model !== 'Any') apiFilterParams.model = filterParams.model;
      if (filterParams.submodel) apiFilterParams.submodel = filterParams.submodel;
      if (filterParams.colour) apiFilterParams.colour = filterParams.colour;
      if (filterParams.bodyType) apiFilterParams.bodyType = filterParams.bodyType;
      if (filterParams.doors) apiFilterParams.doors = filterParams.doors;
      if (filterParams.seats) apiFilterParams.seats = filterParams.seats;
      if (filterParams.gearbox) apiFilterParams.gearbox = filterParams.gearbox;
      if (filterParams.fuelType) apiFilterParams.fuelType = filterParams.fuelType;
      if (filterParams.priceFrom) apiFilterParams.priceFrom = filterParams.priceFrom;
      if (filterParams.priceTo) apiFilterParams.priceTo = filterParams.priceTo;
      if (filterParams.yearFrom) apiFilterParams.yearFrom = filterParams.yearFrom;
      if (filterParams.yearTo) apiFilterParams.yearTo = filterParams.yearTo;
      if (filterParams.mileageFrom) apiFilterParams.mileageFrom = filterParams.mileageFrom;
      if (filterParams.mileageTo) apiFilterParams.mileageTo = filterParams.mileageTo;
      
      const response = await carService.searchCars(apiFilterParams);
      
      // Backend returns: { success: true, cars: [...], total: X }
      const cars = response.cars || [];
      const total = response.total || cars.length;
      
      console.log('⚠️ Fallback: Calculating distance for all cars');
      
      // Calculate distance for each car if we have user's postcode
      let carsWithDistance = cars;
      if (originalPostcode) {
        try {
          const postcodeService = require('../services/postcodeService');
          const haversine = require('../utils/haversine');
          
          // This won't work in frontend - we need backend API
          // For now, set distance based on coordinates if available
          carsWithDistance = cars.map(car => {
            // If car has coordinates, we could calculate distance
            // But we need user coordinates from postcode
            // For now, keep original distance or set to null
            return {
              ...car,
              distance: car.distance || null
            };
          });
        } catch (err) {
          console.warn('Could not calculate distance in fallback:', err);
          carsWithDistance = cars.map(car => ({ ...car, distance: null }));
        }
      }
      
      // Transform to match search results format
      const transformedData = {
        postcode: originalPostcode,
        radius: originalRadius,
        count: total,
        results: carsWithDistance,
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

    // Filter by colour
    if (filters.colour !== 'All') {
      results = results.filter(car => car.color === filters.colour);
    }

    // Filter by body type
    if (filters.bodyType !== 'All') {
      results = results.filter(car => car.bodyType === filters.bodyType);
    }

    // Filter by doors
    if (filters.doors !== 'All') {
      results = results.filter(car => car.doors === parseInt(filters.doors));
    }

    // Filter by seats
    if (filters.seats !== 'All') {
      results = results.filter(car => car.seats === parseInt(filters.seats));
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
        colour: 'All',
        bodyType: 'All',
        doors: 'All',
        seats: 'All',
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
    navigate(`/cars/${carId}`, { 
      state: { from: window.location.pathname + window.location.search } 
    });
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
            {filteredResults?.results.map((car, index) => {
              console.log(`SearchResults - Car ${index} distance:`, car.distance);
              console.log(`SearchResults - Car ${index} full:`, car);
              return <CarCard key={car._id} car={car} />;
            })}
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
