import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VerifyEmailPage.css';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Auto-login the user
          if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Verification failed. The link may be expired or invalid.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, login, navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === 'verifying' && (
          <div className="verify-status">
            <div className="spinner"></div>
            <h1>Verifying your email...</h1>
            <p>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-status success">
            <div className="success-icon">✓</div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <p className="redirect-text">Redirecting you to the homepage...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-status error">
            <div className="error-icon">✕</div>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <div className="error-actions">
              <button 
                className="btn-primary" 
                onClick={() => navigate('/signin')}
              >
                Go to Sign In
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/')}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
