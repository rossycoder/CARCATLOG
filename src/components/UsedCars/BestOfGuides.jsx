import React from 'react';
import './BestOfGuides.css';

const BestOfGuides = () => {
  const guides = [
    {
      title: 'Best small cars',
      tagline: 'Nippy, efficient, and perfect for tight spaces',
      icon: '🚗',
      slug: 'best-small-cars'
    },
    {
      title: 'Best electric cars',
      tagline: 'Zero emissions, low running costs',
      icon: '⚡',
      slug: 'best-electric-cars'
    },
    {
      title: 'Best family cars',
      tagline: 'Space, safety, and comfort for everyone',
      icon: '👨‍👩‍👧‍👦',
      slug: 'best-family-cars'
    },
    {
      title: 'Best cars for students',
      tagline: 'Affordable, reliable, and cheap to run',
      icon: '🎓',
      slug: 'best-student-cars'
    }
  ];

  return (
    <section className="best-of-guides used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Top picks from the experts</h2>
      </div>

      <div className="guides-grid">
        {guides.map((guide) => (
          <a 
            key={guide.slug} 
            href={`/guides/${guide.slug}`}
            className="guide-card"
          >
            <div className="guide-icon">{guide.icon}</div>
            <h3>{guide.title}</h3>
            <p>{guide.tagline}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default BestOfGuides;
