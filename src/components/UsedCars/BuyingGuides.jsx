import React from 'react';
import './BuyingGuides.css';

const BuyingGuides = () => {
  const guides = [
    {
      title: 'Choosing a fuel type',
      description: 'Petrol, diesel, electric or hybrid? Find the right fuel type for your needs',
      icon: '⛽',
      slug: 'fuel-types'
    },
    {
      title: 'Checking its history',
      description: 'Learn how to check a car\'s history and avoid costly surprises',
      icon: '📋',
      slug: 'car-history'
    },
    {
      title: 'Booking a test drive',
      description: 'What to look for and questions to ask during a test drive',
      icon: '🔑',
      slug: 'test-drive'
    },
    {
      title: 'Buying on finance',
      description: 'Understand your finance options and find the best deal',
      icon: '💳',
      slug: 'finance'
    },
    {
      title: 'Paying a private seller',
      description: 'Stay safe when buying from a private seller',
      icon: '💰',
      slug: 'private-seller'
    },
    {
      title: 'Sorting the paperwork',
      description: 'All the documents you need when buying a used car',
      icon: '📄',
      slug: 'paperwork'
    }
  ];

  return (
    <section className="buying-guides used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Guides to buying a used car</h2>
      </div>

      <div className="buying-guides-grid">
        {guides.map((guide) => (
          <a 
            key={guide.slug} 
            href={`/guides/${guide.slug}`}
            className="buying-guide-card"
          >
            <div className="guide-icon-large">{guide.icon}</div>
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default BuyingGuides;
