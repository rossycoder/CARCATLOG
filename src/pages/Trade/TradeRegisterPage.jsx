import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerDealer } from '../../services/tradeDealerService';
import './TradeRegisterPage.css';

const TradeRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    tradingName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessAddress: '',
    businessRegistrationNumber: '',
    vatNumber: '',
    logo: null
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'businessName':
        if (!value.trim()) error = 'Business name is required';
        else if (value.length < 2) error = 'Business name must be at least 2 characters';
        break;
        
      case 'contactPerson':
        if (!value.trim()) error = 'Contact person is required';
        else if (value.length < 2) error = 'Contact person name must be at least 2 characters';
        break;
        
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
        
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^[\d\s()+-\s]{10,20}$/.test(value.replace(/\s/g, ''))) error = 'Invalid phone number';
        break;
        
      case 'password':
        if (!value.trim()) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain uppercase, lowercase and numbers';
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
        
      case 'businessRegistrationNumber':
        if (value && !/^[A-Za-z0-9]{6,12}$/.test(value)) error = 'Invalid registration number format';
        break;
        
      case 'vatNumber':
        if (value && !/^[A-Za-z]{2}[0-9]{9,12}$/.test(value)) error = 'Invalid VAT number format (e.g., GB123456789)';
        break;
        
      default:
        break;
    }
    
    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, logo: file }));
      setErrors(prev => ({ ...prev, logo: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('businessName', formData.businessName);
      submitData.append('tradingName', formData.tradingName);
      submitData.append('contactPerson', formData.contactPerson);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('businessAddress', formData.businessAddress);
      submitData.append('businessRegistrationNumber', formData.businessRegistrationNumber);
      submitData.append('vatNumber', formData.vatNumber);
      
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      const data = await registerDealer(submitData);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/trade/login');
        }, 3000);
      } else {
        setErrors({ form: data.message || 'Registration failed' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setErrors({ form: errorMessage });
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus first field on mount
  useEffect(() => {
    document.getElementById('businessName')?.focus();
  }, []);

  if (success) {
    return (
      <div className="trade-register-page">
        <div className="trade-register-container">
          <div className="success-message">
            <h2>Registration Successful!</h2>
            <p>Please check your email to verify your account.</p>
            <p>We've sent a verification link to your email address.</p>
            <p style={{ marginTop: '20px', color: '#7f8c8d' }}>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-register-page">
      <div className="trade-register-container" style={{ backgroundColor: '#ffffff' }}>
        <div className="trade-register-header">
          <h1>Register as Trade Dealer</h1>
          <p>Join our platform and start selling vehicles</p>
        </div>

        <form onSubmit={handleSubmit} className="trade-register-form" noValidate style={{ backgroundColor: '#ffffff' }}>
          {errors.form && (
            <div className="form-error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM9 12H7V10H9V12ZM9 8H7V4H9V8Z" fill="currentColor"/>
              </svg>
              <span>{errors.form}</span>
            </div>
          )}
          
          <div className="form-section">
            <h3>Business Information</h3>
            
            <div className="form-group full-width">
              <label htmlFor="businessName">
                Business Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., Premium Motors Ltd"
                className={touched.businessName && errors.businessName ? 'error' : ''}
              />
              {touched.businessName && errors.businessName && (
                <div className="field-error">{errors.businessName}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="logo">
                Business Logo
              </label>
              <div className="logo-upload-container">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo" className="logo-upload-label">
                  {logoPreview ? (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" />
                      <span className="logo-change-text">Click to change</span>
                    </div>
                  ) : (
                    <div className="logo-upload-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Click to upload logo</span>
                      <span className="logo-hint">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
              {errors.logo && (
                <div className="field-error">{errors.logo}</div>
              )}
              <div className="field-hint">
                This logo will appear on all your vehicle listings
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tradingName">Trading Name</label>
                <input
                  type="text"
                  id="tradingName"
                  name="tradingName"
                  value={formData.tradingName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Premium Cars"
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessRegistrationNumber">Company Registration</label>
                <input
                  type="text"
                  id="businessRegistrationNumber"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 12345678"
                  className={touched.businessRegistrationNumber && errors.businessRegistrationNumber ? 'error' : ''}
                />
                {touched.businessRegistrationNumber && errors.businessRegistrationNumber && (
                  <div className="field-error">{errors.businessRegistrationNumber}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vatNumber">VAT Number</label>
                <input
                  type="text"
                  id="vatNumber"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., GB123456789"
                  className={touched.vatNumber && errors.vatNumber ? 'error' : ''}
                />
                {touched.vatNumber && errors.vatNumber && (
                  <div className="field-error">{errors.vatNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="businessAddress">Business Address</label>
                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="3"
                  placeholder="123 High Street, London"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-group full-width">
              <label htmlFor="contactPerson">
                Contact Person <span className="required">*</span>
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., John Smith"
                className={touched.contactPerson && errors.contactPerson ? 'error' : ''}
              />
              {touched.contactPerson && errors.contactPerson && (
                <div className="field-error">{errors.contactPerson}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="contact@company.com"
                  className={touched.email && errors.email ? 'error' : ''}
                />
                {touched.email && errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="07123 456789"
                  className={touched.phone && errors.phone ? 'error' : ''}
                />
                {touched.phone && errors.phone && (
                  <div className="field-error">{errors.phone}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Minimum 8 characters"
                  className={touched.password && errors.password ? 'error' : ''}
                />
                {touched.password && errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
                <div className="password-hint">
                  Must contain uppercase, lowercase, and numbers
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Re-enter password"
                  className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="field-error">{errors.confirmPassword}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-submit-section">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            
            <div className="terms-notice">
              By registering, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </form>

        <div className="trade-register-links">
          <p>Already have an account? <Link to="/trade/login">Login here</Link></p>
          <p className="login-hint">
            Or <Link to="/register">register as a regular user</Link>
          </p>
        </div>

        <div className="trade-register-footer">
          <Link to="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default TradeRegisterPage;