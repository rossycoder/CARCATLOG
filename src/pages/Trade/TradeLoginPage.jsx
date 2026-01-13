import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTradeDealer } from '../../context/TradeDealerContext';
import './TradeLoginPage.css';

const TradeLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useTradeDealer();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to subscription page first, then to dashboard after selecting a package
      navigate('/trade/subscription');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to subscription page to select a package
        navigate('/trade/subscription');
      } else {
        // Check if it's an email verification error
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
        } else {
          setError(result.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="trade-login-page">
      <div className="trade-login-container">
        <div className="trade-login-card">
          <h1 className="trade-login-title">Trade Dealer Login</h1>
          <p className="trade-login-subtitle">Access your dealer dashboard</p>

          <form onSubmit={handleSubmit} className="trade-login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address<span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password<span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
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

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="trade-login-links">
              <Link to="/forgot-password" className="link">Forgot password?</Link>
              <Link to="/trade/register" className="link">Register as Trade Dealer</Link>
            </div>

            <div className="divider">
              <span>Or</span>
            </div>

            <Link to="/" className="back-home-link">
              ← Back to Homepage
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeLoginPage;
