import { useNavigate } from 'react-router-dom';
import './AdvertisingPromotionSection.css';

const AdvertisingPromotionSection = () => {
  const navigate = useNavigate();
  const advertisingBenefits = [
    {
      id: 'boost-amount',
      text: 'Boost the amount you can get for your car'
    },
    {
      id: 'package-options',
      text: 'Pick from our Bronze, Silver, or Gold options'
    },
    {
      id: 'stay-control',
      text: 'You stay in control – accept an offer only when it feels right'
    }
  ];

  const platformPromises = [
    {
      id: 'fair-pricing',
      text: 'Fair, clear, upfront pricing – no hidden twists'
    },
    {
      id: 'your-control',
      text: 'Your listing, your control – update or remove anytime'
    },
    {
      id: 'real-support',
      text: 'Real support from real people when you need it.'
    }
  ];

  const handleStartAdvert = () => {
    navigate('/find-your-car');
  };

  const handleAdvertisingPrices = () => {
    navigate('/sell-my-car/advertising-prices');
  };

  return (
    <section className="advertising-promotion-section">
      <div className="advertising-container">
        {/* Left Column - Advertise on CarCatALog */}
        <div className="advertising-column">
          <h2 className="advertising-heading">
            Advertise on
          </h2>
          <div className="brand-logo-container">
            <img 
              src="/images/brands/logo.jpeg" 
              alt="CarCatALog" 
              className="brand-logo-img"
            />
          </div>
          
          <div className="benefits-list">
            {advertisingBenefits.map((benefit) => (
              <div key={benefit.id} className="benefit-item">
                <div className="car-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <span className="benefit-text">{benefit.text}</span>
              </div>
            ))}
          </div>

          <button 
            className="start-advert-btn"
            onClick={handleStartAdvert}
          >
            Start your advert
          </button>

          <a 
            href="#" 
            className="pricing-link"
            onClick={(e) => {
              e.preventDefault();
              handleAdvertisingPrices();
            }}
          >
            Go to advertising prices →
          </a>
        </div>

        {/* Right Column - Our Promise */}
        <div className="promises-column">
          <h2 className="promises-heading">
            Our Promise
          </h2>
          <div className="brand-logo-container">
            <img 
              src="/images/brands/logo.jpeg" 
              alt="CarCatALog" 
              className="brand-logo-img"
            />
          </div>
          
          <div className="promises-list">
            {platformPromises.map((promise) => (
              <div key={promise.id} className="promise-item">
                <div className="car-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <span className="promise-text">{promise.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisingPromotionSection;