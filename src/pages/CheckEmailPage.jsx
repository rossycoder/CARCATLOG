import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckEmailPage.css';
import api from '../services/api';

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/resend-verification', { email });
      setMessage('Verification email sent successfully!');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email. Please try again.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/signin');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="check-email-page">
      <div className="check-email-container">
        <div className="check-email-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="check-email-content">
          <h1>Check your email</h1>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              <div>
                <strong>We can't send another link</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <p>{message}</p>
            </div>
          )}

          <p className="email-sent-text">
            A link to verify your email address has been sent to
          </p>

          <div className="email-display">
            <span>{email}</span>
            <button className="edit-email-button" onClick={handleBack}>
              ✎
            </button>
          </div>

          <p className="spam-notice">
            Can't find the email? Check your junk/spam folder just in case!
          </p>

          <button 
            className="resend-button" 
            onClick={handleResendEmail}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send another link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
