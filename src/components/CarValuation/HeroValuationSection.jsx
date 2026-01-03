import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroValuationSection.css';

function HeroValuationSection() {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState('');
  const [mileage, setMileage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!registration.trim()) {
      newErrors.registration = 'Please enter your vehicle registration';
    }

    if (!mileage.trim()) {
      newErrors.mileage = 'Please enter a valid mileage';
    } else if (isNaN(mileage) || Number(mileage) < 0 || Number(mileage) > 500000) {
      newErrors.mileage = 'Please enter a realistic mileage';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Navigate to the valuation page with the form data
    navigate('/valuation', {
      state: {
        vrm: registration,
        mileage: mileage
      }
    });
  };

  return (
    <section className="hero-valuation-section">
      <div className="hero-valuation-container">
        <p className="hero-label">Value my car</p>
        <h1 className="hero-title">In the know, in 10 seconds</h1>
        
        <div className="valuation-form-wrapper">
          <form className="valuation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="registration">Registration</label>
              <input
                id="registration"
                type="text"
                placeholder="e.g. AB12 CDE"
                value={registration}
                onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                className={errors.registration ? 'error' : ''}
                aria-label="Vehicle registration"
              />
              {errors.registration && (
                <span className="error-message">{errors.registration}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="mileage">Current mileage</label>
              <input
                id="mileage"
                type="text"
                placeholder="e.g. 10000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className={errors.mileage ? 'error' : ''}
                aria-label="Vehicle mileage"
              />
              {errors.mileage && (
                <span className="error-message">{errors.mileage}</span>
              )}
            </div>
            
            <button type="submit" className="cta-button">
              Get my instant valuation
            </button>
          </form>
        </div>

        <p className="hero-tagline">Quick. Free. No obligation.</p>
      </div>
    </section>
  );
}

export default HeroValuationSection;
