import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { carService } from '../../services/carService';
import './FilterSidebar.css';

const FilterSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [validationErrors, setValidationErrors] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    makes: [],
    models: [],
    modelsByMake: {},
    submodelsByMakeModel: {},
    variantsByMakeModel: {},
    fuelTypes: [],
    transmissions: [],
    bodyTypes: [],
    colours: [],
    yearRange: { min: 2000, max: new Date().getFullYear() }
  });
  const [filters, setFilters] = useState({
    sort: 'relevance',
    distance: 'national',
    postcode: '',
    make: '',
    model: '',
    submodel: '',
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
    engineSize: ''
  });

  // Load filters from URL params when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters({
        sort: searchParams.get('sort') || 'relevance',
        distance: searchParams.get('distance') || 'national',
        postcode: searchParams.get('postcode') || '',
        make: searchParams.get('make') || '',
        model: searchParams.get('model') || '',
        submodel: searchParams.get('submodel') || '',
        priceFrom: searchParams.get('priceFrom') || '',
        priceTo: searchParams.get('priceTo') || '',
        yearFrom: searchParams.get('yearFrom') || '',
        yearTo: searchParams.get('yearTo') || '',
        mileageFrom: searchParams.get('mileageFrom') || '',
        mileageTo: searchParams.get('mileageTo') || '',
        gearbox: searchParams.get('gearbox') || '',
        bodyType: searchParams.get('bodyType') || '',
        colour: searchParams.get('colour') || '',
        doors: searchParams.get('doors') || '',
        seats: searchParams.get('seats') || '',
        fuelType: searchParams.get('fuelType') || '',
        engineSize: searchParams.get('engineSize') || ''
      });
    }
  }, [isOpen, searchParams]);

  // Fetch filter options from database on mount and when filters change
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log('[FilterSidebar] 🎯 Fetching filter options with params:', {
          make: filters.make,
          model: filters.model,
          submodel: filters.submodel
        });
        
        // Build query params for filtered options
        const params = new URLSearchParams();
        if (filters.make) params.append('make', filters.make);
        if (filters.model) params.append('model', filters.model);
        if (filters.submodel) params.append('submodel', filters.submodel);
        
        const queryString = params.toString();
        const url = queryString ? `/vehicles/filter-options?${queryString}` : '/vehicles/filter-options';
        
        console.log('[FilterSidebar] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
        console.log('[FilterSidebar] Fetching from:', url);
        
        const options = await carService.getFilterOptions(queryString);
        
        console.log('[FilterSidebar] ✅ Successfully received filter options!');
        console.log('[FilterSidebar] Colours:', options?.colours);
        
        if (options && options.makes) {
          setFilterOptions(options);
          console.log('[FilterSidebar] ✅ Filter options set successfully!');
        } else {
          console.error('[FilterSidebar] ❌ Invalid options structure:', options);
        }
      } catch (error) {
        console.error('[FilterSidebar] ❌ Error fetching filter options:');
        console.error('[FilterSidebar] Error message:', error.message);
        console.error('[FilterSidebar] Full error:', error);
      }
    };
    
    fetchFilterOptions();
  }, [filters.make, filters.model, filters.submodel]); // Re-fetch when these change

  const handleChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Cascading filter logic: reset dependent filters
      if (field === 'make') {
        newFilters.model = '';
        newFilters.submodel = '';
      } else if (field === 'model') {
        newFilters.submodel = '';
      }
      
      return newFilters;
    });
    
    // Clear validation error for this field when user makes changes
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Get available models based on selected make
  const availableModels = filters.make && filterOptions.modelsByMake[filters.make]
    ? filterOptions.modelsByMake[filters.make]
    : [];

  // Get available submodels based on selected make and model
  const availableSubmodels = filters.make && filters.model && 
    filterOptions.submodelsByMakeModel[filters.make] && 
    filterOptions.submodelsByMakeModel[filters.make][filters.model]
    ? filterOptions.submodelsByMakeModel[filters.make][filters.model]
    : [];

  // Get available variants based on selected make and model
  const availableVariants = filters.make && filters.model && 
    filterOptions.variantsByMakeModel && 
    filterOptions.variantsByMakeModel[filters.make] && 
    filterOptions.variantsByMakeModel[filters.make][filters.model]
    ? filterOptions.variantsByMakeModel[filters.make][filters.model]
    : [];

  // Debug logging
  console.log('[FilterSidebar] Current filters:', filters);
  console.log('[FilterSidebar] Available models for', filters.make, ':', availableModels);
  console.log('[FilterSidebar] Available submodels for', filters.make, filters.model, ':', availableSubmodels);
  console.log('[FilterSidebar] Available variants for', filters.make, filters.model, ':', availableVariants);

  const validateFilters = () => {
    const errors = {};
    
    // Validate price range
    if (filters.priceFrom && filters.priceTo) {
      const priceFrom = parseFloat(filters.priceFrom);
      const priceTo = parseFloat(filters.priceTo);
      
      if (isNaN(priceFrom) || priceFrom < 0) {
        errors.priceFrom = 'Please enter a valid positive number';
      }
      if (isNaN(priceTo) || priceTo < 0) {
        errors.priceTo = 'Please enter a valid positive number';
      }
      if (!errors.priceFrom && !errors.priceTo && priceFrom > priceTo) {
        errors.priceTo = 'Maximum price must be greater than or equal to minimum price';
      }
    } else if (filters.priceFrom) {
      const priceFrom = parseFloat(filters.priceFrom);
      if (isNaN(priceFrom) || priceFrom < 0) {
        errors.priceFrom = 'Please enter a valid positive number';
      }
    } else if (filters.priceTo) {
      const priceTo = parseFloat(filters.priceTo);
      if (isNaN(priceTo) || priceTo < 0) {
        errors.priceTo = 'Please enter a valid positive number';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClearAll = () => {
    setFilters({
      sort: 'relevance',
      distance: 'national',
      postcode: '',
      make: '',
      model: '',
      submodel: '',
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
      engineSize: ''
    });
  };

  const handleApply = () => {
    // Validate filters before applying
    if (!validateFilters()) {
      return;
    }
    
    console.log('[FilterSidebar] Applying filters:', filters);
    
    // Build query params from filters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'relevance' && value !== 'national') {
        params.append(key, value);
        console.log(`[FilterSidebar] Adding param: ${key} = ${value}`);
      }
    });

    console.log('[FilterSidebar] Final URL params:', params.toString());

    // Navigate to search results page
    navigate(`/search-results?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`filter-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h2>Filter and sort</h2>
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="Close"
            style={{ position: 'relative' }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ display: 'block', opacity: 1, visibility: 'visible' }}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
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

          {/* Postcode */}
          <div className="filter-section">
            <label className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Postcode
            </label>
            <input
              type="text"
              className="filter-input"
              placeholder="e.g. M1 1AE"
              value={filters.postcode}
              onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
            />
          </div>

          {/* Make and Model - Collapsible Section */}
          <div className="filter-section-collapsible">
            <div className="filter-section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17h14v-5H5v5zm0 0v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"/>
              </svg>
              <span>Make and model</span>
            </div>
            
            <div className="filter-subsection">
              <label className="filter-sublabel">Make</label>
              <select
                className="filter-select"
                value={filters.make}
                onChange={(e) => handleChange('make', e.target.value)}
              >
                <option value="">Select Make</option>
                {filterOptions.makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div className="filter-subsection">
              <label className="filter-sublabel">Model</label>
              <select
                className="filter-select"
                value={filters.model}
                onChange={(e) => handleChange('model', e.target.value)}
                disabled={!filters.make}
              >
                <option value="">Select Model</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="filter-subsection">
              <label className="filter-sublabel">Model variant</label>
              <select
                className="filter-select"
                value={filters.submodel}
                onChange={(e) => handleChange('submodel', e.target.value)}
                disabled={!filters.make || !filters.model}
              >
                <option value="">All Variants</option>
                {availableVariants.map(variant => (
                  <option key={variant} value={variant}>{variant}</option>
                ))}
              </select>
            </div>
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
              <div className="input-with-error">
                <input
                  type="text"
                  className={`filter-input ${validationErrors.priceFrom ? 'error' : ''}`}
                  placeholder="From"
                  value={filters.priceFrom}
                  onChange={(e) => handleChange('priceFrom', e.target.value)}
                />
                {validationErrors.priceFrom && (
                  <span className="validation-error">{validationErrors.priceFrom}</span>
                )}
              </div>
              <span className="range-separator">to</span>
              <div className="input-with-error">
                <input
                  type="text"
                  className={`filter-input ${validationErrors.priceTo ? 'error' : ''}`}
                  placeholder="To"
                  value={filters.priceTo}
                  onChange={(e) => handleChange('priceTo', e.target.value)}
                />
                {validationErrors.priceTo && (
                  <span className="validation-error">{validationErrors.priceTo}</span>
                )}
              </div>
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
                {Array.from(
                  { length: filterOptions.yearRange.max - filterOptions.yearRange.min + 1 }, 
                  (_, i) => filterOptions.yearRange.max - i
                ).map(year => (
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
                {Array.from(
                  { length: filterOptions.yearRange.max - filterOptions.yearRange.min + 1 }, 
                  (_, i) => filterOptions.yearRange.max - i
                ).map(year => (
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
              <option value="">Select Gearbox</option>
              {filterOptions.transmissions.map(transmission => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
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
              <option value="">Select Body Type</option>
              {filterOptions.bodyTypes.map(bodyType => (
                <option key={bodyType} value={bodyType}>{bodyType}</option>
              ))}
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
              <option value="">Select Colour</option>
              {filterOptions.colours.map(colour => (
                <option key={colour} value={colour}>{colour}</option>
              ))}
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
              <option value="">Select Doors</option>
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
              <option value="">Select Seats</option>
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
              <option value="">Select Fuel Type</option>
              {filterOptions.fuelTypes.map(fuelType => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
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
              <option value="">Select Engine Size</option>
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
          <button className="clear-button" onClick={handleClearAll}>
            Clear all
          </button>
          <button className="search-button" onClick={handleApply}>
            Search cars
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
