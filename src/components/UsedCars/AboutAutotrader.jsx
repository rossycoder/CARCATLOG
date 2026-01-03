import React from 'react';
import './AboutCarCatALog.css';

const AboutCarCatALog = () => {
  return (
    <section className="about-CarCatALog used-cars-section">
      <div className="about-content">
        <div className="about-text">
          <div className="about-logo">
            <h2>CarCatALog</h2>
          </div>
          <h3>Used car experts since before the internet</h3>
          <p>
            For over 40 years, we've been helping people find their perfect car. 
            From our humble beginnings as a print magazine to becoming the UK's largest 
            digital automotive marketplace, we've always put our customers first.
          </p>
          <button className="btn-secondary">About CarCatALog</button>
        </div>

        <div className="trustpilot-widget">
          <div className="trustpilot-header">
            <span className="trustpilot-logo">Trustpilot</span>
            <span className="trustpilot-badge">Excellent</span>
          </div>
          <div className="trustpilot-stars">
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star half">★</span>
            <span className="rating-text">4.6 out of 5</span>
          </div>
          <p className="review-count">Based on 104,232 reviews</p>
          <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer" className="trustpilot-link">
            See all reviews
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutCarCatALog;
