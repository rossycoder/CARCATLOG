import React from 'react';
import { FaLeaf, FaPoundSign, FaShieldAlt, FaBolt, FaCalculator } from 'react-icons/fa';

const ElectricVehicleRunningCosts = ({ vehicle }) => {
  // Check if this is an electric vehicle
  if (vehicle.fuelType !== 'Electric') {
    return null;
  }

  // Get running costs data
  const runningCosts = vehicle.runningCosts || {};
  const electricRange = vehicle.electricRange || runningCosts.electricRange || 0;
  const batteryCapacity = vehicle.batteryCapacity || runningCosts.batteryCapacity || 0;
  const annualTax = vehicle.annualTax || runningCosts.annualTax || 0;
  const insuranceGroup = vehicle.insuranceGroup || runningCosts.insuranceGroup || 'N/A';

  // Calculate annual costs (based on 10,000 miles per year)
  const annualMiles = 10000;
  const homeElectricityRate = 0.30; // £0.30 per kWh
  const publicChargingRate = 0.45; // £0.45 per kWh

  const annualElectricityCost = {
    home: Math.round((annualMiles / electricRange) * batteryCapacity * homeElectricityRate),
    public: Math.round((annualMiles / electricRange) * batteryCapacity * publicChargingRate),
    mixed: Math.round((annualMiles / electricRange) * batteryCapacity * ((homeElectricityRate * 0.7) + (publicChargingRate * 0.3)))
  };

  // Compare with petrol car (average 35 mpg, £1.45/litre)
  const petrolComparison = {
    annualFuelCost: Math.round((annualMiles / 35) * 4.546 * 1.45), // 35 mpg, £1.45/litre
    savings: Math.round(((annualMiles / 35) * 4.546 * 1.45) - annualElectricityCost.mixed)
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center mb-4">
        <FaPoundSign className="text-green-500 text-2xl mr-3" />
        <h3 className="text-xl font-bold text-gray-800">Electric Vehicle Cost Analysis</h3>
      </div>

      {/* Annual Electricity Costs */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaBolt className="mr-2 text-yellow-500" />
          Annual Electricity Costs
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Based on 10,000 miles per year and current UK electricity rates
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-2">Home Charging Only</h5>
            <p className="text-2xl font-bold text-orange-600">£{annualElectricityCost.home}</p>
            <p className="text-sm text-gray-600">@ £0.30 per kWh</p>
            <p className="text-xs text-orange-700 mt-2">Most economical option</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-2">Mixed Charging</h5>
            <p className="text-2xl font-bold text-blue-600">£{annualElectricityCost.mixed}</p>
            <p className="text-sm text-gray-600">70% home, 30% public</p>
            <p className="text-xs text-blue-700 mt-2">Typical usage pattern</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-2">Public Charging Only</h5>
            <p className="text-2xl font-bold text-gray-600">£{annualElectricityCost.public}</p>
            <p className="text-sm text-gray-600">@ £0.45 per kWh</p>
            <p className="text-xs text-gray-700 mt-2">Higher cost option</p>
          </div>
        </div>
      </div>

      {/* Savings Comparison */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaCalculator className="mr-2 text-green-500" />
          Fuel Cost Savings vs Petrol Car
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Petrol Car (35 mpg average)</h5>
            <p className="text-2xl font-bold text-red-600">£{petrolComparison.annualFuelCost}</p>
            <p className="text-sm text-gray-600">Annual fuel cost</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">This Electric Car</h5>
            <p className="text-2xl font-bold text-green-600">£{annualElectricityCost.mixed}</p>
            <p className="text-sm text-gray-600">Annual electricity cost</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-green-800">Annual Savings</h5>
              <p className="text-sm text-gray-600">Compared to petrol car</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">£{petrolComparison.savings}</p>
              <p className="text-sm text-green-700">per year</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3">
            <h6 className="font-medium text-gray-800">5-year savings</h6>
            <p className="text-xl font-bold text-green-600">£{petrolComparison.savings * 5}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h6 className="font-medium text-gray-800">Cost per mile</h6>
            <p className="text-xl font-bold text-green-600">{(annualElectricityCost.mixed / annualMiles * 100).toFixed(1)}p</p>
          </div>
        </div>
      </div>

      {/* Additional Benefits */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Additional Electric Vehicle Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🚗 Congestion Charge</h5>
            <p className="text-sm text-gray-600">Exempt from London Congestion Charge (£15/day saving)</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🅿️ Parking Benefits</h5>
            <p className="text-sm text-gray-600">Free parking in many city centers and reduced rates</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🔧 Lower Maintenance</h5>
            <p className="text-sm text-gray-600">Fewer moving parts, no oil changes, reduced brake wear</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🏠 Home Charging</h5>
            <p className="text-sm text-gray-600">Convenience of charging at home overnight</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-3">Monthly Cost Breakdown (10,000 miles/year)</h5>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Electricity (mixed charging)</span>
            <span className="font-medium">£{Math.round(annualElectricityCost.mixed / 12)}/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Road Tax</span>
            <span className="font-medium">£{Math.round(annualTax / 12)}/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Insurance (estimated)</span>
            <span className="font-medium">£40-80/month</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total (excluding insurance)</span>
            <span>£{Math.round((annualElectricityCost.mixed + annualTax) / 12)}/month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleRunningCosts;