import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';
import { generateEnhancedVehicleReport } from '../utils/enhancedPdfGenerator';
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
      console.log('Fetching comprehensive vehicle data for:', registration);
      
      // Use enhanced lookup API (CheckCarDetails) instead of DVLA
      const response = await carService.enhancedLookup(registration, 0);
      
      console.log('Enhanced API Response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Unable to fetch vehicle details');
      }
      
      const enhancedData = response.data;
      
      // Helper function to safely extract value from {value, source} format or direct value
      const getValue = (field) => {
        if (field === null || field === undefined) return null;
        if (typeof field === 'object' && field !== null && 'value' in field) {
          return field.value;
        }
        return field;
      };
      
      // Format the data for PDF (same structure as VehicleCheckPage)
      const combinedData = {
        vrm: registration.toUpperCase(),
        checkDate: new Date().toISOString(),
        // Vehicle details
        make: getValue(enhancedData.make) || 'Unknown',
        model: getValue(enhancedData.model) || 'Unknown',
        variant: getValue(enhancedData.variant),
        year: getValue(enhancedData.year),
        colour: getValue(enhancedData.color),
        fuelType: getValue(enhancedData.fuelType),
        engineSize: getValue(enhancedData.engineSize),
        transmission: getValue(enhancedData.transmission),
        bodyType: getValue(enhancedData.bodyType),
        doors: getValue(enhancedData.doors),
        seats: getValue(enhancedData.seats),
        // Safety checks
        stolen: enhancedData.isStolen || false,
        writeOff: enhancedData.isWrittenOff || false,
        outstandingFinance: enhancedData.hasOutstandingFinance || false,
        writeOffCategory: enhancedData.writeOffCategory || null,
        // Additional info
        previousOwners: getValue(enhancedData.previousOwners) || 0,
        mileage: getValue(enhancedData.mileage) || 0,
        serviceHistory: 'Contact seller for service history',
        motStatus: getValue(enhancedData.motStatus) || 'Unknown',
        motExpiryDate: getValue(enhancedData.motExpiry) || getValue(enhancedData.motDue),
        // Running costs
        co2Emissions: enhancedData.runningCosts?.co2Emissions || enhancedData.co2Emissions || null,
        insuranceGroup: getValue(enhancedData.runningCosts?.insuranceGroup) || getValue(enhancedData.insuranceGroup),
        annualTax: getValue(enhancedData.runningCosts?.annualTax) || getValue(enhancedData.annualTax),
        // MOT History - Add this data
        motHistory: enhancedData.motHistory || [],
        // Mileage History
        mileageHistory: enhancedData.mileageHistory || [],
        // Valuation
        valuation: enhancedData.valuation ? {
          estimatedValue: enhancedData.valuation.estimatedValue ? {
            retail: getValue(enhancedData.valuation.estimatedValue.retail),
            private: getValue(enhancedData.valuation.estimatedValue.private),
            partExchange: getValue(enhancedData.valuation.estimatedValue.partExchange)
          } : null
        } : null,
        // Full data for reference
        fullData: enhancedData
      };
      
      console.log('Combined vehicle data for PDF:', combinedData);
      setVehicleData(combinedData);
      
      // Auto-download PDF after data is loaded
      setTimeout(() => {
        console.log('Auto-downloading enhanced PDF report...');
        generateEnhancedVehicleReport(combinedData, registration);
      }, 1000); // Small delay to ensure state is updated
      
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
      
      // Use enhanced PDF generator
      generateEnhancedVehicleReport(vehicleData, registration);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message);
      alert('Failed to generate PDF: ' + error.message + '\n\nPlease check the console for more details.');
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