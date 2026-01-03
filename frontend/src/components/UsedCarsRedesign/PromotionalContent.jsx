import React from 'react';
import './PromotionalContent.css';

const PromotionalContent = ({ image, title, subtitle, price, features, cta }) => {
  return (
    <section className="promotional-content">
      <div className="promo-container">
        <div className="promo-text">
          <h2>{title}</h2>
          {subtitle && <p className="promo-subtitle">{subtitle}</p>}
          {price && <div className="promo-price">£{price}</div>}
          {features && features.length > 0 && (
            <ul className="promo-features">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          )}
          {cta && <button className="promo-cta">{cta}</button>}
        </div>
        <div className="promo-image">
          <img src={image} alt={title} />
        </div>
      </div>
    </section>
  );
};

export default PromotionalContent;
