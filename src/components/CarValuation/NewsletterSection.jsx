import { useState } from 'react';
import './NewsletterSection.css';

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Store subscription
    const subscription = {
      email,
      timestamp: new Date().toISOString(),
      consent: true
    };
    
    console.log('Newsletter subscription:', subscription);
    
    setError('');
    setSuccess(true);
    setEmail('');
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <h2 className="newsletter-title">
          Send me great CarCatALog offers and the latest vehicle reviews
        </h2>
        
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="newsletter-input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? 'error' : ''}
              aria-label="Email address"
            />
            <button type="submit" className="newsletter-button">
              Sign up
            </button>
          </div>
          
          {error && <p className="newsletter-error">{error}</p>}
          {success && <p className="newsletter-success">Thank you for subscribing!</p>}
        </form>
        
        <p className="newsletter-privacy">
          By signing up, you agree to our privacy policy and terms of service. 
          You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}

export default NewsletterSection;
