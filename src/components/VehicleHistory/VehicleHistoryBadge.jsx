import React from 'react';
import './VehicleHistoryBadge.css';

const VehicleHistoryBadge = ({ historyData, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="vehicle-history-badge loading">
        <div className="badge-header">
          <h3>Vehicle History Check</h3>
          <span className="loading-spinner">⏳</span>
        </div>
        <p className="loading-text">Checking vehicle history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-history-badge error">
        <div className="badge-header">
          <h3>Vehicle History Check</h3>
          <span className="status-icon">⚠️</span>
        </div>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!historyData) {
    return null;
  }

  const { hasAccidentHistory, isStolen, hasOutstandingFinance, checkDate, checkStatus } = historyData;

  // Determine overall status
  const hasIssues = hasAccidentHistory || isStolen || hasOutstandingFinance;
  const badgeClass = hasIssues ? 'has-issues' : 'clean';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`vehicle-history-badge ${badgeClass}`}>
      <div className="badge-header">
        <h3>Vehicle History Check</h3>
        {checkStatus === 'success' && (
          <span className="verified-badge">✓ Verified</span>
        )}
      </div>

      <div className="history-indicators">
        {/* Accident History */}
        <div className={`indicator ${hasAccidentHistory ? 'warning' : 'clear'}`}>
          <span className="indicator-icon">
            {hasAccidentHistory ? '⚠️' : '✓'}
          </span>
          <div className="indicator-content">
            <span className="indicator-label">Accident History</span>
            <span className="indicator-value">
              {hasAccidentHistory ? 'Reported' : 'No accidents reported'}
            </span>
          </div>
        </div>

        {/* Stolen Status */}
        <div className={`indicator ${isStolen ? 'danger' : 'clear'}`}>
          <span className="indicator-icon">
            {isStolen ? '🚨' : '✓'}
          </span>
          <div className="indicator-content">
            <span className="indicator-label">Theft Status</span>
            <span className="indicator-value">
              {isStolen ? 'Reported stolen' : 'Not reported stolen'}
            </span>
          </div>
        </div>

        {/* Outstanding Finance */}
        <div className={`indicator ${hasOutstandingFinance ? 'warning' : 'clear'}`}>
          <span className="indicator-icon">
            {hasOutstandingFinance ? '💰' : '✓'}
          </span>
          <div className="indicator-content">
            <span className="indicator-label">Finance Status</span>
            <span className="indicator-value">
              {hasOutstandingFinance ? 'Outstanding finance' : 'No outstanding finance'}
            </span>
          </div>
        </div>
      </div>

      {checkDate && (
        <div className="check-date">
          <small>Checked on {formatDate(checkDate)}</small>
        </div>
      )}

      {hasIssues && (
        <div className="warning-message">
          <p>⚠️ This vehicle has reported issues. Please review carefully before purchasing.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleHistoryBadge;
