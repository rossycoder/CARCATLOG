import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { breadcrumbSchema } from '../utils/seoSchemas';
import './SellYourCarPage.css';

// Utility component for the main blue CTA cards
const CTACard = ({ title, benefits }) => {
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
      title: "Take high quality photos", 
      description: "Use clear, high-quality images to show the car accurately. This helps buyers understand the vehicle's condition." 
    },
    { 
      icon: "📋", 
      title: "Have documents ready", 
      description: "Make sure you have all required paperwork ready before listing your car. Having the correct documents helps the sale go smoothly and avoids delays or complications." 
    },
    { 
      icon: "✅", 
      title: "Honesty is key", 
      description: "Ensure your vehicle description is accurate and complete. Clearly mention any faults, such as scratches or wear, so buyers know exactly what to expect before purchasing." 
    }
  ];

  const guides = [
    {
      icon: "🚗",
      title: "Preparing your car",
      description: "A well-written, high-quality advert attracts more buyers and helps your car sell faster." 
    },
    {
      icon: "📝",
      title: "Creating your advert",
      description: "A well-written, high-quality advert attracts more buyers and helps your car sell faster." 
    },
    {
      icon: "💳",
      title: "Taking payment",
        description: "Instant bank transfer is the safest method of payment. Ensure funds have cleared prior to handing over your car." 
    },
    {
      icon: "🛡️",
      title: "Avoiding scams",
      description: "Ensure you check online for most common scams to watch out for." 
    }
  ];



  return (
    <>
      <SEOHelmet 
        title="Sell Your Car Fast | Free Valuation & Easy Listing | CarCatlog"
        description="Sell your car quickly and easily on UK's newest vehicle listing platform. Get a free instant valuation, create your listing in minutes, and reach thousands of potential buyers."
        keywords="sell my car, car valuation, sell car online, quick car sale, free car valuation UK, advertise car, private car sale"
        url="/sell-your-car"
        schema={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Sell Your Car', url: '/sell-your-car' }
        ])}
      />
      <div className="sell-your-car-page">
        {/* Section 1: Hero Header */}
        <section className="hero-header-section">
          <div className="hero-header-background">
            <div className="hero-header-content">
              <p className="hero-label">Sell your car</p>
              <h1 className="hero-main-title">
                Advertise your car on UK's Newest vehicle listing platform
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

      {/* Section 4: Tips to selling your car */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="section-title">
             Tips to sell you car,quickly 
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
            Tips to sell you car
          </h2>
          <div className="guides-cards-grid">
            {guides.map((guide, index) => (
              <GuideCard key={index} {...guide} />
            ))}
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default SellYourCarPage;
