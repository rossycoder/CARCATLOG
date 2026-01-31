import { Link } from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <button onClick={scrollToTop} className="back-to-top-link">
          Back to top
        </button>

        <div className="footer-content">
          {/* Column 1 - Logo & Navigation Links */}
          <div className="footer-column footer-column-1">
            <div className="footer-logo">
              <img src="/images/brands/logo.jpeg" alt="CarMarket Logo" className="logo-image" />
            </div>
            <nav className="footer-nav">
              <Link to="/security">Security advice</Link>
              <Link to="/contact">Contact us</Link>
              <Link to="/about">About</Link>
              <Link to="/terms-and-conditions/advertising">Terms & conditions</Link>
            </nav>
            <Link to="/cookies" className="manage-cookies">Manage cookies</Link>
          </div>

          {/* Column 3 - Engagement & Legal */}
          <div className="footer-column footer-column-3">
            <div className="feedback-section">
              <h3>Help us improve our website</h3>
              <button className="feedback-btn">Send feedback</button>
            </div>

            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="social-icon" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube className="social-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="social-icon" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok className="social-icon" />
              </a>
            </div>

            <div className="app-badges">
              <div className="app-badge app-store-badge">
                <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="badge-text">
                  <span className="badge-subtitle">Download on the</span>
                  <span className="badge-title">App Store</span>
                </div>
              </div>
              
              <div className="app-badge google-play-badge">
                <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="badge-text">
                  <span className="badge-subtitle">GET IT ON</span>
                  <span className="badge-title">Google Play</span>
                </div>
              </div>
            </div>

            <div className="legal-text">
              <p className="copyright">Copyright © CCAL Group Ltd {new Date().getFullYear()}.</p>
              
              <div className="registered-office">
                <p><strong>Registered office</strong></p>
                <p>Saxon House</p>
                <p>27 Duke Street</p>
                <p>Chelmsford</p>
                <p>CM1 1HT</p>
                <p>Phone: 0330 1337 818</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
