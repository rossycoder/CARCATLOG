import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellYourCarPage.css';

// Utility component for the main blue CTA cards
const CTACard = ({ title, benefits, isPrimary }) => {
  return (
    <div className="cta-card">
      <h3 className="cta-card-title">{title}</h3>
      <ul className="cta-benefits-list">
        {benefits.map((benefit, index) => (
          <li key={index} className="cta-benefit-item">
            <span className="check-icon">✓</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <button className="cta-button">
        Get Started
      </button>
      <div className="cta-terms">
        Terms and conditions apply.
      </div>
    </div>
  );
};

// Utility component for the "How to sell" steps
const StepCard = ({ icon, title, description }) => (
  <div className="step-card">
    <div className="step-icon-wrapper">
      {icon.startsWith('http') ? (
        <img src={icon} alt={title} className="step-icon-img" />
      ) : (
        <div className="step-icon-emoji">{icon}</div>
      )}
    </div>
    <h4 className="step-title">{title}</h4>
    <p className="step-description">{description}</p>
  </div>
);

// Utility component for guide cards
const GuideCard = ({ icon, title, description }) => (
  <div className="guide-card">
    <div className="guide-icon-wrapper">
      {icon.startsWith('http') ? (
        <img src={icon} alt={title} className="guide-icon-img" />
      ) : (
        <div className="guide-icon-emoji">{icon}</div>
      )}
    </div>
    <h4 className="guide-card-title">{title}</h4>
    <p className="guide-card-description">{description}</p>
  </div>
);

// Utility component for individual Trustpilot reviews
const ReviewCard = ({ score, reviewer, time, text }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < score ? 'star filled' : 'star empty'}>★</span>
    );
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-stars">
          {stars}
        </div>
        <span className="review-score">{score}/5</span>
      </div>
      <p className="review-text">"{text}"</p>
      <div className="review-footer">
        <p className="review-author">{reviewer}</p>
        <p className="review-time">Published {time}</p>
      </div>
    </div>
  );
};

// Utility component for FAQ items
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button 
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
        <span>{question}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Main Application Component
const SellYourCarPage = () => {
  const navigate = useNavigate();

  // --- Mock Data ---
  const heroCard1 = {
    title: "Advertise on CarCatALog",
    benefits: [
      "Reach millions of buyers online",
      "Get a market-leading valuation",
      "Automatic price updates and tips",
      "Simple one-off payment"
    ]
  };

  const heroCard2 = {
    title: "Sell fast for free",
    benefits: [
      "Sell to a trusted retailer",
      "Get an instant valuation & offer",
      "Collection from your home",
      "Money in your bank in hours"
    ]
  };

  const sellSteps = [
    { 
      icon: "📸", 
      title: "Take great photos", 
      description: "Taking good-quality photos means that the buyers have an accurate image of the car, and there won't be any issues after the sale." 
    },
    { 
      icon: "📋", 
      title: "Keep it snappy", 
      description: "There are a few documents you'll need to make sure you have before you sell your car." 
    },
    { 
      icon: "✅", 
      title: "Be honest", 
      description: "Make sure your vehicle description is accurate. Mention any faults, like scratches, so buyers know what they're getting ahead of time." 
    },
  ];

  const guides = [
    {
      icon: "🚗",
      title: "Preparing your car",
      description: "From keeping it clean to sorting repairs, here's how to get your car ready for sale."
    },
    {
      icon: "📝",
      title: "Creating your advert",
      description: "Good-quality adverts lead to a fast sale. Read our tips to create an effective advert."
    },
    {
      icon: "💳",
      title: "Taking payment",
      description: "Cash, bank transfer, cheque? Learn the best way to accept payment and keep yourself secure."
    },
    {
      icon: "🛡️",
      title: "Avoiding scams",
      description: "Learn how to stay safe online and protect yourself from fraud."
    }
  ];



  return (
    <div className="sell-your-car-page">
      {/* Section 1: Hero Header */}
      <section className="hero-header-section">
        <div className="hero-header-background">
          <div className="hero-header-content">
            <p className="hero-label">Sell your car</p>
            <h1 className="hero-main-title">
              More buyers than any other site*
            </h1>
          </div>
        </div>
      </section>

      {/* Section 2: Advertising Card */}
      <section className="advertising-card-section">
        <div className="advertising-card-container">
          <div className="advertising-card">
            <h2 className="advertising-card-title">
              Advertise on <span className="logo-car">Car</span><span className="logo-cat">Cat</span><span className="logo-alog">ALog</span>
            </h2>
            <ul className="advertising-card-benefits">
              <li><span className="checkmark">✓</span> Maximise your selling price</li>
              <li><span className="checkmark">✓</span> Advertise to over 10 million people each month—4x more than any other site*</li>
              <li><span className="checkmark">✓</span> Your sale, your terms. Sell when you're happy with the offer</li>
              <li><span className="checkmark">✓</span> Simple one-off payment, no hidden fees</li>
            </ul>
            <button className="advertising-card-button" onClick={() => navigate('/find-your-car')}>Start an advert</button>
            <a href="/advertising-prices" className="advertising-card-link">See advertising prices →</a>
          </div>
        </div>
      </section>

   
      {/* Section 3: Place an advert on CarCatALog */}
      <section className="advert-section">
        <div className="advert-container">
          <h2 className="advert-main-title">Place an advert on CarCatALog</h2>
          
          <div className="advert-content-wrapper">
            <div className="advert-left-panel">
              <div className="advert-logo-wrapper">
                <img 
                  src="/images/brands/logo.jpeg" 
                  alt="CarCatALog Logo" 
                  className="advert-logo-image"
                />
              </div>
              
              <div className="advert-text-content">
                <h3 className="advert-title">Advertise on CarCatALog</h3>
                <p className="advert-description">
                  With the UK's largest audience of car buyers, it's highly likely someone is currently searching our website for the car that's sat on your driveway. Speak with potential buyers directly to answers any questions and negotiate price.
                </p>
                
                <h3 className="advert-subtitle">Sell fast for free</h3>
              </div>
              
              <div className="advert-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
              </div>
            </div>
            
            <div className="advert-right-panel">
              <div className="advert-stat-box">
                <div className="advert-stat-number">86</div>
                <div className="advert-stat-label">million</div>
                <p className="advert-stat-description">
                  The number of cross-platform visits to our website each month***
                </p>
              </div>
              
            
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: How to sell your car, fast */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="section-title">
            How to sell your car, fast
          </h2>
          <div className="steps-grid">
            {sellSteps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4.5: Guides to selling your car */}
      <section className="guides-cards-section">
        <div className="guides-cards-container">
          <h2 className="section-title">
            Guides to selling your car
          </h2>
          <div className="guides-cards-grid">
            {guides.map((guide, index) => (
              <GuideCard key={index} {...guide} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default SellYourCarPage;
