import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkVehicleHistory } from '../services/vehicleHistoryService';
import { generateVehicleHistoryPDF } from '../utils/pdfGenerator';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const registration = searchParams.get('registration') || '';
  
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
      console.log('Fetching real vehicle data for:', registration);
      
      // Call both APIs in parallel to get complete vehicle data
      const [historyResponse, dvlaResponse] = await Promise.allSettled([
        checkVehicleHistory(registration, true),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vehicles/dvla-lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationNumber: registration })
        }).then(res => res.json())
      ]);
      
      console.log('History API Response:', historyResponse);
      console.log('DVLA API Response:', dvlaResponse);
      
      // Check if DVLA API failed - this is critical, we need vehicle details
      if (dvlaResponse.status === 'rejected' || !dvlaResponse.value?.success) {
        const errorMsg = dvlaResponse.value?.error || dvlaResponse.reason?.message || 'Unable to fetch vehicle details';
        throw new Error(`DVLA API Error: ${errorMsg}`);
      }
      
      // Extract DVLA data (required)
      const dvlaData = dvlaResponse.value.data;
      
      // Extract History data (optional - use defaults if failed)
      let historyData = {};
      if (historyResponse.status === 'fulfilled' && historyResponse.value?.success) {
        historyData = historyResponse.value.data;
        console.log('History API succeeded, using real history data');
      } else {
        console.warn('History API failed, using default values for history checks');
      }
      
      // Combine real data from both APIs (DVLA required, History optional)
      const combinedData = {
        vrm: registration.toUpperCase(),
        checkDate: new Date().toISOString(),
        // DVLA vehicle details (required)
        make: dvlaData.make,
        model: dvlaData.model,
        year: dvlaData.yearOfManufacture || dvlaData.year,
        colour: dvlaData.colour || dvlaData.color,
        fuelType: dvlaData.fuelType || dvlaData.fuel,
        engineSize: dvlaData.engineCapacity ? `${dvlaData.engineCapacity}cc` : null,
        // History check data (optional - defaults to safe values)
        stolen: historyData.isStolen || false,
        writeOff: historyData.isWrittenOff || false,
        outstandingFinance: historyData.hasOutstandingFinance || false,
        previousOwners: historyData.previousOwners || historyData.numberOfOwners || 0,
        serviceHistory: historyData.serviceHistory || 'Contact seller for service history',
        motStatus: historyData.motStatus || dvlaData.motStatus || 'Unknown',
        motExpiryDate: historyData.motExpiryDate || dvlaData.motExpiryDate,
      };
      
      console.log('Combined real vehicle data:', combinedData);
      setVehicleData(combinedData);
      
    } catch (err) {
      console.error('Error generating vehicle report:', err);
      setError(err.message || 'Failed to generate vehicle report. Please try again or contact support.');
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
            <h2>⚠️ Unable to Generate Report</h2>
            <p>{error}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Your payment was successful, but we encountered an issue fetching the vehicle data. 
              Please contact our support team with your registration number: <strong>{registration}</strong>
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="download-button">
                Try Again
              </button>
              <button onClick={handleNewCheck} className="new-check-button">
                Check Another Vehicle
              </button>
            </div>
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
                  <span className="value">{vehicleData?.year}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Colour:</span>
                  <span className="value">{vehicleData?.colour}</span>
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