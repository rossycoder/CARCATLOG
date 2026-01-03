import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ValuationResultsPage.css';

// List of motorcycle makes to detect non-car vehicles
const MOTORCYCLE_MAKES = [
  'TRIUMPH', 'HARLEY-DAVIDSON', 'HARLEY DAVIDSON', 'DUCATI', 'INDIAN', 
  'ROYAL ENFIELD', 'MOTO GUZZI', 'MV AGUSTA', 'NORTON', 'BSA'
];

// Body types that indicate a motorcycle
const MOTORCYCLE_BODY_TYPES = [
  'MOTORCYCLE', 'MOTORBIKE', 'CRUISER', 'CUSTOM CRUISER', 'SPORTBIKE', 
  'TOURING', 'ADVENTURE', 'NAKED', 'SCOOTER', 'MOPED'
];

const ValuationResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotCar, setIsNotCar] = useState(false);

  const { valuationData, vehicleDetails, formData } = location.state || {};

  // Parse derivative string to extract fuel type, transmission, and engine info
  // Example: "865 Custom Cruiser Petrol Manual (61 ps)" or "1.6 TDI SE Manual (105 ps)"
  const parseDerivative = (derivative) => {
    if (!derivative) return {};
    
    const result = {};
    const derivativeLower = derivative.toLowerCase();
    
    // Extract fuel type
    if (derivativeLower.includes('petrol')) {
      result.fuelType = 'Petrol';
    } else if (derivativeLower.includes('diesel') || derivativeLower.includes('tdi')) {
      result.fuelType = 'Diesel';
    } else if (derivativeLower.includes('electric')) {
      result.fuelType = 'Electric';
    } else if (derivativeLower.includes('hybrid')) {
      result.fuelType = 'Hybrid';
    }
    
    // Extract transmission
    if (derivativeLower.includes('auto') || derivativeLower.includes('automatic')) {
      result.transmission = 'Automatic';
    } else if (derivativeLower.includes('manual')) {
      result.transmission = 'Manual';
    }
    
    // Extract engine size (look for patterns like "865", "1.6", "2.0")
    const engineMatch = derivative.match(/(\d+\.?\d*)\s*(cc|l|litre)?/i);
    if (engineMatch) {
      const engineValue = parseFloat(engineMatch[1]);
      // If it's a small number like 1.6, 2.0, convert to cc
      if (engineValue < 10) {
        result.engineCapacity = Math.round(engineValue * 1000);
      } else {
        result.engineCapacity = Math.round(engineValue);
      }
    }
    
    // Extract power (ps/bhp)
    const powerMatch = derivative.match(/\((\d+)\s*(ps|bhp|hp)\)/i);
    if (powerMatch) {
      result.power = `${powerMatch[1]} ${powerMatch[2].toUpperCase()}`;
    }
    
    return result;
  };

  // Parse the derivative to get additional details
  const derivativeInfo = parseDerivative(formData?.derivative);

  // Merge vehicleDetails with formData to get complete vehicle info
  const mergedVehicleDetails = {
    ...vehicleDetails,
    make: vehicleDetails?.make || formData?.make || '',
    model: vehicleDetails?.model || formData?.model || '',
    registrationNumber: vehicleDetails?.registrationNumber || formData?.vrm || '',
    fuelType: vehicleDetails?.fuelType || derivativeInfo.fuelType || '',
    engineCapacity: vehicleDetails?.engineCapacity || derivativeInfo.engineCapacity || '',
    colour: vehicleDetails?.colour || '',
    transmission: vehicleDetails?.transmission || derivativeInfo.transmission || 'Manual',
    typeApproval: vehicleDetails?.typeApproval || vehicleDetails?.bodyType || formData?.variant || '',
    monthOfFirstRegistration: vehicleDetails?.monthOfFirstRegistration || (formData?.regMonth && formData?.regYear ? `${formData.regMonth}/${formData.regYear}` : ''),
    yearOfManufacture: vehicleDetails?.yearOfManufacture || formData?.regYear || '',
    derivative: formData?.derivative || '',
    power: derivativeInfo.power || ''
  };

  // Check if vehicle is not a car
  const checkIfNotCar = (details) => {
    if (!details) return false;
    
    const make = (details.make || '').toUpperCase();
    const bodyType = (details.typeApproval || details.bodyType || '').toUpperCase();
    const model = (details.model || '').toUpperCase();
    
    // Check motorcycle-only brands
    if (MOTORCYCLE_MAKES.some(brand => make.includes(brand))) {
      return true;
    }
    
    // Check body type
    if (MOTORCYCLE_BODY_TYPES.some(type => bodyType.includes(type))) {
      return true;
    }
    
    // Check model name for motorcycle indicators
    const motorcycleModelIndicators = ['BONNEVILLE', 'SPORTSTER', 'SOFTAIL', 'STREET GLIDE', 'ROAD KING', 'MONSTER', 'PANIGALE', 'SCRAMBLER'];
    if (motorcycleModelIndicators.some(indicator => model.includes(indicator))) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (!valuationData && !vehicleDetails && !formData) {
      navigate('/valuation');
      return;
    }
    
    if (mergedVehicleDetails) {
      setIsNotCar(checkIfNotCar(mergedVehicleDetails));
    }
  }, [valuationData, vehicleDetails, formData, navigate]);

  const handleCreateAdvert = () => {
    // Navigate to the specific advert edit page
    navigate('/selling/advert/edit/83b5db73-d05b-4f8e-882a-c61f60ee5bf7');
  };

  const handleFindNextCar = () => {
    navigate('/used-cars');
  };

  const handleChangeDetails = () => {
    const vrm = mergedVehicleDetails.registrationNumber || '';
    const mileage = formData?.mileage || valuationData?.mileage || '';
    navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
  };

  const handleGetAnotherValuation = () => {
    navigate('/valuation');
  };

  if (!valuationData && !vehicleDetails && !formData) {
    return null;
  }

  // Build vehicle title
  const buildVehicleTitle = () => {
    const details = mergedVehicleDetails;
    if (!details.make && !details.model) return 'Vehicle';
    const parts = [
      details.make,
      details.model,
      details.engineCapacity ? `${details.engineCapacity}cc` : '',
      details.colour,
      details.fuelType,
      details.transmission || 'Manual'
    ].filter(Boolean);
    return parts.join(' ') || 'Vehicle';
  };

  // Get mileage from various sources
  const getMileage = () => {
    if (formData?.mileage) return parseInt(formData.mileage).toLocaleString();
    if (valuationData?.mileage) return parseInt(valuationData.mileage).toLocaleString();
    return 'N/A';
  };

  return (
    <div className="valuation-results-page">
      {/* Main Content */}
      <div className="results-container">
        <div className="results-card">
          <div className="result-header-bar"></div>
          <h2 className="result-title">We've identified this car</h2>
          
          <div className="vehicle-identification">
            <h3 className="vehicle-name">{buildVehicleTitle()}</h3>
            
            <div className="vehicle-details-grid">
              <div className="details-column">
                <div className="detail-row">
                  <span className="detail-label">Registration number:</span>
                  <span className="detail-value">{mergedVehicleDetails.registrationNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mileage:</span>
                  <span className="detail-value">{getMileage()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fuel type:</span>
                  <span className="detail-value">{mergedVehicleDetails.fuelType || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Engine size:</span>
                  <span className="detail-value">{mergedVehicleDetails.engineCapacity ? `${mergedVehicleDetails.engineCapacity}cc` : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Body type:</span>
                  <span className="detail-value">{mergedVehicleDetails.typeApproval || 'N/A'}</span>
                </div>
                {mergedVehicleDetails.colour && (
                  <div className="detail-row">
                    <span className="detail-label">Colour:</span>
                    <span className="detail-value">{mergedVehicleDetails.colour}</span>
                  </div>
                )}
                {mergedVehicleDetails.derivative && (
                  <div className="detail-row">
                    <span className="detail-label">Derivative:</span>
                    <span className="detail-value">{mergedVehicleDetails.derivative}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Transmission:</span>
                  <span className="detail-value">{mergedVehicleDetails.transmission}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date of first registration:</span>
                  <span className="detail-value">{mergedVehicleDetails.monthOfFirstRegistration || mergedVehicleDetails.yearOfManufacture || 'N/A'}</span>
                </div>
                <div className="change-details-row">
                  <span>Not your car?</span>
                  <button className="change-details-link" onClick={handleChangeDetails}>
                    change details
                  </button>
                </div>
              </div>
              
              <div className="brand-logo-column">
                {mergedVehicleDetails.make && (
                  <div className="brand-logo">
                    <span className="brand-name">{mergedVehicleDetails.make}</span>
                    <span className="brand-icon">{isNotCar ? '🏍️' : '🚗'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isNotCar ? (
            <>
              <div className="valuation-unavailable">
                <p className="unavailable-message">Sorry, we are unable to provide a valuation because:</p>
                <p className="unavailable-reason">✕ This is not a car</p>
              </div>

              <div className="what-next-section">
                <h3>What to do next?</h3>
                <div className="action-buttons-row">
                  <button className="btn-create-advert" onClick={handleCreateAdvert}>
                    Create advert
                  </button>
                  <button className="btn-find-car" onClick={handleFindNextCar}>
                    Find your next car
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Show valuation results for cars */}
              {valuationData?.estimatedValue && (
                <div className="valuation-results-section">
                  <h3>Your Valuation</h3>
                  <div className="valuation-prices">
                    <div className="price-card featured">
                      <div className="price-label">Private Sale</div>
                      <div className="price-value">£{valuationData.estimatedValue.private?.toLocaleString()}</div>
                      <div className="price-description">Selling privately</div>
                    </div>
                    <div className="price-card">
                      <div className="price-label">Trade-In</div>
                      <div className="price-value">£{valuationData.estimatedValue.trade?.toLocaleString()}</div>
                      <div className="price-description">Part exchange</div>
                    </div>
                    <div className="price-card">
                      <div className="price-label">Retail</div>
                      <div className="price-value">£{valuationData.estimatedValue.retail?.toLocaleString()}</div>
                      <div className="price-description">Dealer price</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="what-next-section">
                <h3>What to do next?</h3>
                <div className="action-buttons-row">
                  <button className="btn-create-advert" onClick={handleCreateAdvert}>
                    Create advert
                  </button>
                  <button className="btn-find-car" onClick={handleFindNextCar}>
                    Find your next car
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="reset-section">
          <button className="reset-button" onClick={handleGetAnotherValuation}>
            ← Get Another Valuation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValuationResultsPage;
