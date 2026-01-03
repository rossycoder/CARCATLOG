import React from 'react';
import './PromoSections.css';

const PromoSections = () => {
  return (
    <section className="promo-sections used-cars-section used-cars-section--wide">
      <div className="promo-grid">
        <div className="promo-card promo-valuation">
          <div className="promo-content">
            <h3>Have a car to part-exchange?</h3>
            <p>Get an instant online valuation for your current car</p>
            <button className="btn-primary">Value my car</button>
          </div>
        </div>

        <div className="promo-card promo-reviews">
          <div className="promo-content">
            <h3>Save time researching</h3>
            <p>Read expert and owner reviews to help you choose</p>
            <button className="btn-primary">Read reviews</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSections;
