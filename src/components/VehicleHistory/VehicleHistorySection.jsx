import React, { useState, useEffect } from 'react';
import { checkVehicleHistory } from '../../services/vehicleHistoryService';
import { validateVehicleHistory, formatValidationResults } from '../../utils/vehicleHistoryValidator';
import DataQualityWarning from './DataQualityWarning';
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
      setError(null);
      const result = await checkVehicleHistory(vrm);
      setHistoryData(result.data || result);
    } catch (err) {
      console.error('Error fetching history:', err);
      
      // Check if it's a 404 error
      if (err.status === 404 || err.message.includes('404') || err.message.includes('not found')) {
        setError({
          message: err.message || 'No vehicle history found for this registration',
          nextSteps: err.nextSteps || [
            'Verify the registration number is correct',
            'Request vehicle history documents from the seller'
          ],
          isNotFound: true
        });
      } else {
        setError({
          message: err.message || 'Unable to load vehicle history',
          nextSteps: ['Try again later', 'Contact support if the problem persists'],
          isNotFound: false
        });
      }
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
        <div className={`history-error ${error?.isNotFound ? 'history-not-found' : ''}`}>
          <div className="history-summary">
            <div className="history-stat">
              <span className="stat-icon">👤</span>
              <div className="stat-details">
                <span className="stat-label">Owners</span>
                <span className="stat-value">Contact seller</span>
              </div>
            </div>

            <div className="history-stat">
              <span className="stat-icon">🔑</span>
              <div className="stat-details">
                <span className="stat-label">Keys</span>
                <span className="stat-value">Contact seller</span>
              </div>
            </div>

            <div className="history-stat">
              <span className="stat-icon">📋</span>
              <div className="stat-details">
                <span className="stat-label">Service history</span>
                <span className="stat-value">Contact seller</span>
              </div>
            </div>
          </div>
          
          <div className="history-message">
            <p>{error?.message || error || 'Vehicle history information is not available online for this vehicle.'}</p>
            {error?.nextSteps && error.nextSteps.length > 0 && (
              <div className="error-next-steps">
                <p className="next-steps-title">What you can do:</p>
                <ul>
                  {error.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
            {error?.isNotFound && (
              <p className="history-info-text">
                This vehicle may be new, recently imported, or the registration may be incorrect. Please contact the seller for detailed vehicle history information.
              </p>
            )}
          </div>
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
      passed: !(historyData.hasAccidentHistory === true || 
                historyData.isWrittenOff === true || 
                (historyData.accidentDetails?.severity && historyData.accidentDetails.severity !== 'unknown')),
      icon: '✓',
      details: (historyData.hasAccidentHistory === true || 
                historyData.isWrittenOff === true || 
                (historyData.accidentDetails?.severity && historyData.accidentDetails.severity !== 'unknown'))
        ? (historyData.accidentDetails?.severity && historyData.accidentDetails.severity !== 'unknown')
          ? `Recorded as Category ${historyData.accidentDetails.severity} (insurance write-off)`
          : `This vehicle has been recorded as written off or has accident history.`
        : 'This vehicle has no recorded accident history or write-off status.'
    }
  ];

  const passedChecks = checks.filter(c => c.passed).length;

  // Validate history data for contradictions
  const historyForValidation = {
    checks: checks.map(check => ({
      description: check.label,
      status: check.passed ? 'pass' : 'alert',
      details: check.details
    }))
  };
  
  const validation = validateVehicleHistory(historyForValidation);
  const validationDisplay = formatValidationResults(validation);

  return (
    <div className="vehicle-history-section">
      <h2>This vehicle's history</h2>
      
      <div className="history-summary">
        <div className="history-stat">
          <span className="stat-icon">👤</span>
          <div className="stat-details">
            <span className="stat-label">Owners</span>
            <span className="stat-value">
              {historyData.previousOwners || historyData.numberOfOwners || historyData.keeperChanges || 'Contact seller'}
            </span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">🔑</span>
          <div className="stat-details">
            <span className="stat-label">Keys</span>
            <span className="stat-value">
              {historyData.numberOfKeys || historyData.keys || '1'}
            </span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">📋</span>
          <div className="stat-details">
            <span className="stat-label">Service history</span>
            <span className="stat-value">
              {historyData.serviceHistory || historyData.hasServiceHistory ? 'Available' : 'Contact seller'}
            </span>
          </div>
        </div>
      </div>

      <div className="history-checks">
        <div className="checks-header">
          <span className="checks-title">Basic history check</span>
          <span className="checks-status">{passedChecks} checks passed</span>
        </div>

        {/* Show data quality warning if inconsistencies detected */}
        {validationDisplay && (
          <DataQualityWarning validation={validationDisplay} />
        )}

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

       
      </div>
    </div>
  );
};

export default VehicleHistorySection;
