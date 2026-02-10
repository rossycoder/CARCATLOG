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
      // CRITICAL: Check session storage first to prevent duplicate API calls on refresh
      const cacheKey = `vehicle_lookup_${registration.toUpperCase()}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
      
      // Use cache if it exists and is less than 30 minutes old
      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (cacheAge < thirtyMinutes) {
          console.log(`✅ Using cached vehicle data for ${registration} (${Math.floor(cacheAge / 1000)}s old)`);
          const parsedData = JSON.parse(cachedData);
          setVehicleData(parsedData);
          setDataSources(parsedData.dataSources || { dvla: false, checkCarDetails: false });
          setSources(parsedData.fieldSources || {});
          setLoading(false);
          return parsedData;
        } else {
          console.log(`⏰ Cache expired for ${registration}, fetching fresh data`);
          sessionStorage.removeItem(cacheKey);
          sessionStorage.removeItem(`${cacheKey}_timestamp`);
        }
      }

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
      console.log('🏃 Running costs in clean data:', cleanData.runningCosts);
      
      // CRITICAL: Store in session storage to prevent duplicate calls on refresh
      sessionStorage.setItem(cacheKey, JSON.stringify(cleanData));
      sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log(`💾 Cached vehicle data for ${registration}`);
      
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
    }
    
    // CRITICAL FIX: Preserve running costs object as-is
    if (data.runningCosts && typeof data.runningCosts === 'object') {
      extracted.runningCosts = data.runningCosts;
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

  const clearCache = (registration) => {
    if (registration) {
      const cacheKey = `vehicle_lookup_${registration.toUpperCase()}`;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(`${cacheKey}_timestamp`);
      console.log(`🗑️ Cleared cache for ${registration}`);
    } else {
      // Clear all vehicle lookup caches
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('vehicle_lookup_')) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('🗑️ Cleared all vehicle lookup caches');
    }
  };

  return {
    loading,
    error,
    vehicleData,
    dataSources,
    sources,
    lookupVehicle,
    reset,
    clearCache
  };
};

export default useEnhancedVehicleLookup;
