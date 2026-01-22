import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDetailedValuation } from '../services/valuationService';
import './VehicleValuationPage.css';

const VehicleValuationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const vrn = searchParams.get('vrn') || '';
  const initialMileage = searchParams.get('mileage') || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [derivative, setDerivative] = useState('');
  const [regYear, setRegYear] = useState(2012);
  const [regMonth, setRegMonth] = useState('');
  const [mileage, setMileage] = useState(initialMileage);
  const [errors, setErrors] = useState({});

  const makes = [
    'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 
    'Hyundai', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 
    'Mini', 'Nissan', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 
    'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Triumph', 'Vauxhall', 'Volkswagen', 'Volvo'
  ];
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  const validateForm = () => {
    const newErrors = {};
    
    if (!make) newErrors.make = 'Make is required';
    if (!model) newErrors.model = 'Model is required';
    if (!variant) newErrors.variant = 'Variant is required';
    if (!derivative) newErrors.derivative = 'Derivative is required';
    if (!regMonth) newErrors.regMonth = 'Registration month is required';
    if (!mileage) {
      newErrors.mileage = 'Mileage is required';
    } else if (isNaN(mileage) || parseInt(mileage) < 0) {
      newErrors.mileage = 'Please enter a valid mileage';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a VRM from the details or use the one from URL
      const generatedVrm = vrn || `${make.substring(0, 2).toUpperCase()}${regYear.toString().substring(2)}${model.substring(0, 3).toUpperCase()}`;
      
      const response = await getDetailedValuation(generatedVrm, parseInt(mileage));
      
      if (response.success) {
        // Navigate to identification page first
        navigate('/valuation/identification', {
          state: {
            valuationData: response.data.valuation,
            vehicleDetails: response.data.vehicleDetails,
            formData: { make, model, variant, derivative, regYear, regMonth, mileage, vrm: generatedVrm }
          }
        });
      } else {
        setError(response.error || 'Failed to get valuation');
      }
    } catch (err) {
      console.error('Valuation error:', err);
      
      // Handle specific error codes
      if (err.response?.data?.code === 'VALUATION_NOT_FOUND') {
        setError('We could not find valuation data for this vehicle. Please check the details and try again.');
      } else if (err.response?.data?.code === 'SERVICE_UNAVAILABLE') {
        setError('The valuation service is temporarily unavailable. Please try again later.');
      } else {
        setError(err.response?.data?.error || 'Unable to get valuation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByRegistration = () => {
    navigate('/valuation');
  };

  return (
    <div className="vehicle-valuation-page">
      <div className="valuation-content">
        <div className="valuation-header">
          <h1>Tell us about your car</h1>
          <p className="subtitle">Get an instant valuation - for free</p>
          <p className="error-notice">
            We couldn't identify your car from its registration. Please choose the details here.
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="valuation-form">
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
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={errors.model ? 'error' : ''}
              disabled={loading || !make}
            >
              <option value="">Select model</option>
              <option value="1500">1500</option>
              <option value="A3">A3</option>
              <option value="A4">A4</option>
              <option value="Golf">Golf</option>
              <option value="Focus">Focus</option>
              <option value="Corsa">Corsa</option>
            </select>
            {errors.model && <span className="error-message">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="variant">* Variant:</label>
            <select
              id="variant"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className={errors.variant ? 'error' : ''}
              disabled={loading || !model}
            >
              <option value="">Select variant</option>
              <option value="Custom Cruiser (2008 - 2015)">Custom Cruiser (2008 - 2015)</option>
              <option value="Sport (2010 - 2018)">Sport (2010 - 2018)</option>
              <option value="SE (2012 - 2020)">SE (2012 - 2020)</option>
            </select>
            {errors.variant && <span className="error-message">{errors.variant}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="derivative">* Derivative:</label>
            <select
              id="derivative"
              value={derivative}
              onChange={(e) => setDerivative(e.target.value)}
              className={errors.derivative ? 'error' : ''}
              disabled={loading || !variant}
            >
              <option value="">Select derivative</option>
              <option value="865 Custom Cruiser Petrol Manual (61 ps)">865 Custom Cruiser Petrol Manual (61 ps)</option>
              <option value="1.6 TDI SE Manual (105 ps)">1.6 TDI SE Manual (105 ps)</option>
              <option value="2.0 TSI Sport Auto (200 ps)">2.0 TSI Sport Auto (200 ps)</option>
            </select>
            {errors.derivative && <span className="error-message">{errors.derivative}</span>}
          </div>

          <div className="form-group">
            <label>* Registration date:</label>
            <div className="year-selector">
              <button 
                type="button" 
                className="year-nav"
                onClick={() => setRegYear(prev => prev - 1)}
                disabled={regYear <= currentYear - 29}
              >
                &lt;
              </button>
              <span className="year-display">{regYear}</span>
              <button 
                type="button" 
                className="year-nav"
                onClick={() => setRegYear(prev => prev + 1)}
                disabled={regYear >= currentYear}
              >
                &gt;
              </button>
            </div>
            <div className="month-grid">
              {months.map((month, idx) => (
                <button
                  key={month}
                  type="button"
                  className={`month-btn ${regMonth === (idx + 1).toString() ? 'selected' : ''}`}
                  onClick={() => setRegMonth((idx + 1).toString())}
                >
                  {month}
                </button>
              ))}
            </div>
            {errors.regMonth && <span className="error-message">{errors.regMonth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mileage">* Mileage:</label>
            <input
              type="number"
              id="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g. 3000"
              className={errors.mileage ? 'error' : ''}
              disabled={loading}
              min="0"
            />
            {errors.mileage && <span className="error-message">{errors.mileage}</span>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Getting valuation...' : 'Get valuation'}
          </button>

          <button
            type="button"
            className="search-by-reg-link"
            onClick={handleSearchByRegistration}
          >
            Search by vehicle registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default VehicleValuationPage;
