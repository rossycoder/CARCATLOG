import React, { useState } from 'react';
import './HeroSection.css';

const HeroSection = ({ stockCount }) => {
  const [searchData, setSearchData] = useState({
    postcode: '',
    make: '',
    model: '',
    showMoreOptions: false
  });
  const [models, setModels] = useState([]);

  const carMakes = [
    { value: 'audi', label: 'Audi', count: '32,841' },
    { value: 'bmw', label: 'BMW', count: '36,685' },
    { value: 'ford', label: 'Ford', count: '38,853' },
    { value: 'mercedes-benz', label: 'Mercedes-Benz', count: '29,830' },
    { value: 'toyota', label: 'Toyota', count: '17,196' },
    { value: 'volkswagen', label: 'Volkswagen', count: '34,695' },
    { value: 'vauxhall', label: 'Vauxhall', count: '24,771' },
    { value: 'nissan', label: 'Nissan', count: '19,078' }
  ];

  const modelsByMake = {
    audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT'],
    bmw: ['1 Series', '3 Series', '5 Series', 'X1', 'X3', 'X5'],
    ford: ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Mustang'],
    'mercedes-benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'S-Class'],
    toyota: ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Prius', 'Hilux'],
    volkswagen: ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Arteon'],
    vauxhall: ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland'],
    nissan: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', '370Z']
  };

  const handleMakeChange = (e) => {
    const selectedMake = e.target.value;
    setSearchData(prev => ({
      ...prev,
      make: selectedMake,
      model: ''
    }));
    setModels(modelsByMake[selectedMake] || []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search data:', searchData);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Used cars</h1>
          <p className="hero-subtitle">Meet your perfect car</p>
        </div>

        <div className="hero-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
              <div className="search-field postcode-field">
                <label htmlFor="postcode">Postcode</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={searchData.postcode}
                    onChange={handleInputChange}
                    placeholder="Postcode"
                    maxLength="8"
                    required
                  />
                  <button
                    type="button"
                    className="location-btn"
                    onClick={useCurrentLocation}
                    aria-label="Use your location"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="search-field">
                <label htmlFor="make">Make</label>
                <select
                  id="make"
                  name="make"
                  value={searchData.make}
                  onChange={handleMakeChange}
                >
                  <option value="">Any</option>
                  {carMakes.map(make => (
                    <option key={make.value} value={make.value}>
                      {make.label} ({make.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="model">Model</label>
                <select
                  id="model"
                  name="model"
                  value={searchData.model}
                  onChange={handleInputChange}
                  disabled={!searchData.make}
                >
                  <option value="">Any</option>
                  {models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-actions">
              <button
                type="button"
                className="more-options-btn"
                onClick={() => setSearchData(prev => ({
                  ...prev,
                  showMoreOptions: !prev.showMoreOptions
                }))}
              >
                More options
              </button>
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                Search {stockCount?.toLocaleString()} cars
              </button>
            </div>

            {searchData.showMoreOptions && (
              <div className="more-options">
                <div className="options-grid">
                  <div className="search-field">
                    <label htmlFor="priceFrom">Price from</label>
                    <select id="priceFrom" name="priceFrom">
                      <option value="">Any</option>
                      <option value="1000">£1,000</option>
                      <option value="5000">£5,000</option>
                      <option value="10000">£10,000</option>
                      <option value="15000">£15,000</option>
                      <option value="20000">£20,000</option>
                    </select>
                  </div>
                  <div className="search-field">
                    <label htmlFor="priceTo">Price to</label>
                    <select id="priceTo" name="priceTo">
                      <option value="">Any</option>
                      <option value="10000">£10,000</option>
                      <option value="20000">£20,000</option>
                      <option value="30000">£30,000</option>
                      <option value="50000">£50,000</option>
                    </select>
                  </div>
                  <div className="search-field">
                    <label htmlFor="yearFrom">Year from</label>
                    <select id="yearFrom" name="yearFrom">
                      <option value="">Any</option>
                      <option value="2020">2020</option>
                      <option value="2018">2018</option>
                      <option value="2015">2015</option>
                    </select>
                  </div>
                  <div className="search-field">
                    <label htmlFor="fuelType">Fuel type</label>
                    <select id="fuelType" name="fuelType">
                      <option value="">Any</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
