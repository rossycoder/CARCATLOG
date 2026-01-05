import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './CarSearchPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CarSearchPage = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.title = 'Car Search | CarCatALog';
    fetchCars();
  }, [searchParams]);

  // Auto-open filter modal when page first loads
  useEffect(() => {
    // Check if this is the first load (no filters applied yet)
    const hasFilters = Array.from(searchParams.keys()).some(key => key !== 'channel');
    if (!hasFilters) {
      // Small delay to ensure page is rendered before opening modal
      const timer = setTimeout(() => {
        setIsFilterOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string from search params
      const params = new URLSearchParams();
      
      // Add all filter parameters
      searchParams.forEach((value, key) => {
        if (key !== 'channel' && value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/vehicles/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }

      const data = await response.json();
      setCars(data.cars || []);
      setTotalCount(data.total || data.cars?.length || 0);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-GB').format(mileage);
  };

  if (loading) {
    return (
      <div className="car-search-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="car-search-page">
      <div className="container">
        {/* Header with count and filter button */}
        <div className="search-header">
          <div className="search-header-content">
            <h1>Car Search Results</h1>
            <p className="results-count">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'car' : 'cars'} found
            </p>
          </div>
          <button className="more-options-button" onClick={() => setIsFilterOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7H21L19 9H5L3 7Z"/>
              <path d="M6 12H18L17 14H7L6 12Z"/>
              <path d="M9 17H15L14 19H10L9 17Z"/>
            </svg>
            More options
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* No results */}
        {!error && cars.length === 0 && (
          <div className="no-results">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h2>No cars found</h2>
            <p>Try adjusting your filters to see more results</p>
            <button className="clear-filters-button" onClick={() => setIsFilterOpen(true)}>
              Adjust filters
            </button>
          </div>
        )}

        {/* Results grid */}
        {!error && cars.length > 0 && (
          <div className="results-grid">
            {cars.map((car) => (
              <div key={car._id} className="car-card">
                <div className="car-image">
                  {car.images && car.images.length > 0 ? (
                    <img src={car.images[0]} alt={`${car.make} ${car.model}`} />
                  ) : (
                    <div className="no-image">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 17h14v-5H5v5zm0 0v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="car-details">
                  <h3 className="car-title">{car.make} {car.model}</h3>
                  <p className="car-year">{car.year}</p>
                  <p className="car-price">{formatPrice(car.price)}</p>
                  <div className="car-specs">
                    <span className="spec-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      {formatMileage(car.mileage)} miles
                    </span>
                    {car.fuelType && (
                      <span className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M3 12h18M3 18h18"/>
                        </svg>
                        {car.fuelType}
                      </span>
                    )}
                    {car.transmission && (
                      <span className="spec-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M8 6h8M8 12h8M8 18h8"/>
                        </svg>
                        {car.transmission}
                      </span>
                    )}
                  </div>
                  {car.postcode && (
                    <p className="car-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {car.postcode}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </div>
  );
};

export default CarSearchPage;
