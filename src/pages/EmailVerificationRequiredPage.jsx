import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './EmailVerificationRequiredPage.css';

const EmailVerificationRequiredPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get email from user context OR sessionStorage fallback
  const savedEmail = user?.email || sessionStorage.getItem('verificationEmail') || '';

  const [userEmail, setUserEmail] = useState(savedEmail);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleResendVerification = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setResendStatus('error');
      setResendMessage('Please enter a valid email address.');
      return;
    }

    // Save it for future use
    sessionStorage.setItem('verificationEmail', userEmail);

    setIsResending(true);
    setResendMessage('');
    setResendStatus('');

    try {
      const response = await api.post('/auth/resend-verification', {
        email: userEmail
      });

      if (response.data.success) {
        setResendStatus('success');
        setResendMessage('Verification email sent! Please check your inbox and spam folder.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendStatus('error');
      setResendMessage(
        error.response?.data?.message ||
        'Failed to send verification email. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = () => {
    logout();
    sessionStorage.removeItem('verificationEmail');
    navigate('/signin');
  };

  return (
    <div className="email-verification-required-page">
      <div className="verification-container">
        <div className="verification-content">
          <div className="verification-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22,6 12,13 2,6" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1>Email Verification Required</h1>

          <p className="verification-message">
            To access this feature and protect your account, please verify your email address first.
          </p>

          {/* Always show email input — pre-filled if we have it, editable if not */}
          <div className="email-input-section">
            <label htmlFor="verif-email" style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '600' }}>
              Your email address:
            </label>
            <input
              id="verif-email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email address"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '15px',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '8px'
              }}
            />
          </div>

          <div className="verification-steps">
            <h3>What to do next:</h3>
            <ol>
              <li>Click "Resend Verification Email" below</li>
              <li>Check your inbox for a message from CarCatalog</li>
              <li>Click the verification link in the email</li>
            </ol>
          </div>

          <div className="verification-actions">
            <button
              className="btn-primary"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              className="btn-secondary"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          {resendMessage && (
            <div className={`resend-message ${resendStatus}`}>
              {resendMessage}
            </div>
          )}

          <div className="help-section">
            <h4>Didn't receive the email?</h4>
            <ul>
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address above is correct</li>
              <li>Try clicking "Resend Verification Email" again</li>
              <li>Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequiredPage;