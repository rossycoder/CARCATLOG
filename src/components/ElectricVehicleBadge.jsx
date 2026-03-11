import React from 'react';

const ElectricVehicleBadge = ({ vehicle, size = 'normal' }) => {
  // Only show for electric vehicles
  if (vehicle.fuelType !== 'Electric') {
    return null;
  }

  return (
    <span className="badge electric-badge">⚡ Electric</span>
  );
};

export default ElectricVehicleBadge;