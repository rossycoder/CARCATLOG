import React from 'react';
import './StockCountInsight.css';

const StockCountInsight = ({ stockCount }) => {
  return (
    <section className="stock-count-insight">
      <div className="stock-count-content">
        <h2 className="stock-count-number">{stockCount?.toLocaleString()}</h2>
        <p className="stock-count-text">pre-owned cars ready and waiting</p>
        <button className="btn-primary btn-large">Find yours</button>
      </div>
    </section>
  );
};

export default StockCountInsight;
