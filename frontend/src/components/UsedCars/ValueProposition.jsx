import React, { useState, useEffect } from 'react';
import './ValueProposition.css';

const ValueProposition = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: 'Pay the right price',
      description: 'We make it easy for you to find a great deal by showing you how the price compares to similar cars on the market.',
      badge: '£350 Below market average'
    },
    {
      id: 1,
      title: 'Car history checks',
      description: 'Every car undergoes a basic history check, based on the registration supplied. We\'ll never advertise a car where the check returned shows it was stolen, scrapped or written off beyond repair.',
      badge: 'Verified History'
    },
    {
      id: 2,
      title: 'Sellers you can trust',
      description: 'Read dealer reviews from like-minded car buyers so you can feel confident you\'re buying from someone you trust.',
      badge: 'Trusted Dealers'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="value-proposition used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Peace of mind, every step of the way</h2>
      </div>

      <div className="value-content">
        <div className="value-media">
          <div className="value-badges">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`value-badge ${index === activeSlide ? 'active' : ''}`}
              >
                <div className="badge-icon">
                  {index === 0 && '💰'}
                  {index === 1 && '✅'}
                  {index === 2 && '⭐'}
                </div>
                <p className="badge-text">{slide.badge}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="value-text">
          <div className="value-slides">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`value-slide ${index === activeSlide ? 'active' : ''}`}
              >
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
              </div>
            ))}
          </div>

          <div className="value-navigation">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`nav-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
