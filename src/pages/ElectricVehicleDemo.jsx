import React, { useState, useEffect } from 'react';
import ElectricVehicleCharging from '../components/ElectricVehicleCharging';
import ElectricVehicleRunningCosts from '../components/ElectricVehicleRunningCosts';
import ElectricVehicleBadge from '../components/ElectricVehicleBadge';
import { FaBolt, FaPlus } from 'react-icons/fa';

const ElectricVehicleDemo = () => {
  const [electricVehicles, setElectricVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchElectricVehicles();
  }, []);

  const fetchElectricVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/electric-vehicles');
      const data = await response.json();
      
      if (data.success) {
        setElectricVehicles(data.data);
        if (data.data.length > 0) {
          setSelectedVehicle(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching electric vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoVehicle = async () => {
    try {
      setIsCreating(true);
      const demoVehicles = [
        { make: 'Tesla', model: 'Model 3', variant: 'Performance' },
        { make: 'BMW', model: 'i4', variant: 'M50' },
        { make: 'Audi', model: 'e-tron', variant: 'GT' },
        { make: 'Mercedes', model: 'EQS', variant: '450+' },
        { make: 'Volkswagen', model: 'ID.4', variant: 'Pro' }
      ];
      
      const randomVehicle = demoVehicles[Math.floor(Math.random() * demoVehicles.length)];
      
      const response = await fetch('http://localhost:5000/api/demo/add-electric-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(randomVehicle)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchElectricVehicles();
        alert(`✅ Created ${randomVehicle.make} ${randomVehicle.model} ${randomVehicle.variant} with automatic EV enhancement!`);
      }
    } catch (error) {
      console.error('Error creating demo vehicle:', error);
      alert('❌ Error creating demo vehicle');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBolt className="text-4xl text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading electric vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FaBolt className="mr-3" />
                Electric Vehicle Demo
              </h1>
              <p className="text-green-100 mt-2">
                Automatic electric vehicle enhancement system demonstration
              </p>
            </div>
            <button
              onClick={createDemoVehicle}
              disabled={isCreating}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
            >
              <FaPlus className="mr-2" />
              {isCreating ? 'Creating...' : 'Add Demo EV'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {electricVehicles.length === 0 ? (
          <div className="text-center py-12">
            <FaBolt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Electric Vehicles Found</h2>
            <p className="text-gray-500 mb-6">Create a demo electric vehicle to see the automatic enhancement in action!</p>
            <button
              onClick={createDemoVehicle}
              disabled={isCreating}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto disabled:opacity-50"
            >
              <FaPlus className="mr-2" />
              {isCreating ? 'Creating...' : 'Create Demo Electric Vehicle'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Vehicle Selector */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Electric Vehicles ({electricVehicles.length})</h2>
              <div className="space-y-3">
                {electricVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVehicle?._id === vehicle._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <ElectricVehicleBadge vehicle={vehicle} size="small" />
                    </div>
                    <p className="text-sm text-gray-600">{vehicle.variant}</p>
                    <p className="text-sm text-gray-500">{vehicle.registrationNumber}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <FaBolt className="mr-1" />
                      {vehicle.electricRange || vehicle.runningCosts?.electricRange || 'N/A'} miles range
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="lg:col-span-3">
              {selectedVehicle ? (
                <div>
                  {/* Vehicle Header */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                          {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.variant}
                        </h1>
                        <p className="text-gray-600">{selectedVehicle.year} • {selectedVehicle.registrationNumber}</p>
                      </div>
                      <ElectricVehicleBadge vehicle={selectedVehicle} size="large" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          £{selectedVehicle.price?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Price</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedVehicle.mileage?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Miles</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedVehicle.electricRange || selectedVehicle.runningCosts?.electricRange || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Range (miles)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedVehicle.batteryCapacity || selectedVehicle.runningCosts?.batteryCapacity || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Battery (kWh)</p>
                      </div>
                    </div>
                  </div>

                  {/* Electric Vehicle Components */}
                  <ElectricVehicleCharging vehicle={selectedVehicle} />
                  <ElectricVehicleRunningCosts vehicle={selectedVehicle} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <FaBolt className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select an electric vehicle to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">🔋 Automatic Electric Vehicle Enhancement</h3>
          <p className="text-gray-300">
            This system automatically enhances electric vehicles with comprehensive charging information, 
            running costs, and brand-specific data when they are added to the database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElectricVehicleDemo;