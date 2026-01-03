import React from 'react';
import './ValueProposition.css';

const ValueProposition = ({ benefits }) => {
  const getIconSymbol = (icon) => {
    const icons = {
      shield: '🛡️',
      delivery: '🚚',
      warranty: '✓',
      finance: '💳',
      support: '💬',
      exchange: '🔄'
    };
    return icons[icon] || '✓';
  };

  return (
    <section className="value-proposition">
      <div className="value-container">
        <div className="value-grid">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="value-item">
              <div className="value-icon">{getIconSymbol(benefit.icon)}</div>
              <h3 className="value-title">{benefit.title}</h3>
              <p className="value-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
