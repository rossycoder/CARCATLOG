import React, { useState } from 'react';
import './DataQualityWarning.css';

const DataQualityWarning = ({ validation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!validation || !validation.showWarning) {
    return null;
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-medium';
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`data-quality-warning ${getSeverityClass(validation.severity)}`}>
      <div className="warning-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="warning-icon">
          {getIcon(validation.severity)}
        </div>
        <div className="warning-content">
          <h4 className="warning-title">{validation.title}</h4>
          <p className="warning-message">{validation.message}</p>
        </div>
        <div className="warning-toggle">
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="warning-details">
          <div className="details-content">
            <h5>Details:</h5>
            {validation.details.map((detail, index) => (
              <div key={index} className="detail-item">
                <div className="detail-type">
                  <span className="detail-icon">{getIcon(detail.severity)}</span>
                  <strong>{detail.description}</strong>
                </div>
                {detail.details && (
                  <div className="detail-explanation">
                    {typeof detail.details === 'string' ? (
                      <p>{detail.details}</p>
                    ) : (
                      <div>
                        {detail.details.contradiction && (
                          <p><strong>Issue:</strong> {detail.details.contradiction}</p>
                        )}
                        {detail.recommendation && (
                          <p><strong>Recommendation:</strong> {detail.recommendation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="warning-footer">
            <p className="disclaimer">
              <strong>Note:</strong> This warning indicates potential data inconsistencies. 
              We recommend verifying this information with official sources or the seller.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityWarning;
