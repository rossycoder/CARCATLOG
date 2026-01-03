import './MeetTheSellerSection.css';

const MeetTheSellerSection = ({ seller, distance, postcode }) => {
  if (!seller) {
    return null;
  }

  const isTradeSeller = seller.type === 'trade';

  const handlePhoneClick = () => {
    if (seller.phoneNumber) {
      window.location.href = `tel:${seller.phoneNumber}`;
    }
  };

  const handleMessageClick = () => {
    // Handle message functionality
    console.log('Message seller');
  };

  const handleDirectionsClick = () => {
    if (postcode) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(postcode)}`, '_blank');
    }
  };

  return (
    <div className="meet-seller-section">
      <h2>Meet the seller</h2>
      
      {isTradeSeller ? (
        // Trade Seller Display
        <>
          <div className="seller-header">
            {seller.logo ? (
              <img src={seller.logo} alt={seller.businessName} className="seller-logo" />
            ) : (
              <div className="seller-logo">
                <span className="seller-logo-text">{seller.tradingName || seller.businessName || 'Jainf Motors'}</span>
              </div>
            )}
            
            <h3 className="seller-name">{seller.businessName || 'Zane Motors'}</h3>
            
            <div className="seller-location">
              <span className="location-icon">📍</span>
              <span>{seller.city || seller.locationName || 'Croydon'} • {distance || '10'} miles</span>
            </div>
          </div>

          {seller.rating && (
            <div className="seller-rating">
              <span className="rating-score">{seller.rating.toFixed(1)}</span>
              <span className="rating-star">⭐</span>
              <div className="rating-details">
                <span className="rating-text">
                  {seller.reviewCount || 0} reviews
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        // Private Seller Display
        <div className="seller-header">
          <div className="seller-type-badge">
            <span className="badge-icon">👤</span>
            <span className="badge-text">Private seller</span>
          </div>
          
          <div className="seller-location">
            <span className="location-icon">📍</span>
            <span>{seller.locationName && `${seller.locationName}, `}{postcode} • {distance ? `${distance} miles away` : 'Location available'}</span>
          </div>
        </div>
      )}

      <div className="seller-contact-buttons">
        {seller.phoneNumber && (
          <button className="contact-btn phone-btn" onClick={handlePhoneClick}>
            <span className="btn-icon">📞</span>
            {seller.phoneNumber}
          </button>
        )}
        
        <button className="contact-btn message-btn" onClick={handleMessageClick}>
          <span className="btn-icon">✉️</span>
          Message
        </button>
      </div>

      {postcode && (
        <div className="get-directions" onClick={handleDirectionsClick}>
          <span className="directions-icon">🧭</span>
          Get directions
        </div>
      )}

      {isTradeSeller && seller.stats && (
        <div className="seller-stats">
          <div className="stat-item">
            <span className="stat-label">Cars in stock</span>
            <span className="stat-value">{seller.stats.carsInStock || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Years in business</span>
            <span className="stat-value">{seller.stats.yearsInBusiness || 0}</span>
          </div>
        </div>
      )}

      {!isTradeSeller && (
        <div className="seller-notice">
          Seller's number has been protected. <a href="#">Learn more</a>
        </div>
      )}
    </div>
  );
};

export default MeetTheSellerSection;
