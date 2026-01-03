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
  const [name, setName] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const from = location.state?.from?.pathname || '/';

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
          // Navigate to previous page or home
          navigate(from, { replace: true });
        } else {
          setError(result.message || 'Failed to sign in');
        }
      }
    } catch (err) {
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
      console.log(`Login with ${provider} - Coming soon`);
    }
  };

  const handleBack = () => {
    setShowPassword(false);
    setPassword('');
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
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder={isNewUser ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus={!isNewUser}
                />
              </div>

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
