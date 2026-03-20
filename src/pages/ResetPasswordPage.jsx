import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Auto-login user
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          setToken(data.data.token);
          setUser(data.data.user);
        }
      } else {
        if (data.message?.includes('expired') || data.message?.includes('Invalid')) {
          setTokenValid(false);
        }
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Unable to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="error-icon">⚠️</div>
            <h1 className="reset-password-title">Invalid or Expired Link</h1>
            <p className="error-description">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Link
            </Link>
            <Link to="/signin" className="back-link">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="success-icon">✓</div>
            <h1 className="reset-password-title">Password Reset!</h1>
            <p className="success-message">
              Your password has been successfully reset. You are now signed in.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h1 className="reset-password-title">Reset your password</h1>
          <p className="reset-password-subtitle">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                New Password<span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
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
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password<span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
