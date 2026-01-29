import { useState, useEffect } from 'react';
import { checkVehicleHistory } from '../../services/vehicleHistoryService';
import { validateVehicleHistory, formatValidationResults } from '../../utils/vehicleHistoryValidator';
import DataQualityWarning from './DataQualityWarning';
import './VehicleHistorySection.css';

const VehicleHistorySection = ({ vrm }) => {
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCheck, setExpandedCheck] = useState(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await checkVehicleHistory(vrm);
        const data = result.data || result;
        
        setHistoryData(data);
      } catch (err) {
        // Check if it's a service unavailable error (daily limit)
        if (err.status === 503 || err.isServiceUnavailable) {
          setError({
            message: err.message || 'Vehicle history service is temporarily unavailable',
            nextSteps: err.nextSteps || [
              'Try again in 24 hours',
              'Contact the seller for vehicle history information'
            ],
            isServiceUnavailable: true
          });
        }
        // Check if it's a 404 error
        else if (err.status === 404 || err.message.includes('404') || err.message.includes('not found')) {
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

    if (vrm) {
      fetchHistoryData();
    }
  }, [vrm]);

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
        <div className={`history-error ${error?.isNotFound ? 'history-not-found' : ''} ${error?.isServiceUnavailable ? 'history-service-unavailable' : ''}`}>
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
            {error?.isServiceUnavailable && (
              <p className="history-info-text">
                The vehicle history check service is temporarily unavailable due to daily usage limits. This is a temporary issue and will be resolved within 24 hours.
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
                historyData.writeOffCategory ||
                (historyData.accidentDetails?.severity && 
                 historyData.accidentDetails.severity !== 'unknown' && 
                 historyData.accidentDetails.severity !== null &&
                 historyData.accidentDetails.count > 0)),
      icon: '✓',
      details: (() => {
        // Check if vehicle has been written off
        const isWrittenOff = historyData.hasAccidentHistory === true || 
                            historyData.isWrittenOff === true;
        
        // Get severity category - check multiple possible fields
        const severity = historyData.writeOffCategory || 
                        historyData.accidentDetails?.severity;
        const hasValidSeverity = severity && 
                                severity !== 'unknown' && 
                                severity !== null && 
                                severity.trim() !== '' &&
                                historyData.accidentDetails?.count > 0;
        
        if (isWrittenOff && hasValidSeverity) {
          return `Recorded as Category ${severity.toUpperCase()} (insurance write-off)`;
        } else if (isWrittenOff) {
          return 'This vehicle has been recorded as written off or has accident history.';
        } else {
          return 'This vehicle has no recorded accident history or write-off status.';
        }
      })()
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
              {(() => {
                // Try multiple field names for owners
                const owners = historyData.numberOfPreviousKeepers !== undefined ? historyData.numberOfPreviousKeepers :
                              historyData.previousOwners !== undefined ? historyData.previousOwners :
                              historyData.numberOfOwners !== undefined ? historyData.numberOfOwners :
                              historyData.keeperChanges !== undefined ? historyData.keeperChanges :
                              null;
                
                // Show number if it's defined (including 0 for first owner)
                // Only show "Contact seller" if data is truly missing (null/undefined)
                return owners !== null && owners !== undefined ? owners : 'Contact seller';
              })()}
            </span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">🔑</span>
          <div className="stat-details">
            <span className="stat-label">Keys</span>
            <span className="stat-value">
              {(() => {
                const keys = historyData.numberOfKeys || historyData.keys;
                // Only show if explicitly set and not default value
                return (keys && keys > 0) ? keys : 'Contact seller';
              })()}
            </span>
          </div>
        </div>

        <div className="history-stat">
          <span className="stat-icon">📋</span>
          <div className="stat-details">
            <span className="stat-label">Service history</span>
            <span className="stat-value">
              {(() => {
                const serviceHistory = historyData.serviceHistory;
                // Check if service history is meaningful (not default placeholder)
                if (serviceHistory && 
                    serviceHistory !== 'Contact seller' && 
                    serviceHistory !== 'Unknown' &&
                    serviceHistory !== 'unknown') {
                  return serviceHistory;
                }
                // Check boolean flag
                if (historyData.hasServiceHistory === true) {
                  return 'Available';
                }
                return 'Contact seller';
              })()}
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
