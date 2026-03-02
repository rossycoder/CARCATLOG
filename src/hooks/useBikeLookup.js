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
        // CRITICAL: Handle both old format (flat) and new format (nested runningCosts)
        // New format from database has runningCosts.fuelEconomy.combined
        // Old format from API has combinedMpg at top level
        const normalizedData = {
          ...result.data,
          // Extract running costs from nested structure if present
          urbanMpg: result.data.urbanMpg || result.data.runningCosts?.fuelEconomy?.urban,
          extraUrbanMpg: result.data.extraUrbanMpg || result.data.runningCosts?.fuelEconomy?.extraUrban,
          combinedMpg: result.data.combinedMpg || result.data.runningCosts?.fuelEconomy?.combined,
          annualTax: result.data.annualTax || result.data.runningCosts?.annualTax,
          insuranceGroup: result.data.insuranceGroup || result.data.runningCosts?.insuranceGroup,
          co2Emissions: result.data.co2Emissions || result.data.runningCosts?.co2Emissions
        };
        
        setBikeData(normalizedData);
        
        // Set field sources for auto-fill indicators
        const fieldSources = {};
        
        // Check if this is fallback/mock data
        const isMockData = result.metadata?.apiProvider?.includes('mock') || 
                          result.metadata?.apiProvider?.includes('fallback');
        
        // Check if data came from database (has dataSources flag)
        const fromDatabase = result.data.dataSources?.checkCarDetails;
        const sourceLabel = fromDatabase ? 'Database' : (isMockData ? 'Generated' : (result.metadata?.apiProvider || 'API'));
        
        // Running costs sources
        if (normalizedData.combinedMpg || normalizedData.urbanMpg || normalizedData.extraUrbanMpg) {
          fieldSources.runningCosts = {
            fuelEconomy: {
              urban: normalizedData.urbanMpg ? sourceLabel : null,
              extraUrban: normalizedData.extraUrbanMpg ? sourceLabel : null,
              combined: normalizedData.combinedMpg ? sourceLabel : null
            }
          };
        }
        
        if (normalizedData.annualTax) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.annualTax = sourceLabel;
        }
        
        if (normalizedData.insuranceGroup) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.insuranceGroup = sourceLabel;
        }
        
        if (normalizedData.co2Emissions) {
          if (!fieldSources.runningCosts) fieldSources.runningCosts = {};
          fieldSources.runningCosts.co2Emissions = sourceLabel;
        }
        
        setSources(fieldSources);
        
        console.log('✅ Bike lookup successful:', normalizedData);
        console.log('💰 Running costs found:', {
          urbanMpg: normalizedData.urbanMpg,
          extraUrbanMpg: normalizedData.extraUrbanMpg,
          combinedMpg: normalizedData.combinedMpg,
          annualTax: normalizedData.annualTax,
          insuranceGroup: normalizedData.insuranceGroup,
          co2Emissions: normalizedData.co2Emissions,
          source: sourceLabel
        });
        
        // Show note if using fallback data
        if (isMockData) {
          console.log('⚠️ Using generated/fallback data - please verify details');
        } else if (fromDatabase) {
          console.log('✅ Using cached database data - saved API cost!');
        }
        
        return normalizedData;
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