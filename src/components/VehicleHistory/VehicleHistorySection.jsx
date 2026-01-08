import React, { useState, useEffect } from 'react';
import { checkVehicleHistory } from '../../services/vehicleHistoryService';
import './VehicleHistorySection.css';

const VehicleHistorySection = ({ vrm, historyCheckId }) => {
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCheck, setExpandedCheck] = useState(null);

  useEffect(() => {
    if (vrm) {
      fetchHistoryData();
    }
  }, [vrm]);

  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      const result = await checkVehicleHistory(vrm);
      setHistoryData(result.data || result);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vrm) {
    return (
      <div className="vehicle-history-section">
        <h2>This vehicle's history</h2>
        <div className="history-unavailable">
          <p>Vehicle registration number not available. Contact the seller for vehicle history information.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vehicle-history-section">
        <h2>This vehicle's history</h2>
        <div className="history-loading">
          <div className="loading-spinner-small"></div>
          <p>Loading vehicle history...</p>
        </div>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="vehicle-history-section">
        <h2>This vehicle's history</h2>
        <div className="history-error">
          <p>Unable to load vehicle history at this time.</p>
        </div>
      </div>
    );
  }

  // Map API data to check items
  const checks = [
    {
      id: 'stolen',
      label: 'Not recorded as stolen',
      passed: !historyData.isStolen,
      icon: '✓',
      details: historyData.isStolen && historyData.stolenDetails 
        ? `Reported on ${new Date(historyData.stolenDetails.reportedDate).toLocaleDateString()}`
        : 'This vehicle has not been reported as stolen according to official records.'
    },
    {
      id: 'scrapped',
      label: 'Not recorded as scrapped',
      passed: !historyData.isScrapped,
      icon: '✓',
      details: 'This vehicle has not been recorded as scrapped or destroyed.'
    },
    {
      id: 'imported',
      label: 'Not imported from another country',
      passed: !historyData.isImported,
      icon: '✓',
      details: 'This vehicle was not imported from another country.'
    },
    {
      id: 'exported',
      label: 'Not exported out of the UK',
      passed: !historyData.isExported,
      icon: '✓',
      details: 'This vehicle has not been exported out of the UK.'
    },
    {
      id: 'writtenOff',
      label: 'Never been written off',
      passed: !historyData.hasAccidentHistory,
      icon: '✓',
      details: historyData.hasAccidentHistory && historyData.accidentDetails
        ? `${historyData.accidentDetails.count} accident(s) recorded with ${historyData.accidentDetails.severity} severity.`
        : 'This vehicle has no recorded accident history or write-off status.'
    }
  ];

  const passedChecks = checks.filter(c => c.passed).length;

  return (
    <div className="vehicle-history-section">
      <h2>This vehicle's history</h2>
      
      <div className="history-summary">
        <div className="history-stat">
          <span className="stat-icon">👤</span>
          <div className="stat-details">
            <span className="stat-label">Owners</span>
            <span className="stat-value">{historyData.previousOwners || historyData.numberOfOwners || 'N/A'}</span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">🔑</span>
          <div className="stat-details">
            <span className="stat-label">Keys</span>
            <span className="stat-value">{historyData.numberOfKeys || historyData.keys || 'N/A'}</span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">📋</span>
          <div className="stat-details">
            <span className="stat-label">Service history</span>
            <span className="stat-value">{historyData.serviceHistory || 'Contact seller'}</span>
          </div>
        </div>
      </div>

      <div className="history-checks">
        <div className="checks-header">
          <span className="checks-title">Basic history check</span>
          <span className="checks-status">{passedChecks} checks passed</span>
        </div>

        {historyData.motStatus && (
          <div className="mot-info">
            <span className="mot-label">MOT information</span>
            <span className="mot-value">
              {historyData.motStatus === 'Valid' || historyData.motStatus === 'valid'
                ? historyData.motExpiryDate 
                  ? `MOT valid until ${new Date(historyData.motExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : '12 months MOT included'
                : historyData.motStatus}
            </span>
          </div>
        )}

        <div className="checks-list">
          {checks.map((check) => (
            <div 
              key={check.id} 
              className={`check-item ${check.passed ? 'passed' : 'failed'}`}
              onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
            >
              <div className="check-main">
                <span className="check-icon">{check.passed ? '✓' : '✗'}</span>
                <span className="check-label">{check.label}</span>
                <span className="check-expand">{expandedCheck === check.id ? '▲' : '▼'}</span>
              </div>
              {expandedCheck === check.id && (
                <div className="check-details">
                  <p>{check.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="view-all-history">
          <span className="history-icon">📋</span>
          View all checks and history
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleHistorySection;
