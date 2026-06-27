import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import './VehiclePaymentPage.css';

const VehiclePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const registration = searchParams.get('registration') || '';
  // Use passed state from VehicleCheckPage if available
  const passedVehicleData = location.state?.vehicleData;
  
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
      
      // If vehicle data was passed from VehicleCheckPage, use it directly
      if (passedVehicleData && passedVehicleData.make && passedVehicleData.make !== 'Unknown') {
        setVehicleData({
          vrm: registration,
          make: passedVehicleData.make || 'Unknown',
          model: passedVehicleData.model || 'Unknown',
          bodyType: passedVehicleData.bodyType || 'N/A',
          colour: passedVehicleData.colour || passedVehicleData.color || 'N/A',
          firstRegistered: passedVehicleData.firstRegistered || passedVehicleData.year ? String(passedVehicleData.firstRegistered || passedVehicleData.year) : 'N/A',
          fuelType: passedVehicleData.fuelType || 'N/A',
          engineSize: passedVehicleData.engineSize ? `${passedVehicleData.engineSize}` : 'N/A',
          transmission: passedVehicleData.transmission || 'N/A',
        });
        return;
      }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      let carData = null;
      
      // First try: basic-lookup (specs API)
      try {
        const response = await fetch(`${API_URL}/vehicles/basic-lookup/${registration}`);
        const result = await response.json();
        if (result.success && result.data) {
          carData = result.data;
        }
      } catch (e) {
        // fallback below
      }
      
      // Second try: check if car exists in DB by registration number
      if (!carData || !carData.make || carData.make === 'Unknown') {
        try {
          // Use basicVehicleLookup result if make is known, else try DB
          const dbResp = await fetch(`${API_URL}/vehicles?registrationNumber=${registration}&includeAllStatuses=true&limit=1`);
          const dbResult = await dbResp.json();
          const cars = dbResult.data || dbResult.cars || [];
          const car = cars.find(c => 
            c.registrationNumber?.replace(/\s/g,'').toUpperCase() === registration.replace(/\s/g,'').toUpperCase()
          ) || cars[0];
          if (car && car.make && car.make !== 'Unknown') {
            carData = {
              make: car.make,
              model: car.model,
              bodyType: car.bodyType,
              color: car.color,
              year: car.year,
              fuelType: car.fuelType,
              engineSize: car.engineSize,
              transmission: car.transmission,
            };
          }
        } catch (e) {
          // use whatever we have
        }
      }
      
      if (carData) {
        const d = carData;
        setVehicleData({
          vrm: registration,
          make: d.make || 'Unknown',
          model: d.model || 'Unknown',
          bodyType: d.bodyType || 'N/A',
          colour: d.color || d.colour || 'N/A',
          firstRegistered: d.year ? `${d.year}` : 'N/A',
          fuelType: d.fuelType || 'N/A',
          engineSize: d.engineSize ? `${d.engineSize}L` : 'N/A',
          transmission: d.transmission || 'N/A',
        });
      } else {
        // Fallback if everything fails — still allow payment
        setVehicleData({
          vrm: registration,
          make: 'Vehicle',
          model: 'Information',
          bodyType: 'Available after payment',
          colour: 'N/A',
          firstRegistered: 'N/A',
        });
      }
      
    } catch (err) {
      console.error('Error in fetchVehicleData:', err);
      // Don't block payment page on API error — use fallback
      setVehicleData({
        vrm: registration,
        make: 'Vehicle',
        model: 'Information',
        bodyType: 'Available after payment',
        colour: 'N/A',
        firstRegistered: 'N/A',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      
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
