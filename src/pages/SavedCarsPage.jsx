import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractTownName } from '../utils/vehicleFormatter';
import './SavedCarsPage.css';

function SavedCarsPage() {
  const navigate = useNavigate();
  const [savedCars, setSavedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    make: 'All',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    transmission: 'All',
    fuelType: 'All',
    sortBy: 'date-saved'
  });
  const [filteredCars, setFilteredCars] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load saved cars from localStorage
  useEffect(() => {
    loadSavedCars();
  }, []);

  const loadSavedCars = () => {
    setLoading(true);
    setError('');
    
    try {
      const saved = localStorage.getItem('savedCarsData');
      console.log('Saved cars data from localStorage:', saved);
      
      if (saved) {
        const cars = JSON.parse(saved);
        console.log('Loaded cars:', cars);
        setSavedCars(cars);
        setFilteredCars(cars);
      } else {
        console.log('No saved cars found');
        setSavedCars([]);
        setFilteredCars([]);
      }
    } catch (err) {
      console.error('Error loading saved cars:', err);
      setError('Failed to load saved cars');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to results
  useEffect(() => {
    if (savedCars.length === 0) {
      setFilteredCars([]);
      return;
    }

    let results = [...savedCars];

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
      case 'date-saved':
      default:
        // Keep original order (most recently saved first)
        break;
    }

    setFilteredCars(results);
  }, [filters, savedCars]);

  const handleRemoveCar = (carId) => {
    const updatedCars = savedCars.filter(car => car._id !== carId);
    setSavedCars(updatedCars);
    setFilteredCars(updatedCars);
    localStorage.setItem('savedCarsData', JSON.stringify(updatedCars));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved cars?')) {
      setSavedCars([]);
      setFilteredCars([]);
      localStorage.removeItem('savedCars');
      localStorage.removeItem('savedCarsData');
    }
  };

  const handleCarClick = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const getUniqueMakes = () => {
    const makes = [...new Set(savedCars.map(car => car.make))];
    return makes.sort();
  };

  if (loading) {
    return (
      <div className="saved-cars-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading saved cars...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-cars-page">
      {/* Header */}
      <div className="saved-cars-header">
        <div className="container-wide">
          <div className="header-content">
            <h1>Saved Cars</h1>
            <p className="saved-count">
              {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="filter-sort-btn"
              onClick={() => setShowFilterModal(true)}
            >
              ≡ Filter and sort
            </button>
            {savedCars.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            )}
          </div>
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
              {/* Price Filter */}
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

              {/* Year Filter */}
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

              {/* Mileage Filter */}
              <div className="filter-section">
                <h3>Maximum Mileage</h3>
                <input
                  type="number"
                  placeholder="Max mileage"
                  value={filters.maxMileage}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxMileage: e.target.value }))}
                />
              </div>

              {/* Transmission Filter */}
              <div className="filter-section">
                <h3>Transmission</h3>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                >
                  <option value="All">All</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div className="filter-section">
                <h3>Fuel Type</h3>
                <select
                  value={filters.fuelType}
                  onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                >
                  <option value="All">All</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="filter-section">
                <h3>Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="date-saved">Recently saved</option>
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
                    transmission: 'All',
                    fuelType: 'All',
                    sortBy: 'date-saved'
                  });
                }}
              >
                Clear All
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowFilterModal(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-wide">
        {filteredCars.length === 0 ? (
          <div className="no-saved-cars">
            <div className="empty-state-icon">♡</div>
            <h2>No saved cars yet</h2>
            <p>Start exploring and save your favorite cars to compare them later</p>
            <button 
              onClick={() => navigate('/search')}
              className="btn-primary"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="saved-cars-grid">
            {filteredCars.map((car) => (
              <div 
                key={car._id} 
                className="car-listing-card"
                onClick={() => handleCarClick(car._id)}
              >
                {/* Remove Button */}
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCar(car._id);
                  }}
                  title="Remove from saved"
                >
                  ✕
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
                      {extractTownName(car.locationName) || 'Location not available'}
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

export default SavedCarsPage;
