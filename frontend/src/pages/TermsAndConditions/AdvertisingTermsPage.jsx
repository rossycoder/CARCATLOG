import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { advertisingTermsContent } from './utils/advertisingTermsContent.js';
import './AdvertisingTermsPage.css';

function AdvertisingTermsPage() {
  const [activeTab, setActiveTab] = useState('private');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentContent = advertisingTermsContent[activeTab];

  return (
    <div className="advertising-terms-page">
      <div className="terms-hero">
        <div className="terms-hero-content">
          <h1>Advertising Terms and Conditions</h1>
         
        </div>
      </div>

      <div className="terms-tabs-container">
        <div className="terms-tabs">
          <button
            className={`terms-tab ${activeTab === 'private' ? 'active' : ''}`}
            onClick={() => setActiveTab('private')}
          >
            👤 Private Seller Terms
          </button>
          <button
            className={`terms-tab ${activeTab === 'trade' ? 'active' : ''}`}
            onClick={() => setActiveTab('trade')}
          >
            🏢 Trade Dealer Terms
          </button>
        </div>
      </div>

      <div className="terms-container">
        <div className="terms-content">
          <div className="terms-badge" style={{
            background: activeTab === 'private' 
              ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' 
              : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            color: activeTab === 'private' ? '#1565c0' : '#2e7d32'
          }}>
            <span>{currentContent.badge}</span>
          </div>

          {currentContent.sections.map((section) => (
            <section key={section.id} className="terms-section">
              <h2>{section.title}</h2>
              
              {section.subsections.map((subsection, idx) => (
                <div key={idx}>
                  {subsection.title && <h3>{subsection.title}</h3>}
                  <p>{subsection.content}</p>
                </div>
              ))}
            </section>
          ))}

          <div className="terms-footer">
            <p className="last-updated">Last updated: December 2025</p>
            <div className="terms-actions">
              <Link to="/sell-my-car/advertising-prices" className="btn-primary">
                View Advertising Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvertisingTermsPage;
