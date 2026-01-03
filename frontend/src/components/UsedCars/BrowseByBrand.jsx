import React from 'react';
import './BrowseByBrand.css';

const BrowseByBrand = () => {
  const brands = [
    { name: 'Ford', count: '38,853', slug: 'ford' },
    { name: 'Volkswagen', count: '34,695', slug: 'volkswagen' },
    { name: 'Audi', count: '32,841', slug: 'audi' },
    { name: 'Mercedes-Benz', count: '29,830', slug: 'mercedes-benz' },
    { name: 'BMW', count: '36,685', slug: 'bmw' },
    { name: 'Toyota', count: '17,196', slug: 'toyota' },
    { name: 'Vauxhall', count: '24,771', slug: 'vauxhall' },
    { name: 'Nissan', count: '19,078', slug: 'nissan' },
    { name: 'Peugeot', count: '14,185', slug: 'peugeot' },
    { name: 'Hyundai', count: '12,456', slug: 'hyundai' },
    { name: 'Kia', count: '11,234', slug: 'kia' },
    { name: 'Renault', count: '10,987', slug: 'renault' }
  ];

  return (
    <section className="browse-by-brand used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Browse by brand</h2>
      </div>

      <div className="brands-grid">
        {brands.map((brand) => (
          <a 
            key={brand.slug} 
            href={`/cars/${brand.slug}`}
            className="brand-card"
          >
            <div className="brand-logo">
              <span className="brand-initial">{brand.name[0]}</span>
            </div>
            <div className="brand-info">
              <h3>{brand.name}</h3>
              <p>{brand.count} cars</p>
            </div>
          </a>
        ))}
      </div>

      <div className="view-all-brands">
        <a href="/brands" className="btn-secondary">
          View all brands
        </a>
      </div>
    </section>
  );
};

export default BrowseByBrand;
