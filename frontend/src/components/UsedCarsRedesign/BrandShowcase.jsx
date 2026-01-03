import React from 'react';
import './BrandShowcase.css';

const BrandShowcase = ({ brands, title }) => {
  return (
    <section className="brand-showcase">
      <div className="brand-container">
        {title && <h2 className="brand-title">{title}</h2>}
        <div className="brand-grid">
          {brands.map((brand) => (
            <div key={brand.name} className="brand-item">
              <img 
                src={brand.logo} 
                alt={brand.alt || `${brand.name} logo`}
                className="brand-logo"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
