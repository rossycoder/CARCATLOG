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
              <a href="#" className="app-badge app-store">
                <span className="badge-text">Download on the<br/><strong>App Store</strong></span>
              </a>
              <a href="#" className="app-badge google-play">
                <span className="badge-text">GET IT ON<br/><strong>Google Play</strong></span>
              </a>
            </div>

            <div className="legal-text">
              <p className="copyright">Copyright © CarMarket Limited {new Date().getFullYear()}.</p>
              
              <div className="registered-office">
                <p><strong>Registered office</strong></p>
                <p>Saxon House</p>
                <p>27 Duke Street</p>
                <p>Chelmsford</p>
                <p>CM1 1HT</p>
                <p>Phone: TBC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
