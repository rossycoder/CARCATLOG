import React, { useState, useEffect } from 'react';
import './MOTHistorySection.css';

const MOTHistorySection = ({ vrm }) => {
  const [motHistory, setMotHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    console.log('MOTHistorySection - VRM prop:', vrm);
    if (vrm) {
      fetchMOTHistory();
    } else {
      console.warn('MOTHistorySection - No VRM provided');
      setIsLoading(false);
      setError('No vehicle registration provided');
    }
  }, [vrm]);

  const fetchMOTHistory = async (testVrm = null) => {
    try {
      setIsLoading(true);
      let vrmToUse = testVrm || vrm;
      
      // Clean VRM: remove spaces and convert to uppercase
      if (vrmToUse) {
        vrmToUse = vrmToUse.replace(/\s+/g, '').toUpperCase();
      }
      
      console.log('Fetching MOT history for VRM:', vrmToUse);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${API_BASE_URL}/vehicle-history/mot/${vrmToUse}`;
      console.log('MOT API URL:', url);
      
      const response = await fetch(url);
      console.log('MOT API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('MOT API Error response:', errorText);
        throw new Error('Failed to fetch MOT history');
      }
      
      const result = await response.json();
      console.log('MOT API Result:', result);
      setMotHistory(result.data || result);
    } catch (err) {
      console.error('Error fetching MOT history:', err);
      setError(err.message);
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

  if (!vrm) {
    return null;
  }

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

  if (error || !motHistory) {
    return (
      <div className="mot-history-section">
        <h2>MOT History</h2>
        <div className="mot-error">
          <p>Unable to load MOT history at this time.</p>
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
              className={`mot-test-item ${test.result?.toLowerCase() || 'unknown'}`}
              onClick={() => setExpandedTest(expandedTest === index ? null : index)}
            >
              <div className="test-header">
                <div className="test-main-info">
                  <span className={`test-result-badge ${test.result?.toLowerCase() || 'unknown'}`}>
                    {test.result === 'PASSED' ? '✓ PASS' : test.result === 'FAILED' ? '✗ FAIL' : test.result}
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
