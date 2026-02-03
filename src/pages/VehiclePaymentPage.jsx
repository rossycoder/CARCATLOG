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
      console.log('⚠️ Skipping API calls to avoid charges - using basic data for payment page');
      
      // For payment page, we don't need full vehicle data
      // Just set basic info for display
      const basicData = {
        vrm: registration,
        make: 'Vehicle',
        model: 'Information',
        bodyType: 'Available after payment',
        colour: 'N/A',
        firstRegistered: 'N/A',
        fuelType: 'N/A',
        engineSize: 'N/A',
        transmission: 'N/A',
        co2Emissions: 'N/A',
        taxStatus: 'N/A',
        motStatus: 'N/A',
        _dataSource: {
          dvla: false,
          history: false,
          fallback: true
        },
        _completeness: 'payment_mode'
      };
      
      console.log('Using basic data for payment page:', basicData);
      setVehicleData(basicData);
      
    } catch (err) {
      console.error('Error in fetchVehicleData:', err);
      setError('Unable to prepare payment page. Please try again.');
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