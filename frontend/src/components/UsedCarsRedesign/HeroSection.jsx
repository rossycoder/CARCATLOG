import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { carBrands } from '../../data/carBrands';
import { carService } from '../../services/carService';

const HeroSection = ({ headline, subheadline }) => {
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
  const [showMoreOptions, setShowMoreOptions] = useState(false);
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
                    className="more-options"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                  >
                    {showMoreOptions ? 'Less options' : 'More options'}
                  </button>
                  <button type="submit" className="redesign-search-btn">
                    <span className="search-icon">🔍</span>
                    Search {loadingCount ? '...' : carCount.toLocaleString()} cars
                  </button>
                </div>
              </div>
              
              {showMoreOptions && (
                <div className="redesign-more-options">
                  <div className="redesign-search-field">
                    <label>Min Price</label>
                    <input 
                      type="number" 
                      name="minPrice"
                      placeholder="£ Min" 
                      value={searchParams.minPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="redesign-search-field">
                    <label>Max Price</label>
                    <input 
                      type="number" 
                      name="maxPrice"
                      placeholder="£ Max" 
                      value={searchParams.maxPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="redesign-search-field">
                    <label>Min Year</label>
                    <input 
                      type="number" 
                      name="minYear"
                      placeholder="From" 
                      value={searchParams.minYear}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  
                  <div className="redesign-search-field">
                    <label>Max Year</label>
                    <input 
                      type="number" 
                      name="maxYear"
                      placeholder="To" 
                      value={searchParams.maxYear}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
