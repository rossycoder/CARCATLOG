import React, { useState } from 'react';
import './ReserveSection.css';

const ReserveSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      cards: [
        {
          title: 'Build your deal, step-by-step',
          description: 'Add part exchange, finance and choose delivery or collection. We\'ll guide you through it all! Then complete the sale with the seller.',
          icon: '🔧'
        },
        {
          title: 'Peace of mind with a free vehicle history check',
          description: 'Order with confidence with our free vehicle history check to avoid costly surprises if you decide to buy.',
          icon: '📋'
        }
      ]
    },
    {
      id: 2,
      cards: [
        {
          title: 'Save time and do more online',
          description: 'Get ahead by sorting some of the details online. Or if you\'d like more support, you can talk it through with the dealer later.',
          icon: '⏰'
        }
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="reserve-section used-cars-section">
      <div className="reserve-content">
        <div className="reserve-text">
          <div className="reserve-badge">
            <h2>Reserve with CarCatALog</h2>
          </div>
          <h3>Reserve online with CarCatALog</h3>
          <p>Once you've found your car, build your deal to reserve online.</p>
          <button className="reserve-search-btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search 154,820 cars
          </button>
        </div>

        <div className="reserve-carousel">
          <div className="carousel">
            <button 
              className="carousel-nav carousel-nav--prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="carousel-container">
              <div 
                className="carousel-slides"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="carousel-slide">
                    {slide.cards.map((card, cardIndex) => (
                      <div key={cardIndex} className="info-card">
                        <div className="card-icon">
                          <span className="icon-emoji">{card.icon}</span>
                        </div>
                        <div className="card-content">
                          <h4>{card.title}</h4>
                          <p>{card.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="carousel-nav carousel-nav--next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReserveSection;
