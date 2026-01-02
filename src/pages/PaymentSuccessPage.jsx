import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkVehicleHistory } from '../services/vehicleHistoryService';
import { generateVehicleHistoryPDF } from '../utils/pdfGenerator';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const registration = searchParams.get('registration') || '';
  const channel = searchParams.get('channel') || 'cars';
  
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId && registration) {
      generateVehicleReport();
    } else {
      setError('Invalid payment session');
      setIsLoading(false);
    }
  }, [sessionId, registration]);

  const generateVehicleReport = async () => {
    try {
      setIsLoading(true);
      console.log('Generating vehicle report for:', registration);
      
      // Demo data to show for development
      const demoData = {
        vrm: registration,
        make: 'Triumph',
        model: 'Bonneville America 865',
        year: '2012',
        colour: 'Blue',
        fuelType: 'Petrol',
        engineSize: '865cc',
        mileage: 28500,
        previousOwners: 2,
        serviceHistory: 'Full service history',
        stolen: false,
        writeOff: false,
        outstandingFinance: false,
        checkDate: new Date().toISOString(),
        _isDemoData: true
      };
      
      // Call the vehicle history API to generate the report
      const response = await checkVehicleHistory(registration, true); // Force refresh
      
      console.log('API Response:', response);
      
      // Check if response has complete vehicle details
      if (response.success && response.data && response.data.make) {
        console.log('Using real API data');
        setVehicleData(response.data);
      } else {
        // If API doesn't return complete data, show demo data for development
        console.log('API returned incomplete data, showing demo data');
        setVehicleData(demoData);
      }
    } catch (err) {
      console.error('Error generating vehicle report:', err);
      
      // Show demo data for development when API is not available
      console.log('API error, showing demo data');
      setVehicleData({
        vrm: registration,
        make: 'Triumph',
        model: 'Bonneville America 865',
        year: '2012',
        colour: 'Blue',
        fuelType: 'Petrol',
        engineSize: '865cc',
        mileage: 28500,
        previousOwners: 2,
        serviceHistory: 'Full service history',
        stolen: false,
        writeOff: false,
        outstandingFinance: false,
        checkDate: new Date().toISOString(),
        _isDemoData: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCheck = () => {
    navigate('/vehicle-check');
  };

  const handleDownloadReport = () => {
    try {
      console.log('=== PDF Download Debug ===');
      console.log('vehicleData exists:', !!vehicleData);
      console.log('vehicleData:', JSON.stringify(vehicleData, null, 2));
      console.log('registration:', registration);
      
      if (!vehicleData) {
        alert('Vehicle data not available. Please refresh the page.');
        return;
      }
      
      generateVehicleHistoryPDF(vehicleData, registration);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h2>Generating Your Vehicle Report</h2>
            <p>Please wait while we compile your comprehensive vehicle history report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="error-card">
            <h2>Report Generation Error</h2>
            <p>{error}</p>
            <button onClick={handleNewCheck} className="new-check-button">
              Start New Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="container">
        {/* Payment Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Your vehicle history report is ready</p>
        </div>

        {/* Vehicle Report */}
        <div className="report-card">
          <div className="report-header">
            <h2>Vehicle History Report</h2>
            <div className="report-meta">
              <span className="registration">Registration: <strong>{registration}</strong></span>
              <span className="date">Generated: {new Date().toLocaleDateString()}</span>
            </div>
            {vehicleData?._isDemoData && (
              <div className="demo-notice">
                <p><strong>Demo Report:</strong> This is sample data for demonstration. In production, this would show real vehicle history from CheckCardDetails API.</p>
              </div>
            )}
          </div>

          <div className="report-content">
            {/* Vehicle Details */}
            <div className="report-section">
              <h3>Vehicle Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Make:</span>
                  <span className="value">{vehicleData?.make || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Model:</span>
                  <span className="value">{vehicleData?.model || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Year:</span>
                  <span className="value">{vehicleData?.year || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Colour:</span>
                  <span className="value">{vehicleData?.colour || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Fuel Type:</span>
                  <span className="value">{vehicleData?.fuelType || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Engine Size:</span>
                  <span className="value">{vehicleData?.engineSize || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* History Checks */}
            <div className="report-section">
              <h3>History Checks</h3>
              <div className="checks-grid">
                <div className={`check-result ${vehicleData?.stolen ? 'alert' : 'clear'}`}>
                  <div className="check-icon">
                    {vehicleData?.stolen ? '⚠️' : '✅'}
                  </div>
                  <div className="check-content">
                    <h4>Theft Check</h4>
                    <p>{vehicleData?.stolen ? 'Vehicle reported stolen' : 'No theft records found'}</p>
                  </div>
                </div>

                <div className={`check-result ${vehicleData?.writeOff ? 'alert' : 'clear'}`}>
                  <div className="check-icon">
                    {vehicleData?.writeOff ? '⚠️' : '✅'}
                  </div>
                  <div className="check-content">
                    <h4>Insurance Write-off</h4>
                    <p>{vehicleData?.writeOff ? 'Insurance write-off recorded' : 'No write-off records'}</p>
                  </div>
                </div>

                <div className={`check-result ${vehicleData?.outstandingFinance ? 'alert' : 'clear'}`}>
                  <div className="check-icon">
                    {vehicleData?.outstandingFinance ? '⚠️' : '✅'}
                  </div>
                  <div className="check-content">
                    <h4>Outstanding Finance</h4>
                    <p>{vehicleData?.outstandingFinance ? 'Outstanding finance detected' : 'No outstanding finance'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(vehicleData?.mileage || vehicleData?.previousOwners || vehicleData?.serviceHistory) && (
              <div className="report-section">
                <h3>Additional Information</h3>
                <div className="details-grid">
                  {vehicleData?.mileage && (
                    <div className="detail-item">
                      <span className="label">Mileage:</span>
                      <span className="value">{vehicleData.mileage.toLocaleString()} miles</span>
                    </div>
                  )}
                  {vehicleData?.previousOwners && (
                    <div className="detail-item">
                      <span className="label">Previous Owners:</span>
                      <span className="value">{vehicleData.previousOwners}</span>
                    </div>
                  )}
                  {vehicleData?.serviceHistory && (
                    <div className="detail-item">
                      <span className="label">Service History:</span>
                      <span className="value">{vehicleData.serviceHistory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Report Actions */}
          <div className="report-actions">
            <button onClick={handleDownloadReport} className="download-button">
              📄 Download PDF Report
            </button>
            <button onClick={handleNewCheck} className="new-check-button">
              Check Another Vehicle
            </button>
          </div>
        </div>

        {/* Receipt Information */}
        <div className="receipt-card">
          <h3>Receipt</h3>
          <div className="receipt-details">
            <div className="receipt-row">
              <span>Vehicle History Report - {registration}</span>
              <span>£4.95</span>
            </div>
            <div className="receipt-row total">
              <span>Total Paid</span>
              <span>£4.95</span>
            </div>
          </div>
          <p className="receipt-note">
            A receipt has been sent to your email address. You can re-download this report for 30 days using your transaction reference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;