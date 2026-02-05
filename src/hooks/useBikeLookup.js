import { useState, useCallback } from 'react';
import { bikeService } from '../services/bikeService';

const useBikeLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bikeData, setBikeData] = useState(null);
  const [sources, setSources] = useState({});

  const lookupBike = useCallback(async (registration, mileage) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Looking up bike:', registration, 'with mileage:', mileage);
      
      const result = await bikeService.lookupBikeByRegistration(registration, mileage);
      
      if (result.success && result.data) {
        setBikeData(result.data);
        
        // Set field sources for auto-fill indicators
        const fieldSources = {};
        
        // Check if this is fallback/mock data
        const isMockData = result.metadata?.apiProvider?.includes('mock') || 
                          result.metadata?.apiProvider?.includes('fallback');
        
        // Running costs sources
        if (result.data.combinedMpg || result.data.urbanMpg || result.data.extraUrbanMpg) {
          fieldSources.runningCosts = {
            fuelEconomy: {
              urban: result.data.urbanMpg ? (isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API')) : null,
              extraUrban: result.data.extraUrbanMpg ? (isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API')) : null,
              combined: result.data.combinedMpg ? (isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API')) : null
            }
          };
        }
        
        if (result.data.annualTax) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.annualTax = isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API');
        }
        
        if (result.data.insuranceGroup) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.insuranceGroup = isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API');
        }
        
        if (result.data.co2Emissions) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.co2Emissions = isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API');
        }
        
        setSources(fieldSources);
        
        console.log('✅ Bike lookup successful:', result.data);
        console.log('💰 Running costs found:', {
          urbanMpg: result.data.urbanMpg,
          extraUrbanMpg: result.data.extraUrbanMpg,
          combinedMpg: result.data.combinedMpg,
          annualTax: result.data.annualTax,
          insuranceGroup: result.data.insuranceGroup,
          co2Emissions: result.data.co2Emissions
        });
        
        // Show note if using fallback data
        if (isMockData) {
          console.log('⚠️ Using generated/fallback data - please verify details');
        }
        
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to lookup bike');
      }
    } catch (err) {
      console.error('❌ Bike lookup error:', err);
      setError(err.message || 'Failed to lookup bike data');
      setBikeData(null);
      setSources({});
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBikeData(null);
    setError(null);
    setSources({});
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    bikeData,
    sources,
    lookupBike,
    reset
  };
};

export default useBikeLookup;