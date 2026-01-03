import React from 'react';
import './TrustIndicators.css';

const TrustIndicators = ({ rating, reviewCount, features }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star">★</span>);
    }
    
    return stars;
  };

  return (
    <section className="trust-indicators">
      <div className="trust-container">
        <div className="trust-rating">
          <div className="rating-score">{rating.toFixed(1)}</div>
          <div className="rating-stars">{renderStars(rating)}</div>
          {reviewCount && <div className="rating-count">{reviewCount.toLocaleString()} reviews</div>}
        </div>
        
        {features && features.length > 0 && (
          <div className="trust-features">
            {features.map((feature, index) => (
              <div key={index} className="trust-feature">
                <span className="feature-icon">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustIndicators;
