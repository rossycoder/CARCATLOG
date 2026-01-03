import React from 'react';
import './FeaturedContent.css';

const FeaturedContent = ({ sections }) => {
  return (
    <section className="featured-content">
      {sections.map((section) => (
        <div 
          key={section.id} 
          className={`featured-section ${section.imagePosition === 'right' ? 'reverse' : ''}`}
        >
          <div className="featured-image">
            <img src={section.image} alt={section.title} />
          </div>
          <div className="featured-text">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeaturedContent;
