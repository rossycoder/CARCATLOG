import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import advertService from '../services/advertService';
import uploadService from '../services/uploadService';
import AutoFillField from '../components/AutoFillField/AutoFillField';
import useEnhancedVehicleLookup from '../hooks/useEnhancedVehicleLookup';
import './CarAdvertEditPage.css';

const CarAdvertEditPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Enhanced vehicle lookup hook
  const {
    loading: apiLoading,
    error: apiError,
    vehicleData: enhancedData,
    dataSources,
    sources: fieldSources,
    lookupVehicle,
    reset: resetLookup
  } = useEnhancedVehicleLookup();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [carStatus, setCarStatus] = useState(null); // Track car status
  const [isDealerCar, setIsDealerCar] = useState(false); // Track if it's a dealer car
  const [showPopup, setShowPopup] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [advertData, setAdvertData] = useState({
    price: '',
    description: '',
    photos: [],
    contactPhone: '',
    contactEmail: '',
    location: '',
    features: [],
    serviceHistory: 'Contact seller', // Default service history
    runningCosts: {
      fuelEconomy: { urban: '', extraUrban: '', combined: '' },
      annualTax: '',
      insuranceGroup: '',
      co2Emissions: ''
    },
    videoUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [motData, setMotData] = useState(null);
  const [motLoading, setMotLoading] = useState(false);
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    features: false,
    runningCosts: true, // Expand by default to show running costs data
    video: false
  });
  
  // Price editing state
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  const [videoUrlTimeout, setVideoUrlTimeout] = useState(null);
  const [runningCostsTimeout, setRunningCostsTimeout] = useState(null);
  const [featureSaveTimeout, setFeatureSaveTimeout] = useState(null);
  
  // Vehicle details editing state (service history, MOT, seats)
  const [isVehicleDetailsEditing, setIsVehicleDetailsEditing] = useState(false);
  const [editableVehicleData, setEditableVehicleData] = useState({
    serviceHistory: '',
    motDue: '',
    seats: '',
    fuelType: ''
  });
  
  // Enhanced data processing state
  const [enhancedDataProcessed, setEnhancedDataProcessed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Show popup when page loads
  useEffect(() => {
    if (vehicleData && !isLoading) {
      setShowPopup(true);
    }
  }, [vehicleData, isLoading]);

  // Auto-fill data when enhanced data is received from API
  useEffect(() => {
    if (enhancedData && !apiLoading && !enhancedDataProcessed) {
      setEnhancedDataProcessed(true); // Prevent duplicate processing
      
      // PRIORITY FIX: Extract and set PRIVATE price IMMEDIATELY
      if (enhancedData.valuation?.estimatedValue) {
        const valuation = enhancedData.valuation.estimatedValue;
        // Use PRIVATE for display (individual seller price)
        const displayPrice = valuation.private || valuation.Private || valuation.retail;
        
        if (displayPrice && displayPrice > 0) {
          console.log('💰 Setting price from enhanced data:', displayPrice, 'type:', typeof displayPrice);
          setAdvertData(prev => {
            console.log('💰 Previous price:', prev.price, 'type:', typeof prev.price);
            return {
              ...prev,
              price: parseFloat(displayPrice) // Ensure it's a number
            };
          });
          
          setVehicleData(prev => ({
            ...prev,
            estimatedValue: parseFloat(displayPrice),
            allValuations: valuation,
            valuationConfidence: enhancedData.valuation.confidence || 'medium'
          }));
        }
      }
      
      // Auto-fill running costs
      if (enhancedData.runningCosts) {
        setAdvertData(prev => {
          const newRunningCosts = {
            fuelEconomy: {
              urban: String(enhancedData.runningCosts?.fuelEconomy?.urban || prev.runningCosts.fuelEconomy.urban || ''),
              extraUrban: String(enhancedData.runningCosts?.fuelEconomy?.extraUrban || prev.runningCosts.fuelEconomy.extraUrban || ''),
              combined: String(enhancedData.runningCosts?.fuelEconomy?.combined || prev.runningCosts.fuelEconomy.combined || '')
            },
            annualTax: String(enhancedData.runningCosts?.annualTax || prev.runningCosts.annualTax || ''),
            insuranceGroup: String(enhancedData.runningCosts?.insuranceGroup || prev.runningCosts.insuranceGroup || ''),
            co2Emissions: String(enhancedData.runningCosts?.co2Emissions || prev.runningCosts.co2Emissions || '')
          };
          
          return {
            ...prev,
            runningCosts: newRunningCosts
          };
        });
      }
    }
  }, [enhancedData, apiLoading, enhancedDataProcessed]);

  const loadAdvertData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('📥 Loading advert data for ID:', advertId);
      
      if (!advertId) {
        console.error('❌ No advert ID provided');
        navigate('/find-your-car');
        return;
      }
      
      // Try to fetch from vehicle API first (for cars created via DVLA lookup)
      try {
        console.log('🔍 Fetching vehicle data from /api/vehicles/', advertId);
        const vehicleResponse = await api.get(`/vehicles/${advertId}`);
        
        if (vehicleResponse.data && vehicleResponse.data.data) {
          console.log('✅ Vehicle found in vehicles collection');
          const vehicleData = vehicleResponse.data.data;
          
          // CRITICAL DEBUG: Check what price data is in database
          console.log('💰 Database price data:', {
            price: vehicleData.price,
            estimatedValue: vehicleData.estimatedValue,
            valuation: vehicleData.valuation,
            allValuations: vehicleData.allValuations
          });
          
          // Ensure allValuations and valuation are properly structured
          const enhancedVehicleData = {
            ...vehicleData,
            // If valuation exists in database, structure it properly
            allValuations: vehicleData.valuation ? {
              private: vehicleData.valuation.privatePrice,
              retail: vehicleData.valuation.dealerPrice,
              trade: vehicleData.valuation.partExchangePrice
            } : vehicleData.allValuations,
            // Keep original estimatedValue as fallback
            estimatedValue: vehicleData.valuation?.privatePrice || vehicleData.estimatedValue,
            // CRITICAL: Preserve MOT data from database
            motDue: vehicleData.motDue,
            motExpiry: vehicleData.motExpiry,
            motStatus: vehicleData.motStatus,
            motHistory: vehicleData.motHistory
          };
          
          setVehicleData(enhancedVehicleData);
          setCarStatus(vehicleData.advertStatus); // Store car status
          setIsDealerCar(vehicleData.isDealerListing || false); // Store if it's a dealer car
          
          console.log('🚗 Car loaded:', {
            advertStatus: vehicleData.advertStatus,
            isDealerListing: vehicleData.isDealerListing,
            dealerId: vehicleData.dealerId,
            hasAdvertisingPackage: !!vehicleData.advertisingPackage?.packageId,
            packageId: vehicleData.advertisingPackage?.packageId,
            willShowSaveButton: vehicleData.isDealerListing || !!vehicleData.advertisingPackage?.packageId,
            motDue: vehicleData.motDue,
            motExpiry: vehicleData.motExpiry,
            motStatus: vehicleData.motStatus,
            motHistoryLength: vehicleData.motHistory?.length || 0
          });
          
          // Populate form fields with existing data
          // Prefer private sale price if available
          const preferredPrice = enhancedVehicleData.valuation?.privatePrice || 
                                enhancedVehicleData.allValuations?.private || 
                                enhancedVehicleData.price || 0;
          
          console.log('💰 Setting price field to:', preferredPrice);
          console.log('💰 Available prices:', {
            privatePrice: enhancedVehicleData.valuation?.privatePrice,
            allValuationsPrivate: enhancedVehicleData.allValuations?.private,
            dbPrice: enhancedVehicleData.price
          });
          
          // Ensure price is a valid number
          const finalPrice = preferredPrice && preferredPrice > 0 ? parseFloat(preferredPrice) : 0;
          console.log('💰 Final price being set:', finalPrice, 'type:', typeof finalPrice);
          
          setAdvertData(prev => ({
            ...prev,
            price: finalPrice,
            description: vehicleData.description || '',
            photos: vehicleData.images || [],
            contactPhone: vehicleData.sellerContact?.phoneNumber || '',
            contactEmail: vehicleData.sellerContact?.email || '',
            location: vehicleData.postcode || '',
            features: vehicleData.features || [],
            runningCosts: {
              fuelEconomy: {
                urban: String(vehicleData.runningCosts?.fuelEconomy?.urban || ''),
                extraUrban: String(vehicleData.runningCosts?.fuelEconomy?.extraUrban || ''),
                combined: String(vehicleData.runningCosts?.fuelEconomy?.combined || '')
              },
              annualTax: String(vehicleData.runningCosts?.annualTax || ''),
              insuranceGroup: String(vehicleData.runningCosts?.insuranceGroup || ''),
              co2Emissions: String(vehicleData.runningCosts?.co2Emissions || '')
            },
            videoUrl: vehicleData.videoUrl || ''
          }));
          
          // Add a timeout to log the state after it's been set
          setTimeout(() => {
            console.log('💰 State updated - advertData.price is now:', finalPrice);
          }, 100);
          
          console.log('✅ Form fields populated with existing data');
          console.log('🏃 Running costs populated:', {
            combined: String(vehicleData.runningCosts?.fuelEconomy?.combined || ''),
            annualTax: String(vehicleData.runningCosts?.annualTax || ''),
            co2Emissions: String(vehicleData.runningCosts?.co2Emissions || '')
          });
          console.log('🏃 Full advertData.runningCosts:', {
            fuelEconomy: {
              urban: String(vehicleData.runningCosts?.fuelEconomy?.urban || ''),
              extraUrban: String(vehicleData.runningCosts?.fuelEconomy?.extraUrban || ''),
              combined: String(vehicleData.runningCosts?.fuelEconomy?.combined || '')
            },
            annualTax: String(vehicleData.runningCosts?.annualTax || ''),
            insuranceGroup: String(vehicleData.runningCosts?.insuranceGroup || ''),
            co2Emissions: String(vehicleData.runningCosts?.co2Emissions || '')
          });
          console.log('🔍 fieldSources state:', fieldSources);
          console.log('🔍 fieldSources.runningCosts:', fieldSources?.runningCosts);
          
          // Don't fetch MOT data to avoid API charges
          // For new users: MOT data should come from the initial vehicle lookup API call
          // For existing cars: MOT data should already be in the car document from when payment was completed
          if (vehicleData.registrationNumber) {
            console.log('⚠️ Skipping MOT API call to avoid charges');
            console.log('💡 MOT data should be available in car document already or from initial lookup');
          }
          
          // Check if we need to fetch enhanced data (valuation and running costs)
          // IMPORTANT: For new users, we should fetch from API since data isn't in database yet
          // For existing cars with payment completed, data should be in database already
          const needsValuation = !vehicleData.valuation?.privatePrice && !vehicleData.allValuations?.private;
          const needsRunningCosts = !vehicleData.runningCosts?.annualTax;
          const needsEnhancedData = needsValuation || needsRunningCosts;
          
          // Check if this is a new user car (no payment completed yet)
          const isNewUserCar = vehicleData.advertStatus === 'draft' || vehicleData.advertStatus === 'pending_payment';
          
          console.log('🔍 Enhanced data check:', {
            needsValuation,
            needsRunningCosts,
            needsEnhancedData,
            isNewUserCar,
            advertStatus: vehicleData.advertStatus,
            hasValuation: !!vehicleData.valuation?.privatePrice,
            hasRunningCosts: !!vehicleData.runningCosts?.annualTax,
            hasMOTData: !!(vehicleData.motDue || vehicleData.motExpiry),
            registrationNumber: vehicleData.registrationNumber
          });
          
          // CRITICAL: Check if MOT data is missing
          const needsMOTData = !vehicleData.motDue && !vehicleData.motExpiry;
          console.log('🔧 MOT Check:', {
            motDue: vehicleData.motDue,
            motExpiry: vehicleData.motExpiry,
            needsMOTData,
            willFetchMOT: needsMOTData && vehicleData.registrationNumber
          });
          
          // Only fetch enhanced data for new user cars or if data is missing
          if (vehicleData.registrationNumber && (isNewUserCar || needsEnhancedData || needsMOTData)) {
            if (isNewUserCar) {
              console.log('🆕 New user car detected - fetching fresh API data for running costs and valuation');
            } else if (needsMOTData) {
              console.log('🔧 MOT data missing - fetching from API...');
            } else {
              console.log('🔍 Existing car missing data - fetching enhanced data...');
            }
            
            try {
              const enhancedVehicleData = await lookupVehicle(vehicleData.registrationNumber, vehicleData.mileage);
              console.log('✅ Enhanced data fetched:', enhancedVehicleData);
              console.log('🔍 Enhanced data runningCosts check:', {
                hasRunningCosts: !!enhancedVehicleData.runningCosts,
                runningCostsValue: enhancedVehicleData.runningCosts,
                runningCostsType: typeof enhancedVehicleData.runningCosts
              });
              
              // Update vehicle data with enhanced information
              if (enhancedVehicleData.valuation) {
                setVehicleData(prev => ({
                  ...prev,
                  valuation: enhancedVehicleData.valuation,
                  allValuations: enhancedVehicleData.valuation.estimatedValue,
                  estimatedValue: enhancedVehicleData.valuation.estimatedValue?.private || 
                                enhancedVehicleData.valuation.estimatedValue?.retail ||
                                enhancedVehicleData.valuation.estimatedValue
                }));
                
                // Update price with private valuation
                const privatePrice = enhancedVehicleData.valuation.estimatedValue?.private ||
                                   enhancedVehicleData.valuation.estimatedValue?.retail ||
                                   enhancedVehicleData.valuation.estimatedValue;
                
                if (privatePrice && privatePrice > 0) {
                  setAdvertData(prev => ({
                    ...prev,
                    price: privatePrice
                  }));
                  console.log('✅ Price set from valuation:', privatePrice);
                }
              } else {
                // No valuation available - keep existing price or let user set manually
                console.log('⚠️ No valuation data available - user must set price manually');
                if (!vehicleData.price || vehicleData.price === 0) {
                  console.log('💡 Tip: Research similar vehicles to set a fair price');
                }
              }
              
              // Update running costs
              if (enhancedVehicleData.runningCosts) {
                console.log('🏃 Updating running costs from enhanced data:', enhancedVehicleData.runningCosts);
                
                setAdvertData(prev => {
                  const newRunningCosts = {
                    fuelEconomy: {
                      urban: String(enhancedVehicleData.runningCosts.fuelEconomy?.urban || ''),
                      extraUrban: String(enhancedVehicleData.runningCosts.fuelEconomy?.extraUrban || ''),
                      combined: String(enhancedVehicleData.runningCosts.fuelEconomy?.combined || '')
                    },
                    annualTax: String(enhancedVehicleData.runningCosts.annualTax || ''),
                    insuranceGroup: String(enhancedVehicleData.runningCosts.insuranceGroup || ''),
                    co2Emissions: String(enhancedVehicleData.runningCosts.co2Emissions || '')
                  };
                  
                  console.log('🏃 New running costs to set:', newRunningCosts);
                  
                  return {
                    ...prev,
                    runningCosts: newRunningCosts
                  };
                });
              } else {
                console.log('⚠️ No running costs in enhanced data');
              }
              
              // Update MOT data if available AND save to database
              if (enhancedVehicleData.motStatus || enhancedVehicleData.motDue || enhancedVehicleData.motExpiry) {
                console.log('🔧 Updating MOT data from enhanced data');
                const motDataToSave = {
                  motStatus: enhancedVehicleData.motStatus || vehicleData.motStatus,
                  motDue: enhancedVehicleData.motDue || enhancedVehicleData.motExpiry || vehicleData.motDue,
                  motExpiry: enhancedVehicleData.motExpiry || enhancedVehicleData.motDue || vehicleData.motExpiry,
                  motHistory: enhancedVehicleData.motHistory || vehicleData.motHistory || []
                };
                
                // Update frontend state
                setVehicleData(prev => ({
                  ...prev,
                  ...motDataToSave
                }));
                
                // CRITICAL: Save MOT data to database immediately
                try {
                  console.log('💾 Saving MOT data to database...');
                  await api.patch(`/vehicles/${advertId}`, {
                    motStatus: motDataToSave.motStatus,
                    motDue: motDataToSave.motDue,
                    motExpiry: motDataToSave.motExpiry,
                    motHistory: motDataToSave.motHistory
                  });
                  console.log('✅ MOT data saved to database successfully');
                } catch (saveError) {
                  console.error('❌ Failed to save MOT data to database:', saveError.message);
                }
              } else {
                // FALLBACK: Try fetching MOT from DVLA if CheckCarDetails didn't have it
                console.log('⚠️ No MOT data from CheckCarDetails, trying DVLA...');
                try {
                  const dvlaResponse = await api.post('/vehicles/dvla-lookup', {
                    registrationNumber: vehicleData.registrationNumber
                  });
                  
                  if (dvlaResponse.data?.data?.motExpiryDate) {
                    const dvlaMotData = {
                      motStatus: dvlaResponse.data.data.motStatus || 'Valid',
                      motDue: dvlaResponse.data.data.motExpiryDate,
                      motExpiry: dvlaResponse.data.data.motExpiryDate
                    };
                    
                    console.log('✅ MOT data fetched from DVLA:', dvlaMotData);
                    
                    // Update frontend state
                    setVehicleData(prev => ({
                      ...prev,
                      ...dvlaMotData
                    }));
                    
                    // Save to database
                    await api.patch(`/vehicles/${advertId}`, dvlaMotData);
                    console.log('✅ DVLA MOT data saved to database');
                  } else {
                    console.log('⚠️ No MOT data available from DVLA either');
                  }
                } catch (dvlaError) {
                  console.error('❌ Failed to fetch MOT from DVLA:', dvlaError.message);
                }
              }
              
              if (enhancedVehicleData.year >= 2020) {
                // For new cars (2020+), calculate MOT due date (3 years from first registration)
                const motDueYear = enhancedVehicleData.year + 3;
                const motDueDate = `${motDueYear}-10-31`; // Approximate date
                console.log(`🔧 Setting MOT due for new car: ${motDueDate}`);
                
                const newCarMotData = {
                  motStatus: 'Not due',
                  motDue: motDueDate,
                  motExpiry: motDueDate
                };
                
                // Update frontend state
                setVehicleData(prev => ({
                  ...prev,
                  ...newCarMotData
                }));
                
                // CRITICAL: Save calculated MOT data to database
                try {
                  console.log('💾 Saving calculated MOT data to database...');
                  await api.patch(`/vehicles/${advertId}`, newCarMotData);
                  console.log('✅ Calculated MOT data saved to database successfully');
                } catch (saveError) {
                  console.error('❌ Failed to save calculated MOT data:', saveError.message);
                }
              } else {
                console.log('🔧 No MOT data available, setting default message');
                setVehicleData(prev => ({
                  ...prev,
                  motStatus: 'Contact seller',
                  motDue: null,
                  motExpiry: null
                }));
              }
            } catch (enhancedError) {
              console.warn('⚠️ Failed to fetch enhanced data:', enhancedError.message);
            }
          } else {
            console.log('⚠️ Skipping enhanced data fetch - data already available in database or no registration');
          }
          
          setIsLoading(false);
          return;
        }
      } catch (vehicleErr) {
        console.log('⚠️ Vehicle not found in vehicles collection, trying adverts...');
      }
      
      // Fallback to advert service (for backward compatibility)
      const response = await advertService.getAdvert(advertId);
      
      console.log('Advert Response:', response);
      
      if (response.success && response.data) {
        console.log('Vehicle Data:', response.data.vehicleData);
        console.log('Advert Data:', response.data.advertData);
        console.log('Estimated Value:', response.data.vehicleData?.estimatedValue);
        
        setVehicleData(response.data.vehicleData);
        
        // Don't fetch MOT data from API to avoid charges
        // For new users: MOT data should come from the initial vehicle lookup API call
        // For existing cars: MOT data should already be in the car document from when payment was completed
        if (response.data.vehicleData?.registrationNumber) {
          console.log('⚠️ Skipping MOT API call to avoid charges');
          console.log('💡 MOT data should be available in car document already or from initial lookup');
        }
        
        // Check if we need to fetch enhanced data (valuation and running costs)
        // IMPORTANT: For new users, we should fetch from API since data isn't in database yet
        // For existing cars with payment completed, data should be in database already
        const needsValuation = !response.data.vehicleData?.valuation?.privatePrice && 
                               !response.data.vehicleData?.allValuations?.private;
        const needsRunningCosts = !response.data.vehicleData?.runningCosts?.annualTax;
        const needsEnhancedData = needsValuation || needsRunningCosts;
        
        // Check if this is a new user car (no payment completed yet)
        const isNewUserCar = response.data.vehicleData?.advertStatus === 'draft' || 
                            response.data.vehicleData?.advertStatus === 'pending_payment';
        
        console.log('🔍 Enhanced data check (fallback):', {
          needsValuation,
          needsRunningCosts,
          needsEnhancedData,
          isNewUserCar,
          advertStatus: response.data.vehicleData?.advertStatus,
          hasValuation: !!response.data.vehicleData?.valuation?.privatePrice,
          hasRunningCosts: !!response.data.vehicleData?.runningCosts?.annualTax
        });
        
        // CRITICAL: Also check for MOT data in fallback path
        const needsMOTData = !response.data.vehicleData?.motDue && !response.data.vehicleData?.motExpiry;
        console.log('🔧 MOT Check (fallback):', {
          motDue: response.data.vehicleData?.motDue,
          motExpiry: response.data.vehicleData?.motExpiry,
          needsMOTData,
          willFetchMOT: needsMOTData && response.data.vehicleData?.registrationNumber
        });
        
        // Only fetch enhanced data for new user cars or if data is missing
        if (response.data.vehicleData?.registrationNumber && (isNewUserCar || needsEnhancedData || needsMOTData)) {
          if (isNewUserCar) {
            console.log('🆕 New user car detected (fallback) - fetching fresh API data for running costs and valuation');
          } else {
            console.log('🔍 Existing car missing data (fallback) - fetching enhanced data...');
          }
          
          try {
            const enhancedVehicleData = await lookupVehicle(
              response.data.vehicleData.registrationNumber, 
              response.data.vehicleData.mileage
            );
            console.log('✅ Enhanced data fetched:', enhancedVehicleData);
            
            // Update vehicle data with enhanced information
            if (enhancedVehicleData.valuation) {
              setVehicleData(prev => ({
                ...prev,
                valuation: enhancedVehicleData.valuation,
                allValuations: enhancedVehicleData.valuation.estimatedValue,
                estimatedValue: enhancedVehicleData.valuation.estimatedValue?.private || 
                              enhancedVehicleData.valuation.estimatedValue?.retail ||
                              enhancedVehicleData.valuation.estimatedValue
              }));
              
              // Update price with private valuation
              const privatePrice = enhancedVehicleData.valuation.estimatedValue?.private ||
                                 enhancedVehicleData.valuation.estimatedValue?.retail ||
                                 enhancedVehicleData.valuation.estimatedValue;
              
              if (privatePrice) {
                console.log('💰 Updating price from enhanced data:', privatePrice);
                setAdvertData(prev => ({
                  ...prev,
                  price: privatePrice
                }));
              }
            }
            
            // Update running costs
            if (enhancedVehicleData.runningCosts) {
              setAdvertData(prev => {
                const newRunningCosts = {
                  fuelEconomy: {
                    urban: String(enhancedVehicleData.runningCosts.fuelEconomy?.urban || prev.runningCosts.fuelEconomy.urban || ''),
                    extraUrban: String(enhancedVehicleData.runningCosts.fuelEconomy?.extraUrban || prev.runningCosts.fuelEconomy.extraUrban || ''),
                    combined: String(enhancedVehicleData.runningCosts.fuelEconomy?.combined || prev.runningCosts.fuelEconomy.combined || '')
                  },
                  annualTax: String(enhancedVehicleData.runningCosts.annualTax || prev.runningCosts.annualTax || ''),
                  insuranceGroup: String(enhancedVehicleData.runningCosts.insuranceGroup || prev.runningCosts.insuranceGroup || ''),
                  co2Emissions: String(enhancedVehicleData.runningCosts.co2Emissions || prev.runningCosts.co2Emissions || '')
                };
                
                return {
                  ...prev,
                  runningCosts: newRunningCosts
                };
              });
            }
            
            // CRITICAL: Handle MOT data in fallback path too
            if (enhancedVehicleData.motStatus || enhancedVehicleData.motDue || enhancedVehicleData.motExpiry) {
              console.log('🔧 Updating MOT data from enhanced data (fallback)');
              setVehicleData(prev => ({
                ...prev,
                motStatus: enhancedVehicleData.motStatus,
                motDue: enhancedVehicleData.motDue || enhancedVehicleData.motExpiry,
                motExpiry: enhancedVehicleData.motExpiry || enhancedVehicleData.motDue
              }));
              
              // Save to database
              try {
                await api.patch(`/vehicles/${advertId}`, {
                  motStatus: enhancedVehicleData.motStatus,
                  motDue: enhancedVehicleData.motDue || enhancedVehicleData.motExpiry,
                  motExpiry: enhancedVehicleData.motExpiry || enhancedVehicleData.motDue
                });
                console.log('✅ MOT data saved (fallback)');
              } catch (saveError) {
                console.error('❌ Failed to save MOT data (fallback):', saveError.message);
              }
            } else {
              // DVLA Fallback in advert service path
              console.log('⚠️ No MOT from CheckCarDetails (fallback), trying DVLA...');
              try {
                const dvlaResponse = await api.post('/vehicles/dvla-lookup', {
                  registrationNumber: response.data.vehicleData.registrationNumber
                });
                
                if (dvlaResponse.data?.data?.motExpiryDate) {
                  const dvlaMotData = {
                    motStatus: dvlaResponse.data.data.motStatus || 'Valid',
                    motDue: dvlaResponse.data.data.motExpiryDate,
                    motExpiry: dvlaResponse.data.data.motExpiryDate
                  };
                  
                  console.log('✅ MOT from DVLA (fallback):', dvlaMotData);
                  setVehicleData(prev => ({ ...prev, ...dvlaMotData }));
                  await api.patch(`/vehicles/${advertId}`, dvlaMotData);
                  console.log('✅ DVLA MOT saved (fallback)');
                }
              } catch (dvlaError) {
                console.error('❌ DVLA MOT fetch failed (fallback):', dvlaError.message);
              }
            }
          } catch (enhancedError) {
            console.warn('⚠️ Failed to fetch enhanced data:', enhancedError.message);
          }
        } else {
          console.log('⚠️ Skipping enhanced data fetch - data already available in database or no registration');
        }
        
        // Handle price carefully - prefer PRIVATE sale price
        // Priority: privatePrice > allValuations.private > advertData.price > estimatedValue
        let priceValue = response.data.vehicleData?.valuation?.privatePrice ||
                        response.data.vehicleData?.allValuations?.private ||
                        response.data.vehicleData?.estimatedValue?.private ||
                        response.data.vehicleData?.estimatedValue?.retail ||
                        response.data.advertData?.price;
        
        if (priceValue === null || priceValue === undefined) {
          priceValue = response.data.vehicleData?.estimatedValue;
        }
        
        // If still no price, try enhanced data
        if ((priceValue === null || priceValue === undefined) && enhancedVehicleData?.valuation) {
          priceValue = enhancedVehicleData.valuation.estimatedValue?.private ||
                      enhancedVehicleData.valuation.estimatedValue?.retail ||
                      enhancedVehicleData.valuation.estimatedValue;
        }
        
        if (priceValue === null || priceValue === undefined) {
          priceValue = '';
        }
        console.log('💰 Setting price to:', priceValue, '(Private Sale preferred)');
        console.log('💰 Available prices:');
        console.log('   - privatePrice:', response.data.vehicleData?.valuation?.privatePrice);
        console.log('   - allValuations.private:', response.data.vehicleData?.allValuations?.private);
        console.log('   - advertPrice:', response.data.advertData?.price);
        console.log('   - estimatedValue:', response.data.vehicleData?.estimatedValue);
        console.log('   - FINAL PRICE USED:', priceValue);
        
        setAdvertData({
          price: priceValue,
          description: response.data.advertData?.description || '',
          photos: response.data.advertData?.photos || [],
          contactPhone: response.data.advertData?.contactPhone || '',
          contactEmail: response.data.advertData?.contactEmail || user?.email || '',
          location: response.data.advertData?.location?.postcode || response.data.advertData?.location || '',
          features: response.data.advertData?.features || [],
          serviceHistory: (() => {
            // Check if serviceHistory is already set in advertData or vehicleData
            if (response.data.advertData?.serviceHistory) {
              return response.data.advertData.serviceHistory;
            }
            if (response.data.vehicleData?.serviceHistory) {
              return response.data.vehicleData.serviceHistory;
            }
            // Check features for service history checkboxes
            const features = response.data.advertData?.features || [];
            if (features.includes('Full service history')) {
              return 'Full service history';
            }
            if (features.includes('Partial service history')) {
              return 'Partial service history';
            }
            return 'Contact seller';
          })(),
          runningCosts: response.data.advertData?.runningCosts || {
            fuelEconomy: { 
              urban: String(response.data.vehicleData?.runningCosts?.fuelEconomy?.urban || response.data.vehicleData?.fuelEconomyUrban || ''), 
              extraUrban: String(response.data.vehicleData?.runningCosts?.fuelEconomy?.extraUrban || response.data.vehicleData?.fuelEconomyExtraUrban || ''), 
              combined: String(response.data.vehicleData?.runningCosts?.fuelEconomy?.combined || response.data.vehicleData?.fuelEconomyCombined || '') 
            },
            annualTax: String(response.data.vehicleData?.runningCosts?.annualTax || response.data.vehicleData?.annualTax || ''),
            insuranceGroup: String(response.data.vehicleData?.runningCosts?.insuranceGroup || response.data.vehicleData?.insuranceGroup || ''),
            co2Emissions: String(response.data.vehicleData?.runningCosts?.co2Emissions || response.data.vehicleData?.co2Emissions || '')
          },
          videoUrl: response.data.advertData?.videoUrl || ''
        });
        
        console.log('✅ Advert data loaded successfully');
      } else {
        console.error('❌ Failed to load advert:', response.message);
        throw new Error(response.message || 'Failed to load advert data');
      }
    } catch (error) {
      console.error('❌ Error loading advert:', error);
      setLoadError(error.message || 'Failed to load advert data');
      // Don't redirect immediately, let user retry
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  }, [advertId, navigate, lookupVehicle]);

  // Fetch MOT data from API
  const fetchMOTData = async (vrm) => {
    console.log('⚠️ MOT API call disabled to avoid charges');
    console.log('💡 MOT data should be available in car document already');
    console.log('� VRM requested:', vrm);
    
    // Set loading to false and empty data
    setMotLoading(false);
    setMotData({
      tests: [],
      message: 'MOT data should be available in the car listing data'
    });
  };

  // Auto-fix price if it's not set but we have valuation data
  useEffect(() => {
    if (vehicleData && (!advertData.price || advertData.price <= 0 || typeof advertData.price !== 'number')) {
      // Try multiple sources for price in order of preference
      const availablePrice = vehicleData.valuation?.estimatedValue?.private || 
                           vehicleData.valuation?.estimatedValue?.retail ||
                           vehicleData.valuation?.privatePrice || 
                           vehicleData.allValuations?.private || 
                           vehicleData.estimatedValue || 
                           vehicleData.price;
      
      if (availablePrice && availablePrice > 0) {
        const numericPrice = parseFloat(availablePrice);
        if (!isNaN(numericPrice) && numericPrice > 0) {
          console.log('🔧 Auto-fixing price - setting to:', numericPrice);
          console.log('🔧 Price source:', {
            'valuation.estimatedValue.private': vehicleData.valuation?.estimatedValue?.private,
            'valuation.estimatedValue.retail': vehicleData.valuation?.estimatedValue?.retail,
            'valuation.privatePrice': vehicleData.valuation?.privatePrice,
            'allValuations.private': vehicleData.allValuations?.private,
            'estimatedValue': vehicleData.estimatedValue,
            'price': vehicleData.price,
            'selectedPrice': numericPrice
          });
          setAdvertData(prev => ({
            ...prev,
            price: numericPrice
          }));
        }
      } else {
        console.log('⚠️ No valid price found in any source:', {
          'valuation.estimatedValue': vehicleData.valuation?.estimatedValue,
          'valuation.privatePrice': vehicleData.valuation?.privatePrice,
          'allValuations.private': vehicleData.allValuations?.private,
          'estimatedValue': vehicleData.estimatedValue,
          'price': vehicleData.price
        });
      }
    }
  }, [vehicleData, advertData.price]);

  // Load advert data on mount - only once
  useEffect(() => {
    loadAdvertData();
  }, [advertId]); // Only depend on advertId, not loadAdvertData
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (videoUrlTimeout) clearTimeout(videoUrlTimeout);
      if (runningCostsTimeout) clearTimeout(runningCostsTimeout);
      if (featureSaveTimeout) clearTimeout(featureSaveTimeout);
    };
  }, [videoUrlTimeout, runningCostsTimeout, featureSaveTimeout]);

  const handleInputChange = (field, value) => {
    // Special handling for price field to ensure it's always a valid number
    if (field === 'price') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue >= 0) {
        setAdvertData(prev => ({
          ...prev,
          [field]: numericValue
        }));
      } else if (value === '' || value === null || value === undefined) {
        // Allow empty values for editing
        setAdvertData(prev => ({
          ...prev,
          [field]: ''
        }));
      }
      // Ignore invalid values (don't update state)
    } else {
      setAdvertData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle price editing
  const handlePriceEdit = () => {
    console.log('🖱️ Edit price button clicked!');
    setIsPriceEditing(true);
  };
  
  // Handle price save
  const handlePriceSave = async () => {
    const priceValue = parseFloat(advertData.price);
    
    if (!advertData.price || isNaN(priceValue) || priceValue <= 0) {
      setErrors(prev => ({ ...prev, price: 'Please enter a valid price' }));
      return;
    }
    
    // Clear any price errors
    setErrors(prev => ({ ...prev, price: null }));
    
    // Auto-save price to database
    try {
      const updatedAdvertData = {
        ...advertData,
        price: priceValue // Ensure price is a number
      };
      
      console.log('💰 Saving price:', priceValue);
      const response = await advertService.updateAdvert(advertId, updatedAdvertData, vehicleData);
      console.log('✅ Price saved successfully:', response);
      
      // Update local state with the saved price
      setAdvertData(prev => ({
        ...prev,
        price: priceValue
      }));
      
      // Exit editing mode after successful save
      setIsPriceEditing(false);
    } catch (error) {
      console.error('❌ Error saving price:', error);
      setErrors(prev => ({ ...prev, price: 'Failed to save price. Please try again.' }));
      // Don't exit editing mode if save failed
    }
  };
  
  // Handle price cancel
  const handlePriceCancel = () => {
    setIsPriceEditing(false);
    // Revert to original price
    handleInputChange('price', vehicleData.estimatedValue || '');
  };
  
  // Handle vehicle details edit (service history, MOT, seats)
  const handleVehicleDetailsEdit = () => {
    console.log('🖱️ Edit vehicle details button clicked!');
    
    // Initialize editable data with current values
    setEditableVehicleData({
      serviceHistory: advertData.serviceHistory || 'Contact seller',
      motDue: vehicleData.motDue || vehicleData.motExpiry || '',
      seats: vehicleData.seats || '',
      fuelType: vehicleData.fuelType || 'Petrol'
    });
    
    setIsVehicleDetailsEditing(true);
  };
  
  // Handle vehicle details save
  const handleVehicleDetailsSave = async () => {
    try {
      console.log('💾 Saving vehicle details:', editableVehicleData);
      
      // Validate seats (must be between 2-9)
      if (editableVehicleData.seats && (editableVehicleData.seats < 2 || editableVehicleData.seats > 9)) {
        setErrors(prev => ({ ...prev, seats: 'Seats must be between 2 and 9' }));
        return;
      }
      
      // Clear any errors
      setErrors(prev => ({ ...prev, seats: null, serviceHistory: null, motDue: null, fuelType: null }));
      
      // Update both Car and VehicleHistory models
      const updateData = {
        serviceHistory: editableVehicleData.serviceHistory,
        seats: editableVehicleData.seats ? parseInt(editableVehicleData.seats) : vehicleData.seats,
        fuelType: editableVehicleData.fuelType
      };
      
      // If MOT date is provided, update it
      if (editableVehicleData.motDue) {
        updateData.motDue = editableVehicleData.motDue;
        updateData.motExpiry = editableVehicleData.motDue;
      }
      
      // Save to backend (will update both Car and VehicleHistory)
      const response = await advertService.updateAdvert(advertId, updateData, {
        ...vehicleData,
        ...updateData
      });
      
      console.log('✅ Vehicle details saved successfully:', response);
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        ...updateData
      }));
      
      setAdvertData(prev => ({
        ...prev,
        serviceHistory: editableVehicleData.serviceHistory
      }));
      
      // Exit editing mode
      setIsVehicleDetailsEditing(false);
    } catch (error) {
      console.error('❌ Error saving vehicle details:', error);
      setErrors(prev => ({ ...prev, vehicleDetails: 'Failed to save. Please try again.' }));
    }
  };
  
  // Handle vehicle details cancel
  const handleVehicleDetailsCancel = () => {
    setIsVehicleDetailsEditing(false);
    // Reset editable data
    setEditableVehicleData({
      serviceHistory: advertData.serviceHistory || 'Contact seller',
      motDue: vehicleData.motDue || vehicleData.motExpiry || '',
      seats: vehicleData.seats || '',
      fuelType: vehicleData.fuelType || 'Petrol'
    });
  };
  
  // Handle feature toggle with debounced save
  const toggleFeature = async (feature) => {
    const newFeatures = advertData.features.includes(feature)
      ? advertData.features.filter(f => f !== feature)
      : [...advertData.features, feature];
    
    // Determine service history based on feature selection
    let serviceHistory = 'Contact seller'; // Default
    
    // Check if user is toggling service history features
    if (feature === 'Full service history' || feature === 'Partial service history') {
      // If adding Full service history
      if (feature === 'Full service history' && !advertData.features.includes(feature)) {
        serviceHistory = 'Full service history';
        // Remove Partial service history if it exists
        const index = newFeatures.indexOf('Partial service history');
        if (index > -1) {
          newFeatures.splice(index, 1);
        }
      }
      // If adding Partial service history
      else if (feature === 'Partial service history' && !advertData.features.includes(feature)) {
        serviceHistory = 'Partial service history';
        // Remove Full service history if it exists
        const index = newFeatures.indexOf('Full service history');
        if (index > -1) {
          newFeatures.splice(index, 1);
        }
      }
      // If removing either, set to Contact seller
      else {
        serviceHistory = 'Contact seller';
      }
    } else {
      // For other features, maintain current service history
      if (newFeatures.includes('Full service history')) {
        serviceHistory = 'Full service history';
      } else if (newFeatures.includes('Partial service history')) {
        serviceHistory = 'Partial service history';
      }
    }
    
    setAdvertData(prev => ({
      ...prev,
      features: newFeatures,
      serviceHistory: serviceHistory
    }));
    
    // Debounce the save operation to prevent concurrent updates
    if (featureSaveTimeout) clearTimeout(featureSaveTimeout);
    
    const timeout = setTimeout(async () => {
      try {
        console.log('🔧 Saving features (debounced):', { features: newFeatures, serviceHistory });
        console.log('🔧 Advert ID:', advertId);
        
        // Send both features and serviceHistory
        const updateData = { 
          features: newFeatures,
          serviceHistory: serviceHistory
        };
        
        await advertService.updateAdvert(advertId, updateData, vehicleData);
        console.log('Features and service history saved successfully');
      } catch (error) {
        console.error('Error saving features:', error);
        console.error('Error details:', error.response?.data);
      }
    }, 500); // Wait 500ms before saving to batch multiple feature changes
    
    setFeatureSaveTimeout(timeout);
  };
  
  // Handle video URL with auto-save
  const handleVideoUrl = async (url) => {
    setAdvertData(prev => ({
      ...prev,
      videoUrl: url
    }));
    
    // Auto-save to database after a short delay (debounce)
    if (videoUrlTimeout) clearTimeout(videoUrlTimeout);
    const timeout = setTimeout(async () => {
      try {
        await advertService.updateAdvert(advertId, { ...advertData, videoUrl: url }, vehicleData);
        console.log('Video URL saved successfully');
      } catch (error) {
        console.error('Error saving video URL:', error);
      }
    }, 1000);
    setVideoUrlTimeout(timeout);
  };
  
  // Handle running costs change with auto-save
  const handleRunningCostsChange = async (field, value) => {
    let newRunningCosts;
    
    if (field.includes('.')) {
      // Handle nested fields like fuelEconomy.urban
      const [parent, child] = field.split('.');
      newRunningCosts = {
        ...advertData.runningCosts,
        [parent]: {
          ...advertData.runningCosts[parent],
          [child]: value
        }
      };
    } else {
      // Handle top-level fields
      newRunningCosts = {
        ...advertData.runningCosts,
        [field]: value
      };
    }
    
    setAdvertData(prev => ({
      ...prev,
      runningCosts: newRunningCosts
    }));
    
    // Auto-save to database after a short delay (debounce)
    if (runningCostsTimeout) clearTimeout(runningCostsTimeout);
    const timeout = setTimeout(async () => {
      try {
        await advertService.updateAdvert(advertId, { ...advertData, runningCosts: newRunningCosts }, vehicleData);
        console.log('Running costs saved successfully');
      } catch (error) {
        console.error('Error saving running costs:', error);
      }
    }, 1000);
    setRunningCostsTimeout(timeout);
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Check total image limit
    const currentPhotoCount = advertData.photos.length;
    const remainingSlots = 100 - currentPhotoCount;
    
    if (remainingSlots <= 0) {
      alert('You have reached the maximum limit of 100 images.');
      return;
    }
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum 100 images allowed.`);
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please upload only images under 5MB.');
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert files to base64 and upload to Cloudinary
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const base64 = await uploadService.fileToBase64(file);
        
        // Upload to Cloudinary
        const result = await uploadService.uploadImage(base64, advertId);
        
        if (result.success) {
          setAdvertData(prev => ({
            ...prev,
            photos: [...prev.photos, {
              id: result.data.publicId,
              url: result.data.url,
              publicId: result.data.publicId
            }]
          }));
        } else {
          console.error('Failed to upload image:', result.error);
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to upload images: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = async (photoId) => {
    // Try to delete from Cloudinary
    const photo = advertData.photos.find(p => p.id === photoId);
    if (photo?.publicId) {
      try {
        await uploadService.deleteImage(photo.publicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
      }
    }
    
    setAdvertData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!advertData.price || parseFloat(advertData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!advertData.description.trim()) {
      newErrors.description = 'Please add a description';
    } else if (advertData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    if (advertData.photos.length === 0) {
      newErrors.photos = 'Please add at least one photo';
    }
    
    if (!advertData.contactPhone.trim()) {
      newErrors.contactPhone = 'Please enter a contact phone number';
    }
    
    if (!advertData.contactEmail.trim()) {
      newErrors.contactEmail = 'Please enter a contact email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save advert data
      const response = await advertService.updateAdvert(advertId, advertData, vehicleData);
      
      if (response.success) {
        alert('Advert saved successfully!');
        
        // If car is already active (payment completed), redirect to My Listings
        if (carStatus === 'active') {
          setTimeout(() => {
            navigate('/my-listings');
          }, 1000);
        }
      } else {
        throw new Error(response.message || 'Failed to save advert');
      }
      
    } catch (error) {
      console.error('Error saving advert:', error);
      alert(error.message || 'Failed to save advert. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    // Navigate to seller contact details page
    navigate(`/selling/advert/contact/${advertId}`, {
      state: {
        advertData,
        vehicleData
      }
    });
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (isLoading) {
    return (
      <div className="car-advert-edit-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your advert...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="car-advert-edit-page error">
        <div className="error-message">
          <h2>{loadError ? 'Error Loading Advert' : 'Advert not found'}</h2>
          <p>{loadError || "The advert you're looking for doesn't exist or you don't have permission to edit it."}</p>
          <div className="error-actions">
            <button onClick={loadAdvertData} className="retry-button">
              Try Again
            </button>
            <button onClick={() => navigate('/find-your-car')} className="back-button">
              Back to Find Your Car
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-advert-edit-page">
      {/* Popup Message */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={closePopup}>
              ✕ Close
            </button>
            <h2>We've populated your ad for you.</h2>
            <div className="popup-checklist">
              <p>Please check that you're happy with:</p>
              <div className="checklist-item">
                <span className="checkmark">✓</span>
                <span>Your price</span>
              </div>
              <div className="checklist-item">
                <span className="checkmark">✓</span>
                <span>Your mileage</span>
              </div>
              <div className="checklist-item">
                <span className="checkmark">✓</span>
                <span>Your vehicle features and specs</span>
              </div>
              <div className="checklist-item">
                <span className="photo-icon">📷</span>
                <span>Now just add some photos and a description</span>
              </div>
            </div>
            <p className="popup-note">
              If you're happy with your advert tap 'I'm happy with my ad', if not use the edit buttons to change information.
            </p>
            <button className="popup-ok-button" onClick={closePopup}>
              OK, got it
            </button>
          </div>
        </div>
      )}

      <div className="advert-header">
        <div className="container">
          <button 
            className="back-link" 
            onClick={() => navigate('/find-your-car')}
          >
            ← Back to Find Your Car
          </button>
          <h1>Your car advert - Incomplete</h1>
          <div className="advert-info">
            <p className="user-email">{user?.email}</p>
            <p className="advert-id">Advert ID: {advertId}</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="advert-content">
          {/* Photo Upload Section */}
          <section className="photo-section">
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            )}
            <div className="photo-upload-area">
              {advertData.photos.length === 0 ? (
                <div className="empty-photos">
                  <div className="camera-icon">📷</div>
                  <p>Customer needs to upload own photos</p>
                  <label className={`upload-button ${isUploading ? 'disabled' : ''}`}>
                    {isUploading ? 'Uploading...' : 'Add photos'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              ) : (
                <div className="photo-grid">
                  {advertData.photos.map((photo) => (
                    <div key={photo.id} className="photo-item">
                      <img src={photo.url} alt="Car" />
                      <button
                        className="remove-photo"
                        onClick={() => removePhoto(photo.id)}
                        disabled={isUploading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {advertData.photos.length < 100 && (
                    <label className="add-more-photos">
                      <div className="add-icon">+</div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                  {advertData.photos.length >= 100 && (
                    <div className="max-photos-reached">
                      <div className="max-icon">✓</div>
                      <span>Max 100 images</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="photo-info">
              <div className="info-icon">ℹ️</div>
              <span>
                {advertData.photos.length > 0 
                  ? `${advertData.photos.length} of 100 images uploaded. ${advertData.photos.length < 20 ? 'Buyers expect to see at least 20 images.' : 'Great! You have enough images.'}`
                  : 'You can upload up to 100 images. Buyers expect to see at least 20 images on an advert'}
              </span>
            </div>
            
            {errors.photos && (
              <p className="error-message">{errors.photos}</p>
            )}
          </section>

          {/* Vehicle Details Section */}
          <section className="vehicle-details-section">
            <h2>
              {`${vehicleData.make} ${vehicleData.model}`}
            </h2>
            <p className="vehicle-subtitle">
              {(() => {
                const parts = [];
                
                // Use displayTitle if available (AutoTrader format: "3.0 530d xDrive M Sport 5dr")
                if (vehicleData.displayTitle && 
                    vehicleData.displayTitle !== 'null' && 
                    vehicleData.displayTitle !== 'undefined') {
                  parts.push(vehicleData.displayTitle);
                } else {
                  // Fallback: construct from individual fields
                  // Add engine size for non-electric vehicles
                  if (vehicleData.engineSize && vehicleData.fuelType !== 'Electric') {
                    const size = parseFloat(vehicleData.engineSize);
                    // If size > 100, it's in CC, convert to litres
                    const sizeInLitres = size > 100 ? size / 1000 : size;
                    // Round to nearest 0.5 (2.947 -> 3.0, 2.494 -> 2.5, 1.596 -> 1.6)
                    const rounded = Math.round(sizeInLitres * 2) / 2;
                    parts.push(`${rounded.toFixed(1)}L`);
                  }
                  
                  // Add fuel type for better search filtering
                  // For hybrids, show "Petrol Hybrid" or "Diesel Hybrid" (AutoTrader format)
                  if (vehicleData.fuelType && vehicleData.fuelType !== 'Electric') {
                    if (vehicleData.fuelType === 'Hybrid') {
                      // Check if it's petrol or diesel hybrid from variant or default to Petrol Hybrid
                      const variantLower = (vehicleData.variant || '').toLowerCase();
                      if (variantLower.includes('diesel') || variantLower.includes('tdi') || variantLower.includes('hdi')) {
                        parts.push('Diesel Hybrid');
                      } else {
                        parts.push('Petrol Hybrid');
                      }
                    } else {
                      parts.push(vehicleData.fuelType);
                    }
                  }
                  
                  // Add variant if available and meaningful
                  if (vehicleData.variant && 
                      vehicleData.variant !== 'null' && 
                      vehicleData.variant !== 'undefined' && 
                      vehicleData.variant !== vehicleData.fuelType) {
                    parts.push(vehicleData.variant);
                  }
                }
                
                // Add transmission ONLY if not already in displayTitle/variant
                const displayTitleLower = (vehicleData.displayTitle || '').toLowerCase();
                const variantLower = (vehicleData.variant || '').toLowerCase();
                const transmissionInTitle = displayTitleLower.includes('auto') || 
                                           displayTitleLower.includes('manual') ||
                                           displayTitleLower.includes('cvt') ||
                                           displayTitleLower.includes('dsg') ||
                                           variantLower.includes('auto') ||
                                           variantLower.includes('manual') ||
                                           variantLower.includes('cvt') ||
                                           variantLower.includes('dsg');
                
                if (vehicleData.transmission && !transmissionInTitle) {
                  const transmission = vehicleData.transmission.charAt(0).toUpperCase() + vehicleData.transmission.slice(1);
                  parts.push(transmission);
                }
                
                // Add mileage
                if (vehicleData.mileage) {
                  parts.push(`${vehicleData.mileage.toLocaleString()} miles`);
                }
                
                return parts.filter(Boolean).join(' | ');
              })()}
            </p>
            
            <div className="vehicle-actions">
              <a href="#" className="edit-link">Edit vehicle details</a>
              <a href="#" className="attention-link">Add attention grabber</a>
            </div>
            
            <div className="price-section">
              <div className="price-display-wrapper">
                {!isPriceEditing ? (
                  <div className="price-display">
                    <span className="currency">£</span>
                    <span className="price-value">
                      {(() => {
                        // Debug logging
                        console.log('🔍 DEBUG: advertData.price =', advertData.price, 'type:', typeof advertData.price);
                        console.log('🔍 DEBUG: vehicleData?.estimatedValue =', vehicleData?.estimatedValue);
                        console.log('🔍 DEBUG: vehicleData?.allValuations =', vehicleData?.allValuations);
                        console.log('🔍 DEBUG: vehicleData?.valuation =', vehicleData?.valuation);
                        
                        // Try multiple sources for the price
                        let displayPrice = null;
                        
                        // 1. Try advertData.price (should be set from backend)
                        if (advertData.price && (typeof advertData.price === 'number' ? advertData.price > 0 : parseFloat(advertData.price) > 0)) {
                          displayPrice = typeof advertData.price === 'number' ? advertData.price : parseFloat(advertData.price);
                        }
                        // 2. Try vehicleData.valuation.estimatedValue.private
                        else if (vehicleData?.valuation?.estimatedValue?.private && vehicleData.valuation.estimatedValue.private > 0) {
                          displayPrice = vehicleData.valuation.estimatedValue.private;
                        }
                        // 3. Try vehicleData.valuation.estimatedValue.retail
                        else if (vehicleData?.valuation?.estimatedValue?.retail && vehicleData.valuation.estimatedValue.retail > 0) {
                          displayPrice = vehicleData.valuation.estimatedValue.retail;
                        }
                        // 4. Try vehicleData.valuation.privatePrice
                        else if (vehicleData?.valuation?.privatePrice && vehicleData.valuation.privatePrice > 0) {
                          displayPrice = vehicleData.valuation.privatePrice;
                        }
                        // 5. Try vehicleData.allValuations.private
                        else if (vehicleData?.allValuations?.private && vehicleData.allValuations.private > 0) {
                          displayPrice = vehicleData.allValuations.private;
                        }
                        // 6. Try vehicleData.estimatedValue
                        else if (vehicleData?.estimatedValue && vehicleData.estimatedValue > 0) {
                          displayPrice = vehicleData.estimatedValue;
                        }
                        // 7. Try vehicleData.price (database price)
                        else if (vehicleData?.price && vehicleData.price > 0) {
                          displayPrice = vehicleData.price;
                        }
                        
                        console.log('🔍 DEBUG: Final displayPrice =', displayPrice);
                        
                        if (displayPrice && displayPrice > 0) {
                          return displayPrice.toLocaleString();
                        } else {
                          return 'Not set';
                        }
                      })()}
                    </span>
                    <button type="button" onClick={handlePriceEdit} className="edit-price-button">
                      Edit price
                    </button>
                  </div>
                ) : (
                  <div className="price-edit">
                    <span className="currency">£</span>
                    <input
                      type="number"
                      value={advertData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="Enter price"
                      className={`price-input ${errors.price ? 'error' : ''}`}
                      autoFocus
                    />
                    <div className="price-actions">
                      <button 
                        type="button"
                        onClick={handlePriceSave} 
                        className="save-price-button"
                      >
                        Save
                      </button>
                      <button 
                        type="button"
                        onClick={handlePriceCancel} 
                        className="cancel-price-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.price && (
                <p className="error-message">{errors.price}</p>
              )}
              <p className="price-note">
                {vehicleData?.estimatedValue && vehicleData.estimatedValue > 0 ? (
                  <>
                    Our current valuation for your vehicle is £{(vehicleData.allValuations?.private || vehicleData.valuation?.privatePrice || vehicleData.estimatedValue).toLocaleString()}
                    {vehicleData.allValuations && (
                      <span className="valuation-breakdown" style={{ display: 'block', fontSize: '0.9em', marginTop: '8px', color: '#666' }}>
                        💡 Valuation range: 
                        {vehicleData.allValuations.private && ` Private £${vehicleData.allValuations.private.toLocaleString()}`}
                        {vehicleData.allValuations.trade && ` | Trade £${vehicleData.allValuations.trade.toLocaleString()}`}
                        {vehicleData.allValuations.retail && ` | Retail £${vehicleData.allValuations.retail.toLocaleString()}`}
                      </span>
                    )}
                    {vehicleData.valuationConfidence === 'low' && (
                      <span style={{ display: 'block', fontSize: '0.85em', marginTop: '4px', color: '#ff9800' }}>
                        ⚠️ Limited data available - please verify with similar vehicles
                      </span>
                    )}
                  </>
                ) : (
                  '⚠️ Valuation not available for this vehicle. Please research similar vehicles to set a fair price.'
                )}
              </p>
            </div>
          </section>

          {/* Vehicle Specifications */}
          <section className="specifications-section">
            <h3>Overview</h3>
            <div className="spec-actions">
              {!isVehicleDetailsEditing ? (
                <a href="#" className="edit-link" onClick={(e) => { e.preventDefault(); handleVehicleDetailsEdit(); }}>
                  Edit service history, MOT, seats and fuel type
                </a>
              ) : (
                <div className="edit-actions">
                  <button type="button" onClick={handleVehicleDetailsSave} className="save-button">
                    Save
                  </button>
                  <button type="button" onClick={handleVehicleDetailsCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="spec-grid">
              <div className="spec-item">
                <label>MOT Due</label>
                {!isVehicleDetailsEditing ? (
                  <span>
                    {(() => {
                      // Debug MOT data
                      console.log('🔧 MOT Debug on CarAdvertEditPage:', {
                        motLoading,
                        motData,
                        vehicleDataMotDue: vehicleData.motDue,
                        vehicleDataMotExpiry: vehicleData.motExpiry,
                        vehicleDataMotStatus: vehicleData.motStatus,
                        vehicleDataMotHistory: vehicleData.motHistory?.length,
                        fullVehicleData: vehicleData
                      });
                      
                      // Priority 1: Check vehicleData.motDue (from database)
                      if (vehicleData.motDue) {
                        const dateStr = vehicleData.motDue;
                        if (typeof dateStr === 'string' || dateStr instanceof Date) {
                          const date = new Date(dateStr);
                          if (!isNaN(date.getTime())) {
                            console.log('✅ Using vehicleData.motDue:', date);
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Priority 2: Check vehicleData.motExpiry (from database)
                      if (vehicleData.motExpiry) {
                        const dateValue = vehicleData.motExpiry;
                        if (typeof dateValue === 'string' || dateValue instanceof Date) {
                          const date = new Date(dateValue);
                          if (!isNaN(date.getTime())) {
                            console.log('✅ Using vehicleData.motExpiry:', date);
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Priority 3: Check motHistory array (from database)
                      if (vehicleData.motHistory && vehicleData.motHistory.length > 0) {
                        const latestTest = vehicleData.motHistory[0];
                        if (latestTest && latestTest.expiryDate) {
                          const date = new Date(latestTest.expiryDate);
                          if (!isNaN(date.getTime())) {
                            console.log('✅ Using vehicleData.motHistory[0].expiryDate:', date);
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Fallback - MOT data will be fetched and saved on page load
                      console.log('⚠️ No MOT data in database yet (will be fetched automatically)');
                      return 'Contact seller for MOT details';
                    })()}
                  </span>
                ) : (
                  <input
                    type="date"
                    value={editableVehicleData.motDue ? new Date(editableVehicleData.motDue).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditableVehicleData(prev => ({ ...prev, motDue: e.target.value }))}
                    className="edit-input"
                  />
                )}
              </div>
              <div className="spec-item">
                <label>Service History</label>
                {!isVehicleDetailsEditing ? (
                  <span>{advertData.serviceHistory || 'Contact seller'}</span>
                ) : (
                  <select
                    value={editableVehicleData.serviceHistory}
                    onChange={(e) => setEditableVehicleData(prev => ({ ...prev, serviceHistory: e.target.value }))}
                    className="edit-input"
                  >
                    <option value="Contact seller">Contact seller</option>
                    <option value="Full service history">Full service history</option>
                    <option value="Partial service history">Partial service history</option>
                    <option value="No service history">No service history</option>
                  </select>
                )}
              </div>
              <div className="spec-item">
                <label>Fuel type</label>
                {!isVehicleDetailsEditing ? (
                  <span>{vehicleData.fuelType || 'Petrol'}</span>
                ) : (
                  <select
                    value={editableVehicleData.fuelType}
                    onChange={(e) => setEditableVehicleData(prev => ({ ...prev, fuelType: e.target.value }))}
                    className="edit-input"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Petrol Hybrid">Petrol Hybrid</option>
                    <option value="Diesel Hybrid">Diesel Hybrid</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    <option value="Petrol Plug-in Hybrid">Petrol Plug-in Hybrid</option>
                    <option value="Diesel Plug-in Hybrid">Diesel Plug-in Hybrid</option>
                  </select>
                )}
              </div>
              <div className="spec-item">
                <label>Body type</label>
                <span>{vehicleData.bodyType || 'Saloon'}</span>
              </div>
              <div className="spec-item">
                <label>{vehicleData.fuelType === 'Electric' ? 'Electric Range' : 'Engine'}</label>
                <span>
                  {vehicleData.fuelType === 'Electric' 
                    ? (vehicleData.electricRange || vehicleData.runningCosts?.electricRange 
                        ? `${vehicleData.electricRange || vehicleData.runningCosts?.electricRange} miles` 
                        : 'N/A')
                    : (vehicleData.engineSize 
                        ? (() => {
                            const size = parseFloat(vehicleData.engineSize);
                            // If size > 100, it's in CC, convert to litres
                            const sizeInLitres = size > 100 ? size / 1000 : size;
                            // Use 1 decimal precision (2.184 -> 2.2L)
                            return `${sizeInLitres.toFixed(1)}L`;
                          })()
                        : '4.4L')
                  }
                </span>
              </div>
              <div className="spec-item">
                <label>Gearbox</label>
                <span>
                  {vehicleData.transmission || 'Automatic'}
                  {vehicleData.gearbox && ` (${vehicleData.gearbox} speed)`}
                </span>
              </div>
              <div className="spec-item">
                <label>Doors</label>
                <span>{vehicleData.doors || '4'}</span>
              </div>
              <div className="spec-item">
                <label>Seats</label>
                {!isVehicleDetailsEditing ? (
                  <span>{vehicleData.seats || '5'}</span>
                ) : (
                  <input
                    type="number"
                    min="2"
                    max="9"
                    value={editableVehicleData.seats}
                    onChange={(e) => setEditableVehicleData(prev => ({ ...prev, seats: e.target.value }))}
                    className="edit-input"
                  />
                )}
              </div>
              {/* Only show Emission Class if data is available */}
              {(enhancedData?.emissionClass || vehicleData.emissionClass) && (
                <div className="spec-item">
                  <label>Emission Class</label>
                  <span>
                    {enhancedData?.emissionClass || vehicleData.emissionClass}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Description Section */}
          <section className="description-section">
            <h3>Description</h3>
            <p className="section-note">
              You have not added a description yet. Cars with a detailed description sell quicker
            </p>
            <textarea
              value={advertData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your car's condition, service history, any extras or modifications..."
              className={`description-textarea ${errors.description ? 'error' : ''}`}
              rows={6}
            />
            {errors.description && (
              <p className="error-message">{errors.description}</p>
            )}
            <a href="#" className="add-description-link">Add description</a>
          </section>

          {/* Additional Sections */}
          <section className="additional-sections">
            {/* Vehicle Features Section */}
            <div className="section-item expandable">
              <div 
                className="section-header"
                onClick={() => toggleSection('features')}
              >
                <span className="section-icon">⭐</span>
                <span className="section-text">Vehicle features</span>
                <span className={`section-arrow ${expandedSections.features ? 'expanded' : ''}`}>›</span>
              </div>
              
              {expandedSections.features && (
                <div className="section-content">
                  <p className="section-description">Select the features your vehicle has:</p>
                  <div className="features-grid">
                    {[
                      'Air Conditioning', 'Climate Control', 'Leather Seats', 'Heated Seats',
                      'Electric Windows', 'Electric Mirrors', 'Parking Sensors', 'Reversing Camera',
                      'Cruise Control', 'Sat Nav', 'Bluetooth', 'USB Port',
                      'Alloy Wheels', 'Sunroof', 'Panoramic Roof', 'Keyless Entry',
                      'Start/Stop System', 'Lane Assist', 'Blind Spot Monitor', 'Adaptive Cruise Control',
                      'Full service history', 'Partial service history'
                    ].map(feature => (
                      <label key={feature} className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={advertData.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Running Costs Section */}
            <div className="section-item expandable">
              <div 
                className="section-header"
                onClick={() => toggleSection('runningCosts')}
              >
                <span className="section-icon">💰</span>
                <span className="section-text">Running costs</span>
                <span className={`section-arrow ${expandedSections.runningCosts ? 'expanded' : ''}`}>›</span>
              </div>
              
              {expandedSections.runningCosts && (
                <div className="section-content">
                  <p className="section-description">
                    Add running cost information to help buyers. Some fields may be auto-filled from vehicle data.
                  </p>
                  
                  {apiError && (
                    <div className="api-error-banner">
                      <span className="warning-icon">⚠️</span>
                      <span>{apiError}</span>
                    </div>
                  )}
                  
                  <div className="running-costs-form">
                    <div className="form-group">
                      <label>Fuel Economy (MPG)</label>
                      <div className="fuel-economy-inputs">
                        <AutoFillField
                          label="Urban"
                          type="number"
                          value={advertData.runningCosts.fuelEconomy.urban}
                          onChange={(value) => handleRunningCostsChange('fuelEconomy.urban', value)}
                          source={fieldSources?.runningCosts?.fuelEconomy?.urban}
                          unit="mpg"
                          placeholder="e.g. 35.5"
                        />
                        <AutoFillField
                          label="Extra Urban"
                          type="number"
                          value={advertData.runningCosts.fuelEconomy.extraUrban}
                          onChange={(value) => handleRunningCostsChange('fuelEconomy.extraUrban', value)}
                          source={fieldSources?.runningCosts?.fuelEconomy?.extraUrban}
                          unit="mpg"
                          placeholder="e.g. 50.2"
                        />
                        <AutoFillField
                          label="Combined"
                          type="number"
                          value={advertData.runningCosts.fuelEconomy.combined}
                          onChange={(value) => handleRunningCostsChange('fuelEconomy.combined', value)}
                          source={fieldSources?.runningCosts?.fuelEconomy?.combined}
                          unit="mpg"
                          placeholder="e.g. 45.8"
                        />
                      </div>
                    </div>
                    
                    <AutoFillField
                      label="Annual Tax (£)"
                      type="number"
                      value={advertData.runningCosts.annualTax}
                      onChange={(value) => handleRunningCostsChange('annualTax', value)}
                      source={fieldSources?.runningCosts?.annualTax}
                      unit="£"
                      placeholder="e.g. 165"
                    />
                    
                    <AutoFillField
                      label="CO2 Emissions"
                      type="number"
                      value={advertData.runningCosts.co2Emissions}
                      onChange={(value) => handleRunningCostsChange('co2Emissions', value)}
                      source={fieldSources?.runningCosts?.co2Emissions}
                      unit="g/km"
                      placeholder="e.g. 120"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Video Section */}
            <div className="section-item expandable">
              <div 
                className="section-header"
                onClick={() => toggleSection('video')}
              >
                <span className="section-icon">🎥</span>
                <span className="section-text">Advert video - add a video</span>
                <span className={`section-arrow ${expandedSections.video ? 'expanded' : ''}`}>›</span>
              </div>
              
              {expandedSections.video && (
                <div className="section-content">
                  <p className="section-description">
                    Add a YouTube video link to showcase your vehicle. First upload your video to YouTube, then paste the link here.
                  </p>
                  <div className="video-form">
                    <div className="form-group">
                      <label>YouTube Video URL</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={advertData.videoUrl}
                        onChange={(e) => handleVideoUrl(e.target.value)}
                        className="video-url-input"
                      />
                      {advertData.videoUrl && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(advertData.videoUrl) && (
                        <div className="video-preview">
                          <p className="success-message">✓ Valid YouTube URL</p>
                        </div>
                      )}
                      {advertData.videoUrl && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(advertData.videoUrl) && (
                        <p className="error-message">Please enter a valid YouTube URL</p>
                      )}
                    </div>
                    <div className="video-info">
                      <p>💡 Tips for a great video:</p>
                      <ul>
                        <li>Show the exterior from all angles</li>
                        <li>Showcase the interior and features</li>
                        <li>Include a short test drive clip</li>
                        <li>Keep it under 3 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Button */}
          <section className="actions-section">
            {(advertData.photos.length === 0 || !advertData.description.trim()) && (
              <p className="validation-message">
                {advertData.photos.length === 0 && !advertData.description.trim() 
                  ? 'Please add photos and a description to continue'
                  : advertData.photos.length === 0 
                    ? 'Please add at least one photo to continue'
                    : 'Please add a description to continue'}
              </p>
            )}
            
            {/* Show different button based on payment completion or dealer listing */}
            {/* 
              Show "Save Changes" if:
              1. Car is a dealer listing (isDealerCar = true), OR
              2. Car has completed payment (has advertisingPackage with packageId)
              
              Show "I'm happy with my ad" if:
              1. New user car without payment completed
            */}
            {(isDealerCar || (vehicleData?.advertisingPackage?.packageId)) ? (
              <button
                onClick={handleSave}
                disabled={isSaving || advertData.photos.length === 0 || !advertData.description.trim()}
                className="publish-button"
                style={{ backgroundColor: '#4CAF50' }}
              >
                {isSaving ? 'Saving...' : '✓ Save Changes'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isSaving || advertData.photos.length === 0 || !advertData.description.trim()}
                className="publish-button"
              >
                {isSaving ? 'Publishing...' : "I'm happy with my ad"}
              </button>
            )}
          </section>

         
        </div>
      </div>
    </div>
  );
};

export default CarAdvertEditPage;