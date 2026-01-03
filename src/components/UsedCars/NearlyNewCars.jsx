import React from 'react';
import './NearlyNewCars.css';

const NearlyNewCars = () => {
  return (
    <section className="nearly-new-cars used-cars-section used-cars-section--wide">
      <div className="nearly-new-content">
        <div className="nearly-new-text">
          <h2>Nearly new cars</h2>
          <h3>New car feeling, without the price tag</h3>
          <p>Discover low-mileage, nearly new cars that offer the best of both worlds - modern features and significant savings.</p>
          <button className="btn-primary">Learn more</button>
        </div>
        <div className="nearly-new-image">
          <div className="car-placeholder">🚗</div>
        </div>
      </div>
    </section>
  );
};

export default NearlyNewCars;
