import { useState } from 'react';
import { carService } from '../../services/carService';
import CarCard from '../CarCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './PostcodeSearch.css';

function PostcodeSearch() {
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!postcode.trim()) {
      setError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults(null);

    try {
      const response = await carService.searchCarsByPostcode(postcode, radius);
      
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPostcode('');
    setRadius(25);
    setError('');
    setSearchResults(null);
  };

  return (
    <div className="postcode-search">
      <div className="postcode-search-form-container">
        <h2>Find Cars Near You</h2>
        <p className="postcode-search-subtitle">
          Search for available cars within your area
        </p>

        <form onSubmit={handleSearch} className="postcode-search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="postcode">Postcode</label>
              <input
                type="text"
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="e.g. SW1A 1AA"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="radius">Radius (miles)</label>
              <input
                type="number"
                id="radius"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 25)}
                min="1"
                max="200"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" text="Searching..." inline /> : 'Search'}
            </button>
            <button 
              type="button" 
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {searchResults && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results</h3>
            <div className="results-info">
              <p>
                <strong>{searchResults.count}</strong> car{searchResults.count !== 1 ? 's' : ''} found 
                within <strong>{searchResults.radius} miles</strong> of{' '}
                <strong>{searchResults.postcode}</strong>
              </p>
            </div>
          </div>

          {searchResults.count === 0 ? (
            <div className="no-results">
              <p>No cars found in this area. Try increasing the search radius.</p>
            </div>
          ) : (
            <div className="results-grid">
              {searchResults.results.map((car) => (
                <div key={car._id} className="result-item">
                  <CarCard car={car} />
                  <div className="distance-badge">
                    📍 {car.distance} miles away
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PostcodeSearch;
