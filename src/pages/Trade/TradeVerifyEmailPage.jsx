import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './TradeVerifyEmailPage.css';

const TradeVerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/trade/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Store the token
          if (data.token) {
            localStorage.setItem('tradeDealerToken', data.token);
          }

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/trade/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="trade-verify-email-page">
      <div className="trade-verify-email-container">
        {status === 'verifying' && (
          <div className="verify-status verifying">
            <div className="spinner"></div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-status success">
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to your dashboard...</p>
            <Link to="/trade/dashboard" className="btn-primary">
              Go to Dashboard Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-status error">
            <div className="error-icon">✕</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="error-actions">
              <Link to="/trade/register" className="btn-secondary">
                Register Again
              </Link>
              <Link to="/trade/login" className="btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <div className="verify-footer">
          <Link to="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default TradeVerifyEmailPage;
