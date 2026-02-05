import React from 'react';
import { FaBolt, FaLeaf } from 'react-icons/fa';

const ElectricVehicleBadge = ({ vehicle, size = 'normal' }) => {
  // Only show for electric vehicles
  if (vehicle.fuelType !== 'Electric') {
    return null;
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    normal: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'text-xs',
    normal: 'text-sm',
    large: 'text-lg'
  };

  return (
    <div className={`inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium ${sizeClasses[size]} shadow-md`}>
      <FaBolt className={`mr-1 ${iconSizes[size]}`} />
      <span>Electric</span>
      <FaLeaf className={`ml-1 ${iconSizes[size]}`} />
    </div>
  );
};

export default ElectricVehicleBadge;