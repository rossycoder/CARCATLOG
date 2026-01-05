import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { carBrands } from '../../data/carBrands';
import { carService } from '../../services/carService';

const HeroSection = ({ headline, subheadline, onFilterClick }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    postcode: '',
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: ''
  });
  const [carCount, setCarCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Fetch car count on component mount
  useEffect(() => {
    const fetchCarCount = async () => {
      try {
        setLoadingCount(true);
        console.log('Fetching car count from API...');
        const count = await carService.getCarCount();
        console.log('Car count received:', count);
        setCarCount(count || 0);
      } catch (error) {
        console.error('Error fetching car count:', error);
        console.error('Error details:', error.message, error.response?.data);
        setCarCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchCarCount();
  }, []);

  // Sort brands alphabetically
  const sortedBrands = [...carBrands].sort((a, b) => a.name.localeCompare(b.name));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate postcode is entered
    if (!searchParams.postcode.trim()) {
      alert('Please enter a postcode to search');
      return;
    }
    
    // Build query string from search params
    const queryParams = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        queryParams.append(key, searchParams[key]);
      }
    });
    
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
                  />
                </div>
                
                <div className="redesign-search-field">
                  <label>Make</label>
                  <select 
                    name="make"
                    value={searchParams.make}
                    onChange={handleInputChange}
                  >
                    <option value="">Any</option>
                    {sortedBrands.map((brand) => (
                      <option key={brand.name} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="redesign-search-field">
                  <label>Model</label>
                  <input 
                    type="text" 
                    name="model"
                    placeholder="Any" 
                    value={searchParams.model}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="redesign-search-actions">
                  <button 
                    type="button"
                    className="more-options-link"
                    onClick={() => {
                      if (!searchParams.postcode.trim()) {
                        alert('Please enter a postcode first');
                        return;
                      }
                      onFilterClick && onFilterClick();
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
                    <span className="search-icon">🔍</span>
                    Search {loadingCount ? '...' : carCount.toLocaleString()} cars
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
