import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckEmailPage.css';
import api from '../services/api';

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      if (response.data.success) setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-email-page">
      <div className="check-email-container">

        {/* Header nav */}
        <div className="check-email-header">
          <button className="back-button" onClick={() => navigate('/signin')}>
            ← Back
          </button>
          <button className="close-button" onClick={() => navigate('/')}>✕</button>
        </div>

        <div className="check-email-content">

          {/* Icon */}
          <div className="check-email-illustration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1>Check your email</h1>
          <p className="subtitle">We sent a verification link to your inbox</p>

          {/* Error banner */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Couldn't send email</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {sent ? (
            /* Success banner */
            <div className="success-message">
              <span className="success-icon">✅</span>
              <p>New verification link sent! Check your inbox and spam folder.</p>
            </div>
          ) : (
            <>
              {/* Email pill */}
              {email && (
                <div className="email-display">
                  <span>{email}</span>
                  <button className="edit-email-button" onClick={() => navigate('/signin')} title="Change email">✎</button>
                </div>
              )}

              <p className="spam-notice">
                Can't find the email? Check your junk/spam folder just in case.
              </p>

              <button
                className="resend-button"
                onClick={handleResendEmail}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send another link'}
              </button>

              <p className="check-email-hint">
                Link expires in 24 hours
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
