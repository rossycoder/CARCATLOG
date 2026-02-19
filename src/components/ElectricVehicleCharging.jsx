import React from 'react';
import { FaHome, FaChargingStation, FaBolt, FaClock, FaPlug } from 'react-icons/fa';

const ElectricVehicleCharging = ({ vehicle }) => {
  // Helper function to check if vehicle is electric or plug-in hybrid (has charging capability)
  const isElectricOrPluginHybrid = (fuelType) => {
    if (!fuelType) return false;
    return fuelType === 'Electric' || 
           fuelType === 'Plug-in Hybrid' ||
           fuelType === 'Petrol Plug-in Hybrid' ||
           fuelType === 'Diesel Plug-in Hybrid' ||
           fuelType.toLowerCase().includes('plug-in');
  };

  // Check if this is an electric vehicle or plug-in hybrid
  if (!isElectricOrPluginHybrid(vehicle.fuelType)) {
    return null;
  }

  // Get charging data from vehicle or runningCosts
  const chargingData = {
    electricRange: vehicle.electricRange || vehicle.runningCosts?.electricRange || 0,
    batteryCapacity: vehicle.batteryCapacity || vehicle.runningCosts?.batteryCapacity || 0,
    homeChargingSpeed: vehicle.homeChargingSpeed || vehicle.runningCosts?.homeChargingSpeed || 7.4,
    publicChargingSpeed: vehicle.publicChargingSpeed || vehicle.runningCosts?.publicChargingSpeed || 50,
    rapidChargingSpeed: vehicle.rapidChargingSpeed || vehicle.runningCosts?.rapidChargingSpeed || 100,
    chargingTime: vehicle.chargingTime || vehicle.runningCosts?.chargingTime || 8,
    chargingTime10to80: vehicle.chargingTime10to80 || vehicle.runningCosts?.chargingTime10to80 || 45,
    chargingPortType: vehicle.chargingPortType || vehicle.runningCosts?.chargingPortType || 'Type 2 / CCS',
    fastChargingCapability: vehicle.fastChargingCapability || vehicle.runningCosts?.fastChargingCapability || 'Fast Charging Compatible'
  };

  // CRITICAL: Don't show charging info if range is 0 or missing (prevents Infinity errors)
  if (!chargingData.electricRange || chargingData.electricRange === 0 || !chargingData.batteryCapacity || chargingData.batteryCapacity === 0) {
    return null;
  }

  // Calculate charging costs (UK average rates)
  const homeElectricityRate = 0.30; // £0.30 per kWh
  const publicChargingRate = 0.45; // £0.45 per kWh
  const rapidChargingRate = 0.65; // £0.65 per kWh

  const chargingCosts = {
    homeFull: (chargingData.batteryCapacity * homeElectricityRate).toFixed(2),
    publicFull: (chargingData.batteryCapacity * publicChargingRate).toFixed(2),
    rapidFull: (chargingData.batteryCapacity * rapidChargingRate).toFixed(2),
    homePer100Miles: ((chargingData.batteryCapacity * homeElectricityRate * 100) / chargingData.electricRange).toFixed(2),
    publicPer100Miles: ((chargingData.batteryCapacity * publicChargingRate * 100) / chargingData.electricRange).toFixed(2),
    rapidPer100Miles: ((chargingData.batteryCapacity * rapidChargingRate * 100) / chargingData.electricRange).toFixed(2)
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center mb-4">
        <FaBolt className="text-green-500 text-2xl mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Charging Information</h3>
      </div>

      {/* Battery & Range Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaBolt className="text-blue-500 mr-2" />
            <span className="font-semibold text-gray-700">Battery</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{chargingData.batteryCapacity} kWh</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaChargingStation className="text-green-500 mr-2" />
            <span className="font-semibold text-gray-700">Range</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{chargingData.electricRange} miles</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaPlug className="text-purple-500 mr-2" />
            <span className="font-semibold text-gray-700">Charging Port</span>
          </div>
          <p className="text-sm font-medium text-purple-600">{chargingData.chargingPortType}</p>
        </div>
      </div>

      {/* Charging Times Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaClock className="mr-2 text-gray-600" />
          Charging Times
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          We have used data from the manufacturer to estimate these charging times. 
          Charging times can vary based on ambient temperature and battery condition.
        </p>

        {/* Home Charging */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <FaHome className="text-orange-500 text-lg mr-2" />
            <h5 className="font-semibold text-gray-800">Home charging</h5>
          </div>
          
          <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Charging Speed</span>
              <span className="font-medium">{chargingData.homeChargingSpeed} kW</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min((chargingData.homeChargingSpeed / 22) * 100, 100)}%`}}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <h6 className="font-medium text-gray-800 mb-1">Full charge</h6>
              <p className="text-sm text-gray-600">Up to 100%</p>
              <p className="font-bold text-orange-600">{chargingData.chargingTime} hours</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h6 className="font-medium text-gray-800 mb-1">Top up charge</h6>
              <p className="text-sm text-gray-600">Up to 80%</p>
              <p className="font-bold text-orange-600">{Math.round(chargingData.chargingTime * 0.8)} hours</p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-orange-100 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Cost:</strong> £{chargingCosts.homeFull} for full charge • £{chargingCosts.homePer100Miles} per 100 miles
            </p>
          </div>
        </div>

        {/* Public Charging */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <FaChargingStation className="text-blue-500 text-lg mr-2" />
            <h5 className="font-semibold text-gray-800">Public charging</h5>
          </div>
          
          <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Charging Speed</span>
              <span className="font-medium">{chargingData.publicChargingSpeed} kW • Rapid</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <h6 className="font-medium text-gray-800 mb-1">Full charge</h6>
              <p className="text-sm text-gray-600">Up to 100%</p>
              <p className="font-bold text-blue-600">{Math.round(chargingData.batteryCapacity / chargingData.publicChargingSpeed * 60)} minutes</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h6 className="font-medium text-gray-800 mb-1">Top up charge</h6>
              <p className="text-sm text-gray-600">Up to 80%</p>
              <p className="font-bold text-blue-600">{Math.round(chargingData.batteryCapacity * 0.8 / chargingData.publicChargingSpeed * 60)} minutes</p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Cost:</strong> £{chargingCosts.publicFull} for full charge • £{chargingCosts.publicPer100Miles} per 100 miles
            </p>
          </div>
        </div>

        {/* Rapid Charging */}
        {chargingData.rapidChargingSpeed >= 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaBolt className="text-green-500 text-lg mr-2" />
              <h5 className="font-semibold text-gray-800">Rapid charging</h5>
            </div>
            
            <div className="bg-white rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Charging Speed</span>
                <span className="font-medium">{chargingData.rapidChargingSpeed} kW • Ultra Rapid</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <h6 className="font-medium text-gray-800 mb-1">10-80% charge</h6>
                <p className="text-sm text-gray-600">Optimal rapid charging</p>
                <p className="font-bold text-green-600">{chargingData.chargingTime10to80} minutes</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h6 className="font-medium text-gray-800 mb-1">Range added</h6>
                <p className="text-sm text-gray-600">In 10 minutes</p>
                <p className="font-bold text-green-600">{Math.round(chargingData.electricRange * 0.7 / chargingData.chargingTime10to80 * 10)} miles</p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Cost:</strong> £{chargingCosts.rapidFull} for full charge • £{chargingCosts.rapidPer100Miles} per 100 miles
              </p>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You can charge this vehicle in {chargingData.chargingTime10to80} minutes at its fastest charging speed of {chargingData.rapidChargingSpeed} kW
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charging Network Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-2">Charging Network Compatibility</h5>
        <p className="text-sm text-gray-600 mb-2">{chargingData.fastChargingCapability}</p>
        <div className="flex flex-wrap gap-2">
          {chargingData.chargingPortType.includes('Tesla') && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              Tesla Supercharger
            </span>
          )}
          {chargingData.chargingPortType.includes('CCS') && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              CCS Rapid
            </span>
          )}
          {chargingData.chargingPortType.includes('Type 2') && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Type 2 AC
            </span>
          )}
          {chargingData.chargingPortType.includes('CHAdeMO') && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              CHAdeMO
            </span>
          )}
        </div>
      </div>

      {/* How often will I need to charge? */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
          <FaClock className="mr-2 text-indigo-500" />
          How often will I need to charge?
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Daily commute (30 miles)</p>
            <p className="font-medium text-indigo-600">Every {Math.round(chargingData.electricRange / 30)} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Weekly driving (200 miles)</p>
            <p className="font-medium text-indigo-600">Every {Math.round(chargingData.electricRange / 200 * 7)} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleCharging;