import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { carService } from '../../services/carService';
import { filterService } from '../../services/filterService';

const HeroSection = ({ headline, subheadline, onFilterClick }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    postcode: '',
    make: '',
    model: '',
    maxPrice: ''
  });
  const [carCount, setCarCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [postcodeError, setPostcodeError] = useState('');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch car count — re-runs whenever make or model changes
  const fetchCarCount = useCallback(async (make, model) => {
    try {
      setLoadingCount(true);
      const params = {};
      if (make) params.make = make;
      if (model) params.model = model;
      const count = await carService.getCarCount(params);
      setCarCount(count || 0);
    } catch (error) {
      console.error('Error fetching car count:', error);
      setCarCount(0);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  // Fetch car count and makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const makesData = await filterService.getMakes();
        setMakes(makesData);
      } catch (err) {
        console.error('Error fetching makes:', err);
        setMakes([]);
      } finally {
        setLoadingMakes(false);
      }
    };

    fetchCarCount('', '');
    fetchMakes();
  }, [fetchCarCount]);

  // Re-fetch count when make or model changes
  useEffect(() => {
    fetchCarCount(searchParams.make, searchParams.model);
  }, [searchParams.make, searchParams.model, fetchCarCount]);

  // Fetch models when make changes
  useEffect(() => {
    if (searchParams.make) {
      const fetchModels = async () => {
        try {
          setLoadingModels(true);
          const modelsData = await filterService.getModelsForMake(searchParams.make);
          setModels(modelsData);
        } catch (err) {
          console.error('Error fetching models:', err);
          setModels([]);
        } finally {
          setLoadingModels(false);
        }
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [searchParams.make]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
      // Reset model when make changes
      ...(name === 'make' ? { model: '' } : {})
    }));
    if (name === 'postcode' && postcodeError) {
      setPostcodeError('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate postcode is entered
    if (!searchParams.postcode.trim()) {
      setPostcodeError('Please enter a postcode to search');
      return;
    }
    
    // Clear error
    setPostcodeError('');
    
    // Build query string from search params
    const queryParams = new URLSearchParams();
    
    // Add postcode with national radius (1000 miles)
    queryParams.append('postcode', searchParams.postcode);
    queryParams.append('radius', 1000); // National search
    
    // Add other search params
    if (searchParams.make) {
      queryParams.append('make', searchParams.make);
    }
    if (searchParams.model) {
      queryParams.append('model', searchParams.model);
    }
    if (searchParams.maxPrice) {
      queryParams.append('maxPrice', searchParams.maxPrice);
    }
    
    // Navigate to search results page
    navigate(`/search-results?${queryParams.toString()}`);
  };

  return (
    <section className="redesign-hero">
      <div className="redesign-hero-background">
        <div className="redesign-hero-container">
          <div className="redesign-hero-content">
            <p className="redesign-hero-label">Used cars</p>
            <h1 className="redesign-hero-headline">
              {headline || 'Meet your perfect car'}
            </h1>
            
            <form className="redesign-hero-search-card" onSubmit={handleSearch}>
              <div className="redesign-search-row">
                <div className="redesign-search-field">
                  <label>Postcode</label>
                  <input 
                    type="text" 
                    name="postcode"
                    placeholder="e.g. SW1A 1AA" 
                    value={searchParams.postcode}
                    onChange={handleInputChange}
                    className={postcodeError ? 'error' : ''}
                  />
                  {postcodeError && (
                    <span className="error-message">{postcodeError}</span>
                  )}
                </div>
                
                <div className="redesign-search-field">
                  <label>Make</label>
                  <select 
                    name="make"
                    value={searchParams.make}
                    onChange={handleInputChange}
                    disabled={loadingMakes}
                  >
                    <option value="">Any</option>
                    {loadingMakes ? (
                      <option disabled>Loading makes...</option>
                    ) : (
                      makes.map((makeName) => (
                        <option key={makeName} value={makeName}>
                          {makeName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="redesign-search-field">
                  <label>Model</label>
                  <select
                    name="model"
                    value={searchParams.model}
                    onChange={handleInputChange}
                    disabled={!searchParams.make || loadingModels}
                  >
                    <option value="">Any</option>
                    {loadingModels ? (
                      <option disabled>Loading...</option>
                    ) : (
                      models.map((modelName) => (
                        <option key={modelName} value={modelName}>{modelName}</option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="redesign-search-actions">
                  <button 
                    type="button"
                    className="more-options-link"
                    onClick={() => {
                      if (!searchParams.postcode.trim()) {
                        setPostcodeError('Please enter a postcode first');
                        return;
                      }
                      // Pass search params to parent for navigation
                      onFilterClick && onFilterClick(
                        searchParams.postcode,
                        searchParams.make,
                        searchParams.model
                      );
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    More options
                  </button>
                  <button 
                    type="submit" 
                    className="redesign-search-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    {loadingCount ? 'Loading...' : `Search ${carCount.toLocaleString()} cars`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
