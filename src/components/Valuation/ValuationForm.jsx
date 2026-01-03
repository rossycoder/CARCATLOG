import React, { useState } from 'react';
import './ValuationForm.css';

const ValuationForm = ({ onSubmit, loading = false, dvlaData = null, heroTitle = 'Get Your Car Valuation' }) => {
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [vrm, setVrm] = useState('');
  const [mileage, setMileage] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [derivative, setDerivative] = useState('');
  const [regMonth, setRegMonth] = useState('');
  const [regYear, setRegYear] = useState('');
  const [errors, setErrors] = useState({});

  const makes = ['Audi', 'BMW', 'Ford', 'Honda', 'Mercedes-Benz', 'Toyota', 'Volkswagen', 'Triumph'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const validateForm = () => {
    const newErrors = {};

    if (showDetailedForm) {
      if (!make) newErrors.make = 'Make is required';
      if (!model) newErrors.model = 'Model is required';
      if (!variant) newErrors.variant = 'Variant is required';
      if (!derivative) newErrors.derivative = 'Derivative is required';
      if (!regMonth) newErrors.regMonth = 'Registration month is required';
      if (!regYear) newErrors.regYear = 'Registration year is required';
      if (!mileage) {
        newErrors.mileage = 'Mileage is required';
      } else if (isNaN(mileage) || parseInt(mileage) < 0) {
        newErrors.mileage = 'Please enter a valid mileage';
      }
    } else {
      if (!vrm.trim()) {
        newErrors.vrm = 'Vehicle registration is required';
      } else if (vrm.length < 2) {
        newErrors.vrm = 'Please enter a valid registration';
      }

      if (!mileage) {
        newErrors.mileage = 'Mileage is required';
      } else if (isNaN(mileage) || parseInt(mileage) < 0) {
        newErrors.mileage = 'Please enter a valid mileage';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (showDetailedForm) {
        onSubmit({
          vrm: `${make.substring(0, 2).toUpperCase()}${regYear.toString().substring(2)}${model.substring(0, 3).toUpperCase()}`,
          mileage: parseInt(mileage),
          make,
          model,
          variant,
          derivative,
          regMonth,
          regYear
        });
      } else {
        onSubmit({
          vrm: vrm.toUpperCase().trim(),
          mileage: parseInt(mileage),
        });
      }
    }
  };

  const handleVrmChange = (e) => {
    const value = e.target.value.toUpperCase();
    setVrm(value);
    if (errors.vrm) {
      setErrors({ ...errors, vrm: null });
    }
  };

  const handleMileageChange = (e) => {
    const value = e.target.value;
    setMileage(value);
    if (errors.mileage) {
      setErrors({ ...errors, mileage: null });
    }
  };

  return (
    <div className="valuation-form-container">
      <div className="form-card-inner">
        <div className="form-header">
          <h2>Tell us about your car</h2>
          <p className="form-subtitle">Get an instant valuation - for free</p>
          {!showDetailedForm && dvlaData && (
            <div className="error-notice">
              We couldn't identify your car from its registration. Please choose the details here.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="valuation-form">
          {!showDetailedForm ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vrm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Vehicle Registration
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="vrm"
                      value={vrm}
                      onChange={handleVrmChange}
                      placeholder="e.g. AB12 CDE"
                      className={errors.vrm ? 'error' : ''}
                      disabled={loading}
                      maxLength={10}
                    />
                    <div className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                  </div>
                  {errors.vrm && <span className="error-message">{errors.vrm}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mileage">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Current Mileage
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="mileage"
                      value={mileage}
                      onChange={handleMileageChange}
                      placeholder="e.g. 50000"
                      className={errors.mileage ? 'error' : ''}
                      disabled={loading}
                      min="0"
                    />
                    <div className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                  </div>
                  {errors.mileage && <span className="error-message">{errors.mileage}</span>}
                </div>
              </div>
              
              <div className="form-toggle">
                <button 
                  type="button" 
                  className="toggle-link"
                  onClick={() => setShowDetailedForm(true)}
                >
                  Can't find your registration? Enter details manually
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="make">* Make:</label>
                <select
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className={errors.make ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select make</option>
                  {makes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.make && <span className="error-message">{errors.make}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="model">* Model:</label>
                <input
                  type="text"
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 1500"
                  className={errors.model ? 'error' : ''}
                  disabled={loading}
                />
                {errors.model && <span className="error-message">{errors.model}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="variant">* Variant:</label>
                <input
                  type="text"
                  id="variant"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. Custom Cruiser (2008 - 2015)"
                  className={errors.variant ? 'error' : ''}
                  disabled={loading}
                />
                {errors.variant && <span className="error-message">{errors.variant}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="derivative">* Derivative:</label>
                <input
                  type="text"
                  id="derivative"
                  value={derivative}
                  onChange={(e) => setDerivative(e.target.value)}
                  placeholder="e.g. 865 Custom Cruiser Petrol Manual (61 ps)"
                  className={errors.derivative ? 'error' : ''}
                  disabled={loading}
                />
                {errors.derivative && <span className="error-message">{errors.derivative}</span>}
              </div>

              <div className="form-group">
                <label>* Registration date:</label>
                <div className="date-selector">
                  <select
                    value={regMonth}
                    onChange={(e) => setRegMonth(e.target.value)}
                    className={errors.regMonth ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Month</option>
                    {months.map((month, idx) => (
                      <option key={month} value={idx + 1}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={regYear}
                    onChange={(e) => setRegYear(e.target.value)}
                    className={errors.regYear ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {(errors.regMonth || errors.regYear) && (
                  <span className="error-message">Please select registration date</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="mileage-detailed">* Mileage:</label>
                <input
                  type="number"
                  id="mileage-detailed"
                  value={mileage}
                  onChange={handleMileageChange}
                  placeholder="e.g. 3000"
                  className={errors.mileage ? 'error' : ''}
                  disabled={loading}
                  min="0"
                />
                {errors.mileage && <span className="error-message">{errors.mileage}</span>}
              </div>

              <div className="form-toggle">
                <button 
                  type="button" 
                  className="toggle-link"
                  onClick={() => setShowDetailedForm(false)}
                >
                  ← Back to registration lookup
                </button>
              </div>
            </>
          )}

          {dvlaData && (
            <div className="dvla-info">
              <div className="dvla-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h4>Vehicle Information</h4>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Make</span>
                  <span className="info-value">{dvlaData.make}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Model</span>
                  <span className="info-value">{dvlaData.model || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Year</span>
                  <span className="info-value">{dvlaData.yearOfManufacture}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fuel Type</span>
                  <span className="info-value">{dvlaData.fuelType}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Getting Valuation...
              </>
            ) : (
              <>
                <span>Get Valuation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="form-footer">
          <div className="trust-badges">
            <div className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secure</span>
            </div>
            <div className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>Instant</span>
            </div>
            <div className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationForm;
