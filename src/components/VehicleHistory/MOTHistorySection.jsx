import { useState, useEffect } from 'react';
import './MOTHistorySection.css';

const MOTHistorySection = ({ vrm, carData }) => {
  const [motHistory, setMotHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    if (vrm) {
      loadMOTHistory();
    } else {
      console.warn('MOTHistorySection - No VRM provided');
      setIsLoading(false);
      setError('No vehicle registration provided');
    }
  }, [vrm, carData]);

  const loadMOTHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try to use MOT data from car document or vehicle history
      if (carData) {
        // Check if MOT history array exists in car document
        if (carData.motHistory && Array.isArray(carData.motHistory) && carData.motHistory.length > 0) {
          console.log('[MOTHistory] ✅ Using MOT history from database:', carData.motHistory.length, 'tests');
          setMotHistory({
            tests: carData.motHistory,
            currentStatus: carData.motStatus || 'Unknown',
            expiryDate: carData.motExpiry || carData.motDue || carData.motExpiryDate,
            message: 'MOT history from vehicle database',
            source: 'car_document'
          });
          setIsLoading(false);
          return;
        }
        
        // Check if MOT history is in the populated vehicle history
        if (carData.historyCheckId && carData.historyCheckId.motHistory && 
            Array.isArray(carData.historyCheckId.motHistory) && carData.historyCheckId.motHistory.length > 0) {
          console.log('[MOTHistory] Using MOT history from vehicle history document:', carData.historyCheckId.motHistory.length, 'tests');
          setMotHistory({
            tests: carData.historyCheckId.motHistory,
            currentStatus: carData.historyCheckId.motStatus || carData.motStatus || 'Unknown',
            expiryDate: carData.historyCheckId.motExpiryDate || carData.motExpiry || carData.motDue,
            message: 'MOT history from vehicle history database',
            source: 'vehicle_history'
          });
          setIsLoading(false);
          return;
        }
        
        // Check for basic MOT status fields (fallback)
        console.log('[MOTHistory] MOT fields check:', {
          motStatus: carData.motStatus,
          motExpiryDate: carData.motExpiryDate,
          motDue: carData.motDue,
          motExpiry: carData.motExpiry
        });
        
        if (carData.motStatus || carData.motExpiryDate || carData.motDue || carData.motExpiry) {
          console.log('[MOTHistory] Using basic MOT data from car document');
          const motStatus = carData.motStatus || 'Unknown';
          const expiryDate = carData.motExpiryDate || carData.motDue || carData.motExpiry;
          
          setMotHistory({
            tests: [],
            currentStatus: motStatus,
            expiryDate: expiryDate,
            message: 'Basic MOT information from vehicle database (detailed history not available)',
            source: 'car_document_basic'
          });
          setIsLoading(false);
          return;
        }
        
        console.log('[MOTHistory] Car data structure:', JSON.stringify(carData, null, 2));
      }
      
      // If no MOT data found in car document, show informative message
      console.log('[MOTHistory] No MOT data found in car document');
      setMotHistory({
        tests: [],
        currentStatus: 'Information not available',
        message: 'MOT information is not available for this vehicle. This may be because the vehicle is new, recently imported, or MOT data has not been updated.',
        source: 'not_found'
      });
    } catch (err) {
      console.error('Error fetching MOT history:', err);
      setError({
        message: err.message || 'Unable to load MOT history',
        nextSteps: ['Try again later', 'Contact support if the problem persists'],
        isNotFound: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMileage = (mileage) => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('en-GB').format(mileage);
  };

  if (isLoading) {
    return (
      <div className="mot-history-section">
        <h2>MOT History</h2>
        <div className="mot-loading">
          <div className="loading-spinner-small"></div>
          <p>Loading MOT history...</p>
        </div>
      </div>
    );
  }

  if (!vrm) {
    return (
      <div className="mot-history-section">
        <h2>MOT History</h2>
        <div className="mot-error">
          <p>No vehicle registration number available for this vehicle.</p>
          <p className="mot-info-text">MOT history requires a valid UK registration number.</p>
        </div>
      </div>
    );
  }

  if (error || !motHistory) {
    return (
      <div className="mot-history-section">
        <h2>MOT History</h2>
        <div className={`mot-error ${error?.isNotFound ? 'mot-not-found' : ''}`}>
          <p>{error?.message || error || 'Unable to load MOT history at this time.'}</p>
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
            <p className="mot-info-text">
              This vehicle may be new, recently imported, or the registration may be incorrect.
            </p>
          )}
        </div>
      </div>
    );
  }

  const tests = motHistory.tests || motHistory.motTests || [];

  return (
    <div className="mot-history-section">
      <h2>MOT History</h2>
      
      {motHistory.currentStatus && (
        <div className="mot-current-status">
          <div className={`status-badge ${motHistory.currentStatus.toLowerCase()}`}>
            {motHistory.currentStatus === 'Valid' ? '✓' : '✗'} {motHistory.currentStatus}
          </div>
          {motHistory.expiryDate && (
            <div className="expiry-info">
              Expires: {formatDate(motHistory.expiryDate)}
            </div>
          )}
        </div>
      )}

      {tests.length > 0 ? (
        <div className="mot-tests-list">
          <div className="tests-header">
            <span className="tests-count">{tests.length} MOT test{tests.length !== 1 ? 's' : ''} recorded</span>
          </div>

          {tests.map((test, index) => (
            <div 
              key={index} 
              className={`mot-test-item ${(test.testResult || test.result)?.toLowerCase() || 'unknown'}`}
              onClick={() => setExpandedTest(expandedTest === index ? null : index)}
            >
              <div className="test-header">
                <div className="test-main-info">
                  <span className={`test-result-badge ${(test.testResult || test.result)?.toLowerCase() || 'unknown'}`}>
                    {(test.testResult || test.result) === 'PASSED' ? '✓ PASS' : 
                     (test.testResult || test.result) === 'FAILED' ? '✗ FAIL' : 
                     (test.testResult || test.result)}
                  </span>
                  <span className="test-date">{formatDate(test.testDate || test.completedDate)}</span>
                </div>
                <div className="test-secondary-info">
                  <span className="test-mileage">📏 {formatMileage(test.odometerValue || test.mileage)} miles</span>
                  <span className="test-expand">{expandedTest === index ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedTest === index && (
                <div className="test-details">
                  <div className="test-detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Test Number:</span>
                      <span className="detail-value">{test.testNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Expiry Date:</span>
                      <span className="detail-value">{formatDate(test.expiryDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Odometer:</span>
                      <span className="detail-value">{formatMileage(test.odometerValue || test.mileage)} miles</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Odometer Unit:</span>
                      <span className="detail-value">{test.odometerUnit || 'mi'}</span>
                    </div>
                  </div>

                  {test.rfrAndComments && test.rfrAndComments.length > 0 && (
                    <div className="test-comments">
                      <h4>Issues & Advisories</h4>
                      {test.rfrAndComments.map((comment, idx) => (
                        <div key={idx} className={`comment-item ${comment.type?.toLowerCase() || 'advisory'}`}>
                          <span className="comment-type">
                            {comment.type === 'FAIL' ? '✗ Failure' : 
                             comment.type === 'DANGEROUS' ? '⚠️ Dangerous' :
                             comment.type === 'MAJOR' ? '⚠️ Major' :
                             comment.type === 'MINOR' ? '⚠️ Minor' :
                             'ℹ️ Advisory'}
                          </span>
                          <span className="comment-text">{comment.text || comment.comment}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {test.defects && test.defects.length > 0 && (
                    <div className="test-defects">
                      <h4>Defects</h4>
                      {test.defects.map((defect, idx) => (
                        <div key={idx} className={`defect-item ${defect.type?.toLowerCase() || 'advisory'}`}>
                          <span className="defect-type">
                            {defect.dangerous ? '⚠️ Dangerous' :
                             defect.type === 'FAIL' ? '✗ Failure' :
                             'ℹ️ Advisory'}
                          </span>
                          <span className="defect-text">{defect.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {test.advisoryNotices && test.advisoryNotices.length > 0 && (
                    <div className="test-advisories">
                      <h4>Advisory Notices</h4>
                      {test.advisoryNotices.map((advisory, idx) => (
                        <div key={idx} className="advisory-item">
                          <span className="advisory-icon">ℹ️</span>
                          <span className="advisory-text">{advisory}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-mot-history">
          <p>No MOT history available for this vehicle.</p>
        </div>
      )}

      <div className="mot-info-footer">
        <p className="mot-disclaimer">
          MOT history data is provided by the DVSA and may not include the most recent test if it was conducted within the last 24 hours.
        </p>
      </div>
    </div>
  );
};

export default MOTHistorySection;
