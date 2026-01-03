import React, { useState } from 'react';
import './ValuationResult.css';

const ValuationResult = ({ valuationData, onAcceptPrice, onCustomPrice }) => {
  const [customPriceValue, setCustomPriceValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!valuationData) {
    return null;
  }

  const { estimatedValue, confidence, factors, marketConditions, validUntil } = valuationData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getConfidenceColor = (conf) => {
    switch (conf) {
      case 'high':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleAcceptPrice = () => {
    onAcceptPrice(estimatedValue.private);
  };

  const handleCustomPriceSubmit = () => {
    const price = parseFloat(customPriceValue);
    if (price > 0) {
      onCustomPrice(price);
    }
  };

  return (
    <div className="valuation-result">
      <div className="result-header">
        <h2>Your Vehicle Valuation</h2>
        <div className="confidence-badge" style={{ background: getConfidenceColor(confidence) }}>
          {confidence.toUpperCase()} CONFIDENCE
        </div>
      </div>

      <div className="valuation-prices">
        <div className="price-card featured">
          <div className="price-label">Private Sale</div>
          <div className="price-value">{formatCurrency(estimatedValue.private)}</div>
          <div className="price-description">Selling privately</div>
        </div>

        <div className="price-card">
          <div className="price-label">Trade-In</div>
          <div className="price-value">{formatCurrency(estimatedValue.trade)}</div>
          <div className="price-description">Part exchange</div>
        </div>

        <div className="price-card">
          <div className="price-label">Retail</div>
          <div className="price-value">{formatCurrency(estimatedValue.retail)}</div>
          <div className="price-description">Dealer price</div>
        </div>
      </div>

      {factors && factors.length > 0 && (
        <div className="valuation-factors">
          <h3>Factors Affecting Value</h3>
          <div className="factors-list">
            {factors.map((factor, index) => (
              <div key={index} className={`factor-item ${factor.impact}`}>
                <span className="factor-icon">
                  {factor.impact === 'positive' && '↑'}
                  {factor.impact === 'negative' && '↓'}
                  {factor.impact === 'neutral' && '→'}
                </span>
                <div className="factor-content">
                  <div className="factor-name">{factor.name}</div>
                  <div className="factor-description">{factor.description}</div>
                </div>
                {factor.valueImpact !== 0 && (
                  <div className="factor-impact">
                    {factor.valueImpact > 0 ? '+' : ''}
                    {formatCurrency(factor.valueImpact)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {marketConditions && (
        <div className="market-conditions">
          <h3>Market Conditions</h3>
          <div className="conditions-grid">
            <div className="condition-item">
              <span className="condition-label">Demand</span>
              <span className={`condition-value ${marketConditions.demand}`}>
                {marketConditions.demand.toUpperCase()}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Supply</span>
              <span className={`condition-value ${marketConditions.supply}`}>
                {marketConditions.supply.toUpperCase()}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Trend</span>
              <span className={`condition-value ${marketConditions.trend}`}>
                {marketConditions.trend === 'rising' && '📈'}
                {marketConditions.trend === 'stable' && '➡️'}
                {marketConditions.trend === 'falling' && '📉'}
                {' '}
                {marketConditions.trend.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        {!showCustomInput ? (
          <>
            <button className="btn-primary" onClick={handleAcceptPrice}>
              Use This Price
            </button>
            <button className="btn-secondary" onClick={() => setShowCustomInput(true)}>
              Enter Custom Price
            </button>
          </>
        ) : (
          <div className="custom-price-input">
            <input
              type="number"
              value={customPriceValue}
              onChange={(e) => setCustomPriceValue(e.target.value)}
              placeholder="Enter your price"
              min="0"
            />
            <button className="btn-primary" onClick={handleCustomPriceSubmit}>
              Confirm Price
            </button>
            <button className="btn-secondary" onClick={() => setShowCustomInput(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {validUntil && (
        <div className="validity-notice">
          <small>This valuation is valid until {formatDate(validUntil)}</small>
        </div>
      )}

      <div className="suggested-price-note">
        <p>💡 Suggested price: {formatCurrency(estimatedValue.private)} will be shown as reference</p>
      </div>
    </div>
  );
};

export default ValuationResult;
