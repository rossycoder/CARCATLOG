import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="newsletter used-cars-section">
      <div className="newsletter-content">
        <h2>Send me great CarCatALog offers and the latest vehicle reviews</h2>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g name@example.com"
                required
                className="email-input"
              />
              <button type="submit" className="btn-primary">
                Sign up
              </button>
            </div>
            <p className="privacy-notice">
              By signing up, you agree to our{' '}
              <a href="/privacy-policy">privacy policy</a>. 
              You can unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="success-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#1f8300">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <p>Thanks for signing up! Check your email to confirm your subscription.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
