import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card">

            {/* Green circle icon */}
            <div className="success-illustration">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <h1 className="success-title">Check your email</h1>

            <div className="success-email-box">
              <p>Password reset link sent to</p>
              <strong>{email}</strong>
            </div>

            <p className="success-message">
              If an account exists with this email, you'll receive a reset link shortly.
            </p>
            <p className="success-note">
              ⏱ The link expires in <strong>1 hour</strong>. Check your spam folder if you don't see the email.
            </p>

            <div className="divider" />

            <Link to="/signin" className="btn-primary">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h1 className="forgot-password-title">Forgot your password?</h1>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
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

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link to="/signin" className="back-link">
              ← Back to Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
