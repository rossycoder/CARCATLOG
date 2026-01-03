import './TrustIndicatorsSection.css';

function TrustIndicatorsSection() {
  return (
    <section className="trust-indicators-section">
      <div className="trust-container">
        <div className="CarCatALog-logo">
          <div className="logo-stripes">
            <div className="stripe red"></div>
            <div className="stripe black"></div>
          </div>
        </div>

        <h2 className="trust-title">
          Over 40 years of experience buying and selling cars
        </h2>
        
        <p className="trust-description">
          We've been helping people buy and sell cars since 1977. Over that time, we've valued 
          millions (maybe even billions!) of vehicles so you can trust us to give you a pretty good 
          idea of what it's worth.
        </p>

        <div className="trustpilot-rating">
          <div className="trustpilot-header">
            <svg className="trustpilot-star" width="24" height="24" viewBox="0 0 24 24" fill="#00b67a">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="trustpilot-text">Trustpilot</span>
          </div>
          
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="star-icon" width="20" height="20" viewBox="0 0 24 24" fill="#00b67a">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          
          <p className="rating-score">4.6/5</p>
          <p className="rating-count">Based on 104,247 reviews</p>
        </div>

        <button className="about-button">About CarCatALog</button>
      </div>
    </section>
  );
}

export default TrustIndicatorsSection;
