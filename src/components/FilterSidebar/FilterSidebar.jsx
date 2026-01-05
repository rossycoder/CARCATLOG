import { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    sort: 'relevance',
    distance: 'national',
    makeModel: '',
    reserveWithAutotrader: false,
    priceFrom: '',
    priceTo: '',
    yearFrom: '',
    yearTo: '',
    mileageFrom: '',
    mileageTo: '',
    gearbox: '',
    bodyType: '',
    colour: '',
    doors: '',
    seats: '',
    fuelType: '',
    batteryRange: '',
    chargingTime: '',
    engineSize: ''
  });

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearAll = () => {
    setFilters({
      sort: 'relevance',
      distance: 'national',
      makeModel: '',
      reserveWithAutotrader: false,
      priceFrom: '',
      priceTo: '',
      yearFrom: '',
      yearTo: '',
      mileageFrom: '',
      mileageTo: '',
      gearbox: '',
      bodyType: '',
      colour: '',
      doors: '',
      seats: '',
      fuelType: '',
      batteryRange: '',
      chargingTime: '',
      engineSize: ''
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="filter-overlay" onClick={onClose}></div>
      <div className="filter-sidebar">
        <div className="filter-header">
          <h2>Filter and sort</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="filter-content">
          {/* Sort */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M7 12h10M11 18h2"/>
              </svg>
              Sort
            </label>
            <select 
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
              <option value="mileage-low">Mileage: Low to High</option>
              <option value="mileage-high">Mileage: High to Low</option>
            </select>
          </div>

          {/* Distance */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Distance from you
            </label>
            <select 
              className="filter-select"
              value={filters.distance}
              onChange={(e) => handleChange('distance', e.target.value)}
            >
              <option value="national">National</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
              <option value="200">Within 200 miles</option>
            </select>
          </div>

          {/* Make and Model */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17h14v-5H5v5zm0 0v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"/>
              </svg>
              Make and model
            </label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search make or model"
              value={filters.makeModel}
              onChange={(e) => handleChange('makeModel', e.target.value)}
            />
          </div>

          {/* Reserve with Autotrader */}
          <div className="filter-section checkbox-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.reserveWithAutotrader}
                onChange={(e) => handleChange('reserveWithAutotrader', e.target.checked)}
              />
              <span>Reserve online with the option to finance or part exchange</span>
            </label>
          </div>

          {/* Price */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Price
            </label>
            <div className="range-inputs">
              <input
                type="text"
                className="filter-input"
                placeholder="From"
                value={filters.priceFrom}
                onChange={(e) => handleChange('priceFrom', e.target.value)}
              />
              <span className="range-separator">to</span>
              <input
                type="text"
                className="filter-input"
                placeholder="To"
                value={filters.priceTo}
                onChange={(e) => handleChange('priceTo', e.target.value)}
              />
            </div>
          </div>

          {/* Year */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Year
            </label>
            <div className="range-inputs">
              <select 
                className="filter-select"
                value={filters.yearFrom}
                onChange={(e) => handleChange('yearFrom', e.target.value)}
              >
                <option value="">From</option>
                {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="range-separator">to</span>
              <select 
                className="filter-select"
                value={filters.yearTo}
                onChange={(e) => handleChange('yearTo', e.target.value)}
              >
                <option value="">To</option>
                {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mileage */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Mileage
            </label>
            <div className="range-inputs">
              <input
                type="text"
                className="filter-input"
                placeholder="From"
                value={filters.mileageFrom}
                onChange={(e) => handleChange('mileageFrom', e.target.value)}
              />
              <span className="range-separator">to</span>
              <input
                type="text"
                className="filter-input"
                placeholder="To"
                value={filters.mileageTo}
                onChange={(e) => handleChange('mileageTo', e.target.value)}
              />
            </div>
          </div>

          {/* Gearbox */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M8 6h8M8 12h8M8 18h8"/>
              </svg>
              Gearbox
            </label>
            <select 
              className="filter-select"
              value={filters.gearbox}
              onChange={(e) => handleChange('gearbox', e.target.value)}
            >
              <option value="">Any</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>

          {/* Body type */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17h14v-5H5v5zm0 0v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>
              </svg>
              Body type
            </label>
            <select 
              className="filter-select"
              value={filters.bodyType}
              onChange={(e) => handleChange('bodyType', e.target.value)}
            >
              <option value="">Any</option>
              <option value="hatchback">Hatchback</option>
              <option value="saloon">Saloon</option>
              <option value="estate">Estate</option>
              <option value="suv">SUV</option>
              <option value="coupe">Coupe</option>
              <option value="convertible">Convertible</option>
              <option value="mpv">MPV</option>
            </select>
          </div>

          {/* Colour */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Colour
            </label>
            <select 
              className="filter-select"
              value={filters.colour}
              onChange={(e) => handleChange('colour', e.target.value)}
            >
              <option value="">Any</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="silver">Silver</option>
              <option value="grey">Grey</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
            </select>
          </div>

          {/* Doors */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              Doors
            </label>
            <select 
              className="filter-select"
              value={filters.doors}
              onChange={(e) => handleChange('doors', e.target.value)}
            >
              <option value="">Any</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Seats */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 9v6h14V9M5 15v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>
              </svg>
              Seats
            </label>
            <select 
              className="filter-select"
              value={filters.seats}
              onChange={(e) => handleChange('seats', e.target.value)}
            >
              <option value="">Any</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7">7</option>
            </select>
          </div>

          {/* Fuel type */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
              Fuel type
            </label>
            <select 
              className="filter-select"
              value={filters.fuelType}
              onChange={(e) => handleChange('fuelType', e.target.value)}
            >
              <option value="">Any</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Battery range */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="6" width="18" height="12" rx="2"/>
                <path d="M19 10v4"/>
              </svg>
              Battery range
            </label>
            <select 
              className="filter-select"
              value={filters.batteryRange}
              onChange={(e) => handleChange('batteryRange', e.target.value)}
            >
              <option value="">Any</option>
              <option value="100">100+ miles</option>
              <option value="150">150+ miles</option>
              <option value="200">200+ miles</option>
              <option value="250">250+ miles</option>
              <option value="300">300+ miles</option>
            </select>
          </div>

          {/* Charging time */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Charging time
            </label>
            <select 
              className="filter-select"
              value={filters.chargingTime}
              onChange={(e) => handleChange('chargingTime', e.target.value)}
            >
              <option value="">Any</option>
              <option value="rapid">Rapid (under 1 hour)</option>
              <option value="fast">Fast (1-4 hours)</option>
              <option value="slow">Slow (4+ hours)</option>
            </select>
          </div>

          {/* Engine size */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <path d="M9 9h6v6H9z"/>
              </svg>
              Engine size
            </label>
            <select 
              className="filter-select"
              value={filters.engineSize}
              onChange={(e) => handleChange('engineSize', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1.0">Up to 1.0L</option>
              <option value="1.5">1.0L - 1.5L</option>
              <option value="2.0">1.5L - 2.0L</option>
              <option value="2.5">2.0L - 2.5L</option>
              <option value="3.0">2.5L - 3.0L</option>
              <option value="3.0+">3.0L+</option>
            </select>
          </div>
        </div>

        <div className="filter-footer">
          <button className="clear-all-button" onClick={handleClearAll}>
            Clear all
          </button>
          <button className="apply-button" onClick={handleApply}>
            Search 404,184 cars
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
