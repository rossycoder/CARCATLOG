import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { checkVehicleHistory } from '../services/vehicleHistoryService';
import { lookupVehicle } from '../services/dvlaService';
import './VehiclePaymentPage.css';

const VehiclePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const registration = searchParams.get('registration') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (registration) {
      fetchVehicleData();
    } else {
      setError('Invalid payment session or missing registration');
      setIsLoading(false);
    }
  }, [registration]);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching vehicle data for registration:', registration);
      
      // Create promises for parallel API calls with timeout
      const dvlaPromise = Promise.race([
        lookupVehicle(registration, 0),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DVLA API timeout')), 5000)
        )
      ]);
      
      const historyPromise = Promise.race([
        checkVehicleHistory(registration, false),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('History API timeout')), 5000)
        )
      ]);
      
      // Execute API calls in parallel
      const [dvlaResult, historyResult] = await Promise.allSettled([
        dvlaPromise,
        historyPromise
      ]);
      
      console.log('API Results:', { dvlaResult, historyResult });
      
      // Process DVLA response
      let vehicleInfo = null;
      let dvlaSuccess = false;
      if (dvlaResult.status === 'fulfilled' && dvlaResult.value?.success) {
        // Try both data and vehicle properties (backend returns both)
        vehicleInfo = dvlaResult.value.data || dvlaResult.value.vehicle;
        dvlaSuccess = true;
        console.log('DVLA lookup successful:', vehicleInfo);
      } else {
        console.log('DVLA lookup failed:', dvlaResult.reason?.message || 'Unknown error');
        if (dvlaResult.status === 'rejected') {
          console.error('DVLA API Error:', dvlaResult.reason);
        }
      }
      
      // Process Vehicle History response
      let historyInfo = null;
      let historySuccess = false;
      if (historyResult.status === 'fulfilled' && historyResult.value?.success && historyResult.value?.data) {
        historyInfo = historyResult.value.data;
        historySuccess = true;
        console.log('History lookup successful');
      } else {
        console.log('History lookup failed:', historyResult.reason?.message || 'Unknown error');
      }
      
      // Determine data completeness
      let completeness = 'minimal';
      if (dvlaSuccess && historySuccess) {
        completeness = 'complete';
      } else if (dvlaSuccess || historySuccess) {
        completeness = 'partial';
      }
      
      // Merge and prioritize data from both sources
      if (vehicleInfo || historyInfo) {
        const mergedData = {
          vrm: registration,
          // Prioritize DVLA data for basic vehicle info as it's more authoritative
          make: vehicleInfo?.make || historyInfo?.make || 'Unknown',
          model: vehicleInfo?.model || historyInfo?.model || 'Unknown', 
          bodyType: vehicleInfo?.bodyType || historyInfo?.bodyType || historyInfo?.body_type || 'Unknown',
          colour: vehicleInfo?.colour || vehicleInfo?.color || historyInfo?.colour || historyInfo?.color || 'Unknown',
          firstRegistered: vehicleInfo?.yearOfManufacture || vehicleInfo?.year || historyInfo?.firstRegistered || historyInfo?.first_registered || historyInfo?.year || 'Unknown',
          fuelType: vehicleInfo?.fuelType || historyInfo?.fuelType || 'Unknown',
          engineSize: vehicleInfo?.engineCapacity ? `${(vehicleInfo.engineCapacity / 1000).toFixed(1)}L` : (historyInfo?.engineSize || 'Unknown'),
          transmission: historyInfo?.transmission || 'Manual',
          co2Emissions: vehicleInfo?.co2Emissions || '155',
          taxStatus: vehicleInfo?.taxStatus || 'Untaxed',
          motStatus: vehicleInfo?.motStatus || 'Not valid',
          
          // Metadata for display logic
          _dataSource: {
            dvla: dvlaSuccess,
            history: historySuccess,
            fallback: false
          },
          _completeness: completeness
        };
        
        console.log('Raw vehicle info from DVLA:', vehicleInfo);
        console.log('Raw history info:', historyInfo);
        console.log('Vehicle data merged successfully:', mergedData);
        setVehicleData(mergedData);
      } else {
        // Both APIs failed - show error
        console.error('Both DVLA and History APIs failed');
        setError('Unable to fetch vehicle data. Please check the registration number and try again.');
        setVehicleData(null);
      }
    } catch (err) {
      console.error('Unexpected error in fetchVehicleData:', err);
      setError('An unexpected error occurred. Please try again.');
      setVehicleData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      console.log('🚨 PROCESSING REAL PAYMENT for:', registration);
      console.log('⚠️  This will charge £4.95 to the customer card!');
      
      // Create Stripe checkout session
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vrm: registration,
          customerEmail: null // Could collect this from a form field
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data.url) {
        // Redirect to Stripe Checkout
        console.log('Redirecting to Stripe Checkout...');
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Payment processing failed: ${err.message}`);
      setIsProcessingPayment(false);
    }
  };

  const handleBack = () => {
    navigate('/vehicle-check');
  };

  if (isLoading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-card">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={handleBack} className="back-button">
              Back to Vehicle Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <button onClick={handleBack} className="back-link">
            ← Back
          </button>
        </div>

        <div className="payment-content">
          {/* Summary Section - matching the image exactly */}
          <div className="summary-card">
            <h2>Your summary</h2>
            <p>You've chosen to buy a vehicle check report for the following vehicle:</p>
            
            <div className="summary-table">
              <div className="summary-row">
                <span className="label">Registration</span>
                <span className="value">{registration}</span>
              </div>
              <div className="summary-row">
                <span className="label">Make</span>
                <span className="value">{vehicleData?.make || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Model</span>
                <span className="value">{vehicleData?.model || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Body type</span>
                <span className="value">{vehicleData?.bodyType || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Colour</span>
                <span className="value">{vehicleData?.colour || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="label">First registered</span>
                <span className="value">{vehicleData?.firstRegistered || 'N/A'}</span>
              </div>
              <div className="summary-row total-row">
                <span className="label">Total to pay:</span>
                <span className="value">£4.95</span>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <button 
            className="buy-button"
            onClick={handlePayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? 'Processing...' : 'Buy check'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclePaymentPage;