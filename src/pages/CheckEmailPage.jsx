import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckEmailPage.css';
import api from '../services/api';

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get email from navigation state or sessionStorage fallback (survives page refresh)
  const email = location.state?.email || sessionStorage.getItem('verificationEmail') || '';
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please go back and sign up again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/resend-verification', { email });
      if (response.data.success) {
        setSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email. Please try again.');
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
                <strong>Couldn't send email</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {sent ? (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <p>New verification link sent! Please check your inbox (and spam folder).</p>
            </div>
          ) : (
            <>
              <p className="email-sent-text">
                A link to verify your email address has been sent to
              </p>

              <div className="email-display">
                <span>{email || 'your email address'}</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
