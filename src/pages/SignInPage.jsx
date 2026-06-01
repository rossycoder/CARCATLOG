import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showConfirmPasswordText, setShowConfirmPasswordText] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

  const from = location.state?.from?.pathname || location.state?.from || '/';

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    return { score, feedback };
  };

  // Generate strong password
  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Handle password change
  const handlePasswordChange = (value) => {
    setPassword(value);
    if (isNewUser) {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleEmailContinue = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if email exists
      const { authService } = await import('../services/authService');
      const result = await authService.checkEmail(email);
      
      setIsNewUser(!result.data.exists);
      setShowPassword(true);
    } catch (err) {
      setError('Unable to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (isNewUser && !name) {
      setError('Please enter your name');
      return;
    }

    if (isNewUser && !confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (isNewUser && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isNewUser && passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isNewUser) {
        // Register new user
        const result = await register({ email, password, name });
        
        if (result.success) {
          // Check if email verification is required
          if (result.data.requiresVerification) {
            // Redirect to check email page
            navigate('/check-email', { state: { email } });
          } else {
            // Check if there are pending vehicle details
            const pendingVehicleDetails = localStorage.getItem('pendingVehicleDetails');
            if (pendingVehicleDetails && from === '/find-your-car') {
              // Clear the pending details
              localStorage.removeItem('pendingVehicleDetails');
            }
            // User is already logged in via register context
            navigate(from, { replace: true });
          }
        } else {
          setError(result.message || 'Failed to create account');
        }
      } else {
        // Login existing user using context
        const result = await login({ email, password });
        
        if (result.success) {
          // Check if there are pending vehicle details
          const pendingVehicleDetails = localStorage.getItem('pendingVehicleDetails');
          if (pendingVehicleDetails && from === '/find-your-car') {
            // Clear the pending details
            localStorage.removeItem('pendingVehicleDetails');
          }
          // Navigate to previous page or home
          navigate(from, { replace: true });
        } else {
          setError(result.message || 'Failed to sign in');
        }
      }
    } catch (err) {
      // Handle email verification required error
      if (err.requiresVerification) {
        navigate('/verify-email-required');
        return;
      }
      setError(err.message || (isNewUser ? 'Failed to create account' : 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      // Redirect to backend Google OAuth
      window.location.href = `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/auth/google`;
    } else if (provider === 'facebook') {
      // Redirect to backend Facebook OAuth
      window.location.href = `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/auth/facebook`;
    } else {
    }
  };

  const handleBack = () => {
    setShowPassword(false);
    setPassword('');
    setConfirmPassword('');
    setPasswordStrength({ score: 0, feedback: [] });
    setError('');
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="signin-card">
          <h1 className="signin-title">Sign in or create an account</h1>

          {!showPassword ? (
            // Email Step
            <form onSubmit={handleEmailContinue} className="signin-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address<span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="staySignedIn"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                />
                <label htmlFor="staySignedIn">Stay signed in</label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary">
                Continue
              </button>

              <div className="divider">
                <span>Or</span>
              </div>

              <button
                type="button"
                className="btn-social btn-apple"
                onClick={() => handleSocialLogin('apple')}
              >
                <svg className="social-icon apple-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              <button
                type="button"
                className="btn-social btn-google"
                onClick={() => handleSocialLogin('google')}
              >
                <span className="social-icon">G</span>
                Continue with Google
              </button>

              <button
                type="button"
                className="btn-social btn-facebook"
                onClick={() => handleSocialLogin('facebook')}
              >
                <span className="social-icon">f</span>
                Continue with Facebook
              </button>

              

              <p className="terms-text">
                By continuing you agree to the{' '}
                <a href="/terms" className="link">Terms and Conditions</a> and confirm you
                have read our{' '}
                <a href="/privacy" className="link">Privacy Notice</a>.
              </p>
            </form>
          ) : (
            // Password Step
            <form onSubmit={handleSignIn} className="signin-form">
              <button type="button" className="back-btn" onClick={handleBack}>
                ← Back
              </button>

              <div className="email-display">
                <span className="email-label">Email:</span>
                <span className="email-value">{email}</span>
              </div>

              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {isNewUser ? 'Create Password' : 'Password'}<span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    id="password"
                    className="form-input"
                    placeholder={isNewUser ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    autoFocus={!isNewUser}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPasswordText(!showPasswordText);
                    }}
                    aria-label={showPasswordText ? "Hide password" : "Show password"}
                  >
                    {showPasswordText ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                
                {isNewUser && (
                  <>
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className={`strength-fill strength-${passwordStrength.score}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="strength-text">
                          {passwordStrength.score === 0 && 'Very Weak'}
                          {passwordStrength.score === 1 && 'Weak'}
                          {passwordStrength.score === 2 && 'Fair'}
                          {passwordStrength.score === 3 && 'Good'}
                          {passwordStrength.score === 4 && 'Strong'}
                          {passwordStrength.score === 5 && 'Very Strong'}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="strength-feedback">
                            {passwordStrength.feedback.map((tip, index) => (
                              <div key={index} className="feedback-tip">• {tip}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {isNewUser && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password<span className="required">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPasswordText ? "text" : "password"}
                      id="confirmPassword"
                      className="form-input"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirmPasswordText(!showConfirmPasswordText);
                      }}
                      aria-label={showConfirmPasswordText ? "Hide password" : "Show password"}
                    >
                      {showConfirmPasswordText ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <div className="password-mismatch">Passwords do not match</div>
                  )}
                </div>
              )}

              {!isNewUser && (
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              )}

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading 
                  ? (isNewUser ? 'Creating account...' : 'Signing in...') 
                  : (isNewUser ? 'Create account' : 'Sign in')
                }
              </button>

              {isNewUser && (
                <p className="terms-text">
                  By creating an account you agree to the{' '}
                  <a href="/terms" className="link">Terms and Conditions</a> and{' '}
                  <a href="/privacy" className="link">Privacy Notice</a>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
