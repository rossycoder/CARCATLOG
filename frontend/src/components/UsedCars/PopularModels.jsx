import React from 'react';
import './PopularModels.css';

const PopularModels = () => {
  const models = [
    { name: 'Used Ford Fiesta', image: '🚗', slug: 'ford-fiesta' },
    { name: 'Used BMW 3 Series', image: '🚙', slug: 'bmw-3-series' },
    { name: 'Used Mercedes-Benz E Class', image: '🚘', slug: 'mercedes-e-class' },
    { name: 'Used Volkswagen Golf', image: '🚗', slug: 'vw-golf' },
    { name: 'Used Audi A4', image: '🚙', slug: 'audi-a4' },
    { name: 'Used Vauxhall Corsa', image: '🚗', slug: 'vauxhall-corsa' }
  ];

  return (
    <section className="popular-models used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Popular models in the UK</h2>
      </div>

      <div className="models-grid">
        {models.map((model) => (
          <a 
            key={model.slug} 
            href={`/cars/${model.slug}`}
            className="model-card"
          >
            <div className="model-image">
              <span className="model-icon">{model.image}</span>
            </div>
            <h3>{model.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
};

export default PopularModels;
