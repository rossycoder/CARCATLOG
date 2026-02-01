import { useState } from 'react';
import api from '../services/api';

const useEnhancedVehicleLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [dataSources, setDataSources] = useState({ dvla: false, checkCarDetails: false });
  const [sources, setSources] = useState({});

  const lookupVehicle = async (registration, mileage = null) => {
    setLoading(true);
    setError(null);
    setVehicleData(null);

    try {
      // Build URL with optional mileage parameter
      const url = mileage 
        ? `/vehicles/enhanced-lookup/${registration}?mileage=${mileage}`
        : `/vehicles/enhanced-lookup/${registration}`;
      
      console.log(`🔍 Calling enhanced lookup API: ${url}`);
      console.log(`📏 Mileage parameter: ${mileage || 'not provided'}`);
      const response = await api.get(url);
      const data = response.data;

      console.log('🔍 Raw API response:', data);
      console.log('💰 Raw valuation in response:', data.data?.valuation);

      // Extract clean values from source-tracked data
      const cleanData = extractValues(data.data || data);
      
      console.log('✨ Extracted clean data:', cleanData);
      console.log('📊 Field sources:', cleanData.fieldSources);
      
      setVehicleData(cleanData);
      setDataSources(data.dataSources || data.data?.dataSources || { dvla: false, checkCarDetails: false });
      setSources(cleanData.fieldSources || {});
      
      return cleanData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vehicle data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const extractValues = (data) => {
    const extract = (obj) => {
      if (obj === null || obj === undefined) return null;
      if (typeof obj !== 'object') return obj;
      
      // If this is a {value, source} object, extract the value
      if (obj.value !== undefined && obj.source !== undefined) {
        return obj.value;
      }
      
      // Recursively extract values from nested objects
      const result = {};
      Object.keys(obj).forEach(key => {
        result[key] = extract(obj[key]);
      });
      return result;
    };

    const extracted = extract(data);
    
    // Preserve fieldSources and dataSources at the root level
    if (data.fieldSources) {
      extracted.fieldSources = data.fieldSources;
    }
    if (data.dataSources) {
      extracted.dataSources = data.dataSources;
    }
    
    // CRITICAL FIX: Preserve valuation object as-is (it's already in correct format)
    if (data.valuation && typeof data.valuation === 'object') {
      extracted.valuation = data.valuation;
      console.log('💰 Preserved valuation object:', extracted.valuation);
    }

    return extracted;
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setVehicleData(null);
    setDataSources({ dvla: false, checkCarDetails: false });
    setSources({});
  };

  return {
    loading,
    error,
    vehicleData,
    dataSources,
    sources,
    lookupVehicle,
    reset
  };
};

export default useEnhancedVehicleLookup;
