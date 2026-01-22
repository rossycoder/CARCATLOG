import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './VehicleIdentificationPage.css';

const VehicleIdentificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { vehicleDetails, valuationData, formData } = location.state || {};

  useEffect(() => {
    if (!vehicleDetails && !formData) {
      navigate('/valuation');
    }
  }, [vehicleDetails, formData, navigate]);

  // Parse vehicle description to extract details
  const parseVehicleDescription = (description) => {
    if (!description) return {};
    
    const result = {};
    
    // Extract fuel type and transmission from brackets
    const bracketMatch = description.match(/\[(.*?)\]/);
    if (bracketMatch) {
      const bracketContent = bracketMatch[1];
      const parts = bracketContent.split('/').map(p => p.trim());
      
      if (parts[0]) result.fuelType = parts[0];
      if (parts[1]) result.transmission = parts[1];
    }
    
    return result;
  };

  const valuationParsed = parseVehicleDescription(valuationData?.vehicleDescription);

  // Merge vehicle details from CheckCarDetails API
  const mergedVehicleDetails = {
    ...vehicleDetails,
    make: vehicleDetails?.make || formData?.make || '',
    model: vehicleDetails?.model || formData?.model || '',
    registrationNumber: vehicleDetails?.registrationNumber || valuationData?.vrm || formData?.vrm || '',
    fuelType: vehicleDetails?.fuelType || valuationParsed.fuelType || '',
    engineCapacity: vehicleDetails?.engineCapacity || '',
    colour: vehicleDetails?.colour || '',
    transmission: vehicleDetails?.transmission || valuationParsed.transmission || 'Manual',
    typeApproval: vehicleDetails?.typeApproval || vehicleDetails?.bodyType || formData?.variant || '',
    monthOfFirstRegistration: vehicleDetails?.monthOfFirstRegistration || (formData?.regMonth && formData?.regYear ? `${formData.regMonth}/${formData.regYear}` : ''),
    yearOfManufacture: vehicleDetails?.yearOfManufacture || formData?.regYear || '',
    derivative: formData?.derivative || ''
  };

  const handleContinue = () => {
    navigate('/valuation/results', {
      state: {
        valuationData,
        vehicleDetails: mergedVehicleDetails,
        formData
      }
    });
  };

  const handleChangeDetails = () => {
    const vrm = mergedVehicleDetails.registrationNumber || '';
    const mileage = formData?.mileage || valuationData?.mileage || '';
    navigate(`/valuation/vehicle?vrn=${vrm}&mileage=${mileage}`);
  };

  // Build vehicle title from CheckCarDetails API data
  const buildVehicleTitle = () => {
    if (valuationData?.vehicleDescription) {
      return valuationData.vehicleDescription;
    }
    
    const details = mergedVehicleDetails;
    if (!details.make && !details.model) return 'Vehicle';
    
    const parts = [
      details.make,
      details.model,
      details.engineCapacity ? `${(details.engineCapacity / 1000).toFixed(1)}L` : '',
      details.fuelType,
      details.transmission,
      details.typeApproval
    ].filter(Boolean);
    
    return parts.join(' ') || 'Vehicle';
  };

  const getMileage = () => {
    if (formData?.mileage) return parseInt(formData.mileage).toLocaleString();
    if (valuationData?.mileage) return parseInt(valuationData.mileage).toLocaleString();
    return 'N/A';
  };

  if (!vehicleDetails && !formData) {
    return null;
  }

  return (
    <div className="vehicle-identification-page">
      <div className="identification-container">
        <h1 className="page-title">We've identified this car</h1>
        
        <div className="identification-card">
          <div className="vehicle-header">
            <h2 className="vehicle-title">{buildVehicleTitle()}</h2>
            {mergedVehicleDetails.make && (
              <div className="brand-logo-circle">
                <span className="brand-text">{mergedVehicleDetails.make.toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="vehicle-details-table">
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
              <span className="detail-value">{mergedVehicleDetails.engineCapacity ? `${mergedVehicleDetails.engineCapacity} cc` : 'N/A'}</span>
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
            <div className="detail-row">
              <span className="detail-label">Transmission:</span>
              <span className="detail-value">{mergedVehicleDetails.transmission}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date of first registration:</span>
              <span className="detail-value">{mergedVehicleDetails.monthOfFirstRegistration || mergedVehicleDetails.yearOfManufacture || 'N/A'}</span>
            </div>
            
            <div className="change-details-row">
              <span className="not-your-car">Not your car?</span>
              <button className="change-details-link" onClick={handleChangeDetails}>
                change details
              </button>
            </div>
          </div>

          <div className="validation-checklist">
            <p className="checklist-title">To make sure we can provide a valuation, please check:</p>
            <div className="checklist-items">
              <div className="checklist-item">
                <span className="check-icon">✓</span>
                <span>The vehicle is not more than 15 years old</span>
              </div>
              <div className="checklist-item">
                <span className="check-icon">✓</span>
                <span>Is not imported or left-hand drive</span>
              </div>
              <div className="checklist-item">
                <span className="check-icon">✓</span>
                <span>The vehicle is a car</span>
              </div>
            </div>
          </div>

          <div className="continue-section">
            <button className="btn-get-valuation" onClick={handleContinue}>
              Get valuation
            </button>
          </div>

          <p className="account-notice">
            To get your free valuation, you'll need to create an account or sign in if you already have one
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleIdentificationPage;
