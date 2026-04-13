import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTradeDealerContext } from '../context/TradeDealerContext';
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
  const { dealer, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const isTradeDealer = isTradeAuthenticated && dealer;
  
  // CRITICAL: Check authentication on mount
  useEffect(() => {
    if (!user && !isTradeAuthenticated) {
      console.log('❌ User not authenticated, redirecting to signin');
      // Redirect to signin with return URL
      navigate(`/signin?redirect=/selling/advert/edit/${advertId}`);
    }
  }, [user, isTradeAuthenticated, navigate, advertId]);
  
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
    videoUrl: '',
    businessName: '',
    businessLogo: '',
    businessWebsite: ''
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
  
  // Vehicle details editing state (make, model, variant only)
  const [isVehicleDetailsEditing, setIsVehicleDetailsEditing] = useState(false);
  const [editableVehicleData, setEditableVehicleData] = useState({
    make: '',
    model: '',
    variant: ''
  });
  
  // Overview section editing state (model, variant, motDue, engineSize, doors, gearbox, seats, fuelType, color)
  const [isOverviewEditing, setIsOverviewEditing] = useState(false);
  const [editableOverviewData, setEditableOverviewData] = useState({
    model: '',
    variant: '',
    motDue: '',
    engineSize: '',
    doors: '',
    transmission: '',
    seats: '',
    fuelType: ''
  });
  
  // Enhanced data processing state
  const [enhancedDataProcessed, setEnhancedDataProcessed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Logo upload handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      console.log('📤 Uploading business logo...');
      
      // Convert file to base64
      const base64Image = await uploadService.fileToBase64(file);
      console.log('✅ File converted to base64, length:', base64Image.length);
      
      // Upload to backend
      const response = await uploadService.uploadImage(base64Image, advertId);
      console.log('📡 Upload response:', response);
      
      const logoUrl = response.data?.url || response.url;
      console.log('🔗 Logo URL extracted:', logoUrl);
      
      if (logoUrl) {
        const updatedAdvertData = {
          ...advertData,
          businessLogo: logoUrl
        };
        
        setAdvertData(updatedAdvertData);
        console.log('✅ Business logo uploaded successfully:', logoUrl);
        
        // CRITICAL: Auto-save business logo to database
        try {
          console.log('💾 Auto-saving business logo to database...');
          await advertService.updateAdvert(advertId, updatedAdvertData, vehicleData);
          console.log('✅ Business logo saved to database');
        } catch (saveError) {
          console.error('❌ Failed to save business logo:', saveError);
          // Don't show error to user - logo is uploaded, just not saved yet
        }
      } else {
        console.error('❌ Upload response missing URL:', response);
        throw new Error(response.message || 'Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('❌ Logo upload failed:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-save business info with debounce
  useEffect(() => {
    // Only auto-save if advertId exists and business info has changed
    if (!advertId || !advertData.businessName && !advertData.businessWebsite) return;
    
    const timeout = setTimeout(async () => {
      try {
        console.log('💾 Auto-saving business info...');
        await advertService.updateAdvert(advertId, advertData, vehicleData);
        console.log('✅ Business info saved successfully');
      } catch (error) {
        console.error('❌ Failed to save business info:', error);
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeout);
  }, [advertData.businessName, advertData.businessWebsite]);

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
          
          // CRITICAL: Authorization check - verify user owns this car (skip for admin)
          const isAdmin = user?.isAdmin || user?.role === 'admin';
          
          // Convert ObjectIds to strings for comparison
          const vehicleUserId = vehicleData.userId?._id?.toString() || vehicleData.userId?.toString();
          const currentUserId = user?._id?.toString() || user?.id?.toString();
          
          console.log('🔐 Authorization check:', {
            vehicleUserId,
            currentUserId,
            isAdmin,
            match: vehicleUserId === currentUserId
          });
          
          if (user && vehicleUserId && vehicleUserId !== currentUserId && !isAdmin) {
            console.error('❌ Authorization failed: User does not own this car');
            setLoadError('You do not have permission to edit this advert');
            setIsLoading(false);
            setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
            return;
          }
          
          // Log if admin is editing someone else's car
          if (isAdmin && vehicleUserId && vehicleUserId !== currentUserId) {
            console.log('👑 Admin editing car owned by another user');
          }
          
          // CRITICAL: Authorization check for trade dealers
          const vehicleDealerId = vehicleData.dealerId?._id?.toString() || vehicleData.dealerId?.toString();
          const currentDealerId = dealer?._id?.toString() || dealer?.id?.toString();
          
          if (isTradeDealer && vehicleDealerId && vehicleDealerId !== currentDealerId) {
            console.error('❌ Authorization failed: Dealer does not own this car');
            setLoadError('You do not have permission to edit this advert');
            setIsLoading(false);
            setTimeout(() => navigate('/trade/dashboard'), 3000); // Redirect after 3 seconds
            return;
          }
          
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
          
          // 🔒 PROTECTED: Check if we need to fetch enhanced data
          // IMPORTANT: Only fetch for NEW cars without payment (draft/pending_payment)
          // For existing cars with payment completed, data should already be in database
          const needsValuation = !vehicleData.valuation?.privatePrice && !vehicleData.allValuations?.private;
          const needsRunningCosts = !vehicleData.runningCosts?.annualTax;
          const needsEnhancedData = needsValuation || needsRunningCosts;
          
          // Check if this is a new user car (no payment completed yet)
          const isNewUserCar = vehicleData.advertStatus === 'draft' || vehicleData.advertStatus === 'pending_payment';
          
          // 🔒 CRITICAL: Check if MOT data is missing
          const needsMOTData = !vehicleData.motDue && !vehicleData.motExpiry;
          const hasMOTHistory = vehicleData.motHistory && vehicleData.motHistory.length > 0;
          
          console.log('🔍 Enhanced data check:', {
            needsValuation,
            needsRunningCosts,
            needsEnhancedData,
            isNewUserCar,
            advertStatus: vehicleData.advertStatus,
            hasValuation: !!vehicleData.valuation?.privatePrice,
            hasRunningCosts: !!vehicleData.runningCosts?.annualTax,
            hasMOTData: !!(vehicleData.motDue || vehicleData.motExpiry),
            hasMOTHistory,
            registrationNumber: vehicleData.registrationNumber
          });
          
          // 🔒 PROTECTED: Only fetch for NEW cars OR if critical data is missing
          // NEVER fetch for existing cars with payment completed
          const shouldFetchEnhancedData = isNewUserCar && needsEnhancedData;
          const shouldFetchMOT = isNewUserCar && needsMOTData && !hasMOTHistory;
          
          if (!shouldFetchEnhancedData && !shouldFetchMOT) {
            console.log('✅ Skipping API calls - data already in database or payment completed');
            console.log('💰 Saving API costs by using cached data');
          }
          
          // Only fetch enhanced data for NEW user cars (draft/pending_payment)
          if (vehicleData.registrationNumber && (shouldFetchEnhancedData || shouldFetchMOT)) {
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
              
              // CRITICAL: Only update MOT data if it doesn't already exist in database
              // This prevents duplicate API calls and overwrites
              const hasMOTDataInDB = vehicleData.motHistory && vehicleData.motHistory.length > 0;
              
              if (!hasMOTDataInDB && (enhancedVehicleData.motStatus || enhancedVehicleData.motDue || enhancedVehicleData.motExpiry)) {
                console.log('🔧 Updating MOT data from enhanced data (first time)');
                const motDataToSave = {
                  motStatus: enhancedVehicleData.motStatus || vehicleData.motStatus,
                  motDue: enhancedVehicleData.motDue || enhancedVehicleData.motExpiry || vehicleData.motDue,
                  motExpiry: enhancedVehicleData.motExpiry || enhancedVehicleData.motDue || vehicleData.motExpiry,
                  motHistory: enhancedVehicleData.motHistory || vehicleData.motHistory || []
                };
                
                // CRITICAL: Update frontend state while preserving valuation
                setVehicleData(prev => ({
                  ...prev,
                  ...motDataToSave,
                  // Explicitly preserve valuation data
                  valuation: prev.valuation,
                  estimatedValue: prev.estimatedValue,
                  allValuations: prev.allValuations,
                  price: prev.price
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
              } else if (hasMOTDataInDB) {
                console.log('✅ MOT data already exists in database - skipping update to prevent duplicate API calls');
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
                    
                    // CRITICAL: Update frontend state while preserving valuation
                    setVehicleData(prev => ({
                      ...prev,
                      ...dvlaMotData,
                      // Explicitly preserve valuation data
                      valuation: prev.valuation,
                      estimatedValue: prev.estimatedValue,
                      allValuations: prev.allValuations,
                      price: prev.price
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
                
                // CRITICAL: Update frontend state while preserving valuation
                setVehicleData(prev => ({
                  ...prev,
                  ...newCarMotData,
                  // Explicitly preserve valuation data
                  valuation: prev.valuation,
                  estimatedValue: prev.estimatedValue,
                  allValuations: prev.allValuations,
                  price: prev.price
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
        
        // CRITICAL: Merge with existing vehicleData to preserve any data already loaded
        setVehicleData(prev => ({
          ...prev,
          ...response.data.vehicleData,
          // Preserve valuation if it exists in prev
          valuation: response.data.vehicleData.valuation || prev?.valuation,
          estimatedValue: response.data.vehicleData.estimatedValue || prev?.estimatedValue,
          allValuations: response.data.vehicleData.allValuations || prev?.allValuations,
          // Preserve MOT data if it exists in prev
          motDue: response.data.vehicleData.motDue || prev?.motDue,
          motExpiry: response.data.vehicleData.motExpiry || prev?.motExpiry,
          motStatus: response.data.vehicleData.motStatus || prev?.motStatus,
          motHistory: response.data.vehicleData.motHistory || prev?.motHistory
        }));
        
        // Don't fetch MOT data from API to avoid charges
        // For new users: MOT data should come from the initial vehicle lookup API call
        // For existing cars: MOT data should already be in the car document from when payment was completed
        if (response.data.vehicleData?.registrationNumber) {
          console.log('⚠️ Skipping MOT API call to avoid charges');
          console.log('💡 MOT data should be available in car document already or from initial lookup');
        }
        
        // 🔒 PROTECTED: Check if we need to fetch enhanced data
        // IMPORTANT: Only fetch for NEW cars without payment (draft/pending_payment)
        // For existing cars with payment completed, data should already be in database
        const needsValuation = !response.data.vehicleData?.valuation?.privatePrice && 
                               !response.data.vehicleData?.allValuations?.private;
        const needsRunningCosts = !response.data.vehicleData?.runningCosts?.annualTax;
        const needsEnhancedData = needsValuation || needsRunningCosts;
        
        // Check if this is a new user car (no payment completed yet)
        const isNewUserCar = response.data.vehicleData?.advertStatus === 'draft' || 
                            response.data.vehicleData?.advertStatus === 'pending_payment';
        
        // 🔒 CRITICAL: Check for MOT data
        const needsMOTData = !response.data.vehicleData?.motDue && !response.data.vehicleData?.motExpiry;
        const hasMOTHistory = response.data.vehicleData?.motHistory && response.data.vehicleData.motHistory.length > 0;
        
        console.log('🔍 Enhanced data check (fallback):', {
          needsValuation,
          needsRunningCosts,
          needsEnhancedData,
          isNewUserCar,
          advertStatus: response.data.vehicleData?.advertStatus,
          hasValuation: !!response.data.vehicleData?.valuation?.privatePrice,
          hasRunningCosts: !!response.data.vehicleData?.runningCosts?.annualTax,
          needsMOTData,
          hasMOTHistory
        });
        
        // 🔒 PROTECTED: Only fetch for NEW cars OR if critical data is missing
        const shouldFetchEnhancedData = isNewUserCar && needsEnhancedData;
        const shouldFetchMOT = isNewUserCar && needsMOTData && !hasMOTHistory;
        
        if (!shouldFetchEnhancedData && !shouldFetchMOT) {
          console.log('✅ Skipping API calls (fallback) - data already in database or payment completed');
          console.log('💰 Saving API costs by using cached data');
        }
        
        // Only fetch enhanced data for NEW user cars (draft/pending_payment)
        if (response.data.vehicleData?.registrationNumber && (shouldFetchEnhancedData || shouldFetchMOT)) {
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
            
            // CRITICAL: Only update MOT data in fallback if it doesn't already exist
            const hasMOTDataInDB = response.data.vehicleData?.motHistory && response.data.vehicleData.motHistory.length > 0;
            
            if (!hasMOTDataInDB && (enhancedVehicleData.motStatus || enhancedVehicleData.motDue || enhancedVehicleData.motExpiry)) {
              console.log('🔧 Updating MOT data from enhanced data (fallback - first time)');
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
            } else if (hasMOTDataInDB) {
              console.log('✅ MOT data already exists in database (fallback) - skipping update');
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
                  setVehicleData(prev => ({ 
                    ...prev, 
                    ...dvlaMotData,
                    // Explicitly preserve valuation data
                    valuation: prev.valuation,
                    estimatedValue: prev.estimatedValue,
                    allValuations: prev.allValuations,
                    price: prev.price
                  }));
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
              urban: (response.data.vehicleData?.runningCosts?.fuelEconomy?.urban ?? response.data.vehicleData?.fuelEconomyUrban ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.fuelEconomy?.urban ?? response.data.vehicleData?.fuelEconomyUrban ?? ''), 
              extraUrban: (response.data.vehicleData?.runningCosts?.fuelEconomy?.extraUrban ?? response.data.vehicleData?.fuelEconomyExtraUrban ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.fuelEconomy?.extraUrban ?? response.data.vehicleData?.fuelEconomyExtraUrban ?? ''), 
              combined: (response.data.vehicleData?.runningCosts?.fuelEconomy?.combined ?? response.data.vehicleData?.fuelEconomyCombined ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.fuelEconomy?.combined ?? response.data.vehicleData?.fuelEconomyCombined ?? '') 
            },
            annualTax: (response.data.vehicleData?.runningCosts?.annualTax ?? response.data.vehicleData?.annualTax ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.annualTax ?? response.data.vehicleData?.annualTax ?? ''),
            insuranceGroup: (response.data.vehicleData?.runningCosts?.insuranceGroup ?? response.data.vehicleData?.insuranceGroup ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.insuranceGroup ?? response.data.vehicleData?.insuranceGroup ?? ''),
            co2Emissions: (response.data.vehicleData?.runningCosts?.co2Emissions ?? response.data.vehicleData?.co2Emissions ?? '') === null ? '' : String(response.data.vehicleData?.runningCosts?.co2Emissions ?? response.data.vehicleData?.co2Emissions ?? '')
          },
          videoUrl: response.data.advertData?.videoUrl || '',
          // CRITICAL FIX: Include business info from sellerContact
          businessName: response.data.vehicleData?.sellerContact?.businessName || response.data.advertData?.businessName || '',
          businessLogo: response.data.vehicleData?.sellerContact?.businessLogo || response.data.advertData?.businessLogo || '',
          businessWebsite: response.data.vehicleData?.sellerContact?.businessWebsite || response.data.advertData?.businessWebsite || ''
        });
        
        console.log('🏢 Business info loaded:', {
          businessName: response.data.vehicleData?.sellerContact?.businessName || response.data.advertData?.businessName,
          businessLogo: response.data.vehicleData?.sellerContact?.businessLogo || response.data.advertData?.businessLogo,
          businessWebsite: response.data.vehicleData?.sellerContact?.businessWebsite || response.data.advertData?.businessWebsite
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
  
  // Handle vehicle details edit (make, model, variant only)
  const handleVehicleDetailsEdit = () => {
    console.log('🖱️ Edit vehicle details button clicked!');
    
    // Initialize editable data with current values
    setEditableVehicleData({
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      variant: vehicleData.variant || ''
    });
    
    setIsVehicleDetailsEditing(true);
  };
  
  // Handle vehicle details save
  const handleVehicleDetailsSave = async () => {
    try {
      console.log('💾 Saving vehicle details:', editableVehicleData);
      
      // Validate make and model (required fields)
      if (!editableVehicleData.make || !editableVehicleData.make.trim()) {
        setErrors(prev => ({ ...prev, make: 'Make is required' }));
        return;
      }
      
      if (!editableVehicleData.model || !editableVehicleData.model.trim()) {
        setErrors(prev => ({ ...prev, model: 'Model is required' }));
        return;
      }
      
      // Clear any errors
      setErrors(prev => ({ ...prev, make: null, model: null, variant: null }));
      
      // CRITICAL DEBUG: Log what we're about to save
      console.log('🔍 Saving vehicle details:');
      console.log('   editableVehicleData.make:', editableVehicleData.make);
      console.log('   editableVehicleData.model:', editableVehicleData.model);
      console.log('   editableVehicleData.variant:', editableVehicleData.variant);
      
      // Update only make, model, and variant
      const updateData = {
        make: editableVehicleData.make.trim(),
        model: editableVehicleData.model.trim(),
        variant: editableVehicleData.variant ? editableVehicleData.variant.trim() : ''
      };
      
      console.log('💾 Update data being sent:', updateData);
      
      // Save to backend (will update both Car and VehicleHistory)
      // CRITICAL: Pass empty object as advertData, and updateData as vehicleData
      const response = await advertService.updateAdvert(advertId, {}, {
        ...vehicleData,
        ...updateData
      });
      
      console.log('✅ Vehicle details saved successfully:', response);
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        ...updateData
      }));
      
      console.log('✅ Local state updated with new data:', updateData);
      
      // Show success message
      alert('Vehicle details saved successfully! Page will reload to show changes.');
      
      // Exit editing mode
      setIsVehicleDetailsEditing(false);
      
      // Reload page to fetch fresh data from database
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('❌ Error saving vehicle details:', error);
      setErrors(prev => ({ ...prev, vehicleDetails: 'Failed to save. Please try again.' }));
    }
  };
  
  // Handle vehicle details cancel
  const handleVehicleDetailsCancel = () => {
    setIsVehicleDetailsEditing(false);
    // Reset editable data
    const resetData = {
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      variant: vehicleData.variant || ''
    };
    console.log('🔄 Resetting editable data:', resetData);
    setEditableVehicleData(resetData);
  };
  
  // Handle Overview section edit (model, variant, motDue, engineSize, doors, transmission, seats, fuelType, color)
  const handleOverviewEdit = () => {
    console.log('🖱️ Overview edit button clicked!');
    setEditableOverviewData({
      model: vehicleData.model || '',
      variant: vehicleData.variant || '',
      motDue: vehicleData.motDue || vehicleData.motExpiry || '',
      engineSize: vehicleData.engineSize || '',
      doors: vehicleData.doors || '',
      transmission: vehicleData.transmission || '',
      seats: vehicleData.seats || '',
      fuelType: vehicleData.fuelType || '',
      color: vehicleData.color || ''
    });
    setIsOverviewEditing(true);
  };
  
  // Handle Overview save
  const handleOverviewSave = async () => {
    try {
      console.log('💾 Saving Overview data:', editableOverviewData);
      
      // Validate model (required)
      if (!editableOverviewData.model || !editableOverviewData.model.trim()) {
        setErrors(prev => ({ ...prev, model: 'Model is required' }));
        return;
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, model: null, variant: null }));
      
      const updateData = {
        model: editableOverviewData.model.trim(),
        variant: editableOverviewData.variant ? editableOverviewData.variant.trim() : '',
        motDue: editableOverviewData.motDue || null,
        motExpiry: editableOverviewData.motDue || null, // Save to both fields
        engineSize: editableOverviewData.engineSize ? parseFloat(editableOverviewData.engineSize) : null,
        doors: editableOverviewData.doors ? parseInt(editableOverviewData.doors) : null,
        transmission: editableOverviewData.transmission || null,
        seats: editableOverviewData.seats ? parseInt(editableOverviewData.seats) : null,
        fuelType: editableOverviewData.fuelType || null,
        color: editableOverviewData.color ? editableOverviewData.color.trim() : null
      };
      
      console.log('💾 Saving to database:', updateData);
      
      // Save to backend
      const response = await advertService.updateAdvert(advertId, {}, {
        ...vehicleData,
        ...updateData
      });
      
      console.log('✅ Overview saved successfully:', response);
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Show success message
      alert('Changes saved successfully!');
      
      // Exit editing mode
      setIsOverviewEditing(false);
      
      // Reload to show fresh data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('❌ Error saving Overview:', error);
      setErrors(prev => ({ ...prev, overview: 'Failed to save. Please try again.' }));
    }
  };
  
  // Handle Overview cancel
  const handleOverviewCancel = () => {
    setIsOverviewEditing(false);
    setEditableOverviewData({
      model: vehicleData.model || '',
      variant: vehicleData.variant || '',
      motDue: vehicleData.motDue || vehicleData.motExpiry || '',
      engineSize: vehicleData.engineSize || '',
      doors: vehicleData.doors || '',
      transmission: vehicleData.transmission || '',
      seats: vehicleData.seats || '',
      fuelType: vehicleData.fuelType || '',
      color: vehicleData.color || ''
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
    console.log('📤 Publishing advert with data:', {
      advertDataKeys: Object.keys(advertData),
      businessName: advertData.businessName,
      businessLogo: advertData.businessLogo,
      businessWebsite: advertData.businessWebsite,
      hasLogo: !!(advertData.businessLogo && advertData.businessLogo.trim()),
      hasWebsite: !!(advertData.businessWebsite && advertData.businessWebsite.trim())
    });
    
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
                  {advertData.photos.map((photo, index) => {
                    // Handle both string URLs and object format
                    const photoUrl = typeof photo === 'string' ? photo : photo.url;
                    const photoId = typeof photo === 'string' ? `photo-${index}` : photo.id;
                    
                    console.log(`📸 Photo ${index}:`, photo, '→ URL:', photoUrl);
                    
                    return (
                      <div key={photoId} className="photo-item">
                        <img 
                          src={photoUrl} 
                          alt={`Car photo ${index + 1}`}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', photoUrl);
                            e.target.style.border = '2px solid red';
                            e.target.alt = 'Failed to load';
                          }} 
                        />
                        <button
                          className="remove-photo"
                          onClick={() => removePhoto(photoId)}
                          disabled={isUploading}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
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
            {!isVehicleDetailsEditing ? (
              <>
                <h2>
                  {/* AutoTrader Style Line 1: Make + Model only */}
                  {vehicleData.make} {vehicleData.model}
                </h2>
                <p className="vehicle-subtitle">
                  {/* AutoTrader Style Line 2: Variant + Battery + BodyType + Transmission + Doors */}
                  {(() => {
                    const parts = [];
                    
                    // 1. Variant
                    if (vehicleData.variant && 
                        vehicleData.variant !== 'null' && 
                        vehicleData.variant !== 'undefined' && 
                        vehicleData.variant.trim() !== '') {
                      parts.push(vehicleData.variant.trim());
                    }
                    
                    // 2. Battery capacity for PHEV/Electric
                    if (vehicleData.batteryCapacity) {
                      parts.push(`${vehicleData.batteryCapacity}kWh`);
                    }
                    
                    // 3. Body type
                    if (vehicleData.bodyType && vehicleData.bodyType !== 'null' && vehicleData.bodyType !== 'undefined') {
                      parts.push(vehicleData.bodyType);
                    }
                    
                    // 4. Transmission
                    if (vehicleData.transmission) {
                      const trans = vehicleData.transmission.toLowerCase();
                      parts.push(trans === 'automatic' || trans === 'auto' ? 'Auto' : trans === 'manual' ? 'Manual' : vehicleData.transmission);
                    }
                    
                    // 5. Doors
                    if (vehicleData.doors) {
                      parts.push(`${vehicleData.doors}dr`);
                    }
                    
                    return parts.filter(Boolean).join(' ');
                  })()}
                </p>
                
                <div className="vehicle-actions">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleVehicleDetailsEdit(); }} className="edit-link">Edit vehicle details</a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="attention-link">Add attention grabber</a>
                </div>
              </>
            ) : (
              <div className="vehicle-details-edit-form">
                <h3>Edit Vehicle Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="make">Make *</label>
                    <input
                      type="text"
                      id="make"
                      value={editableVehicleData.make || ''}
                      onChange={(e) => setEditableVehicleData(prev => ({ ...prev, make: e.target.value }))}
                      placeholder="e.g. BMW, Mercedes, Audi"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="model">Model *</label>
                    <input
                      type="text"
                      id="model"
                      value={editableVehicleData.model || ''}
                      onChange={(e) => setEditableVehicleData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g. 3 Series, C-Class, A4"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="variant">Variant</label>
                  <input
                    type="text"
                    id="variant"
                    value={editableVehicleData.variant || ''}
                    onChange={(e) => setEditableVehicleData(prev => ({ ...prev, variant: e.target.value }))}
                    placeholder="e.g. 320d M Sport, C220d AMG Line"
                  />
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    onClick={handleVehicleDetailsCancel}
                    style={{
                      padding: '10px 24px',
                      marginRight: '12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      color: '#333'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleVehicleDetailsSave}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#f59e0b',
                      color: 'white'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            <div className="price-section">
              <div className="price-display-wrapper">
                {!isPriceEditing ? (
                  <div className="price-display">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
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
                    </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Overview</h3>
              {!isOverviewEditing && (
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleOverviewEdit();
                  }} 
                  className="edit-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    padding: '4px 8px'
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            
            <div className="spec-grid">
              <div className="spec-item">
                <label>Model</label>
                {isOverviewEditing ? (
                  <input
                    type="text"
                    value={editableOverviewData.model || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g. 3 Series, C-Class"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>{vehicleData.model || 'Not set'}</span>
                )}
              </div>
              <div className="spec-item">
                <label>Variant</label>
                {isOverviewEditing ? (
                  <input
                    type="text"
                    value={editableOverviewData.variant || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, variant: e.target.value }))}
                    placeholder="e.g. 320d M Sport"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>{vehicleData.variant || 'Not set'}</span>
                )}
              </div>
              <div className="spec-item">
                <label>MOT Due</label>
                {isOverviewEditing ? (
                  <input
                    type="date"
                    value={editableOverviewData.motDue ? new Date(editableOverviewData.motDue).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, motDue: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>
                    {(() => {
                      // Priority 1: Check vehicleData.motDue (from database)
                      if (vehicleData?.motDue) {
                        const dateStr = vehicleData.motDue;
                        if (typeof dateStr === 'string' || dateStr instanceof Date) {
                          const date = new Date(dateStr);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Priority 2: Check vehicleData.motExpiry (from database)
                      if (vehicleData?.motExpiry) {
                        const dateValue = vehicleData.motExpiry;
                        if (typeof dateValue === 'string' || dateValue instanceof Date) {
                          const date = new Date(dateValue);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Priority 3: Check motHistory array (from database)
                      if (vehicleData?.motHistory && vehicleData.motHistory.length > 0) {
                        const latestTest = vehicleData.motHistory[0];
                        if (latestTest && latestTest.expiryDate) {
                          const date = new Date(latestTest.expiryDate);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                          }
                        }
                      }
                      
                      // Fallback
                      return 'Contact seller for MOT details';
                    })()}
                  </span>
                )}
              </div>
              <div className="spec-item">
                <label>Service History</label>
                <span>{advertData.serviceHistory || 'Contact seller'}</span>
              </div>
              <div className="spec-item">
                <label>Fuel type</label>
                {isOverviewEditing ? (
                  <select
                    value={editableOverviewData.fuelType || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, fuelType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Petrol Plug-in Hybrid">Petrol Plug-in Hybrid</option>
                    <option value="Diesel Plug-in Hybrid">Diesel Plug-in Hybrid</option>
                    <option value="Petrol Hybrid">Petrol Hybrid</option>
                    <option value="Diesel Hybrid">Diesel Hybrid</option>
                  </select>
                ) : (
                  <span>{vehicleData.fuelType || 'Petrol'}</span>
                )}
              </div>
              <div className="spec-item">
                <label>Body type</label>
                <span>{vehicleData.bodyType || 'Saloon'}</span>
              </div>
              <div className="spec-item">
                <label>{vehicleData.fuelType === 'Electric' ? 'Electric Range' : 'Engine'}</label>
                {isOverviewEditing && vehicleData.fuelType !== 'Electric' ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editableOverviewData.engineSize || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, engineSize: e.target.value }))}
                    placeholder="e.g. 2.0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
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
                )}
              </div>
              <div className="spec-item">
                <label>Gearbox</label>
                {isOverviewEditing ? (
                  <select
                    value={editableOverviewData.transmission || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, transmission: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                ) : (
                  <span>
                    {vehicleData.transmission || 'Automatic'}
                    {vehicleData.gearbox && ` (${vehicleData.gearbox} speed)`}
                  </span>
                )}
              </div>
              <div className="spec-item">
                <label>Doors</label>
                {isOverviewEditing ? (
                  <input
                    type="number"
                    min="2"
                    max="5"
                    value={editableOverviewData.doors || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, doors: e.target.value }))}
                    placeholder="e.g. 4"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>{vehicleData.doors || '4'}</span>
                )}
              </div>
              <div className="spec-item">
                <label>Seats</label>
                {isOverviewEditing ? (
                  <input
                    type="number"
                    min="2"
                    max="9"
                    value={editableOverviewData.seats || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, seats: e.target.value }))}
                    placeholder="e.g. 5"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>{vehicleData.seats || '5'}</span>
                )}
              </div>
              <div className="spec-item">
                <label>Body Colour</label>
                {isOverviewEditing ? (
                  <input
                    type="text"
                    value={editableOverviewData.color || ''}
                    onChange={(e) => setEditableOverviewData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g. Black, White, Silver"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <span>{vehicleData.color || 'Not specified'}</span>
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
            
            {/* Save/Cancel buttons for Overview editing */}
            {isOverviewEditing && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button
                  key="overview-save"
                  type="button"
                  onClick={handleOverviewSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Save Changes
                </button>
                <button
                  key="overview-cancel"
                  type="button"
                  onClick={handleOverviewCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </section>

          {/* Description Section */}
          <section className="description-section">
            <h3>Description</h3>
            {!advertData.description || advertData.description.trim() === '' ? (
              <p className="section-note">
                You have not added a description yet. Cars with a detailed description sell quicker
              </p>
            ) : (
              <p className="section-note" style={{ color: '#28a745' }}>
                ✓ Description added. You can edit it below.
              </p>
            )}
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
          </section>

          {/* Business Information Section - VISIBLE FOR ALL USERS */}
          {!isOverviewEditing && !isVehicleDetailsEditing && (
            <section className="business-info-section">
              <h3>Business Information (Optional)</h3>
              
              {/* Red Alert for Trade Users */}
              <div className="trade-user-alert" style={{
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>
                    Important for Trade Users
                  </strong>
                  <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                    If you are a trade user, please add your business logo and website below. This helps buyers identify professional dealers and builds trust in your listing.
                  </p>
                </div>
              </div>
              
              <p className="section-note">
                Add business details to list as a trade seller. If you add a logo or website, your listing will automatically be marked as "Trade".
              </p>
              
              <div className="form-group">
                <label htmlFor="businessName">
                  Business Name <span className="optional">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={advertData.businessName}
                  onChange={(e) => setAdvertData({
                    ...advertData,
                    businessName: e.target.value
                  })}
                  placeholder="e.g., ABC Motors Ltd"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="businessWebsite">
                  Business Website <span className="optional">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="businessWebsite"
                  value={advertData.businessWebsite}
                  onChange={(e) => setAdvertData({
                    ...advertData,
                    businessWebsite: e.target.value
                  })}
                  placeholder="https://www.yourbusiness.com"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="businessLogo">
                  Business Logo <span className="optional">(Optional)</span>
                </label>
                <input
                  type="file"
                  id="businessLogo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="form-input"
                />
                {advertData.businessLogo && (
                  <div className="logo-preview">
                    <img src={advertData.businessLogo} alt="Business logo" />
                    <button
                      type="button"
                      onClick={() => setAdvertData({...advertData, businessLogo: ''})}
                      className="remove-logo-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              {/* Auto-detection indicator */}
              {(advertData.businessLogo || advertData.businessWebsite) && (
                <div className="trade-indicator">
                  <span className="indicator-icon">✓</span>
                  <span className="indicator-text">
                    Your listing will appear as a trade seller
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Additional Sections - Show but hide Video and Features when editing */}
          {!isOverviewEditing && !isVehicleDetailsEditing && (
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
                      label="Insurance Group"
                      type="number"
                      value={advertData.runningCosts.insuranceGroup}
                      onChange={(value) => handleRunningCostsChange('insuranceGroup', value)}
                      source={fieldSources?.runningCosts?.insuranceGroup}
                      placeholder="e.g. 15"
                      min="1"
                      max="50"
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
            {true && (
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
            )}
          </section>
          )}

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
            {(isDealerCar || (vehicleData?.advertisingPackage?.packageId) || (user?.isAdmin || user?.role === 'admin')) ? (
              <button
                onClick={handleSave}
                disabled={isSaving || advertData.photos.length === 0 || !advertData.description.trim()}
                className="publish-button"
                style={{ backgroundColor: '#f59e0b' }}
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