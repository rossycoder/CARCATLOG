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
  const { user, loading: authLoading } = useAuth();
  const { dealer, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const isTradeDealer = isTradeAuthenticated && dealer;
  
  // CRITICAL: Check authentication on mount - but wait for auth to load first
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      return;
    }
    
    if (!user && !isTradeAuthenticated) {
      // Redirect to signin with return URL
      navigate(`/signin?redirect=/selling/advert/edit/${advertId}`);
    }
  }, [user, isTradeAuthenticated, authLoading, navigate, advertId]);
  
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
  const [priceBeforeEdit, setPriceBeforeEdit] = useState(null);
  const [rawPriceInput, setRawPriceInput] = useState('');
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
    fuelType: '',
    color: ''
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
      
      // Convert file to base64
      const base64Image = await uploadService.fileToBase64(file);
      
      // Upload to backend
      const response = await uploadService.uploadImage(base64Image, advertId);
      
      const logoUrl = response.data?.url || response.url;
      
      if (logoUrl) {
        const updatedAdvertData = {
          ...advertData,
          businessLogo: logoUrl
        };
        
        setAdvertData(updatedAdvertData);
        
        // CRITICAL: Auto-save business logo to database
        try {
          await advertService.updateAdvert(advertId, updatedAdvertData, vehicleData);
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
        await advertService.updateAdvert(advertId, advertData, vehicleData);
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
          setAdvertData(prev => {
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
      
      if (!advertId) {
        console.error('❌ No advert ID provided');
        navigate('/find-your-car');
        return;
      }
      
      // Try to fetch from vehicle API first (for cars created via DVLA lookup)
      try {
        const vehicleResponse = await api.get(`/vehicles/${advertId}`);
        
        if (vehicleResponse.data && vehicleResponse.data.data) {
          const vehicleData = vehicleResponse.data.data;
          
          // CRITICAL DEBUG: Check what price data is in database
          
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
          setCarStatus(vehicleData.advertStatus || enhancedVehicleData.advertStatus); // Store car status
          setIsDealerCar(vehicleData.isDealerListing || false); // Store if it's a dealer car
          
          // CRITICAL: Authorization check - verify user owns this car (skip for admin)
          const isAdmin = user?.isAdmin || user?.role === 'admin';
          
          // Convert ObjectIds to strings for comparison
          const vehicleUserId = vehicleData.userId?._id?.toString() || vehicleData.userId?.toString();
          const currentUserId = user?._id?.toString() || user?.id?.toString();
          
          
          if (user && vehicleUserId && vehicleUserId !== currentUserId && !isAdmin) {
            console.error('❌ Authorization failed: User does not own this car');
            setLoadError('You do not have permission to edit this advert');
            setIsLoading(false);
            setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
            return;
          }
          
          // Log if admin is editing someone else's car
          if (isAdmin && vehicleUserId && vehicleUserId !== currentUserId) {
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
          
          
          // Populate form fields with existing data
          // Use actual saved price first, fall back to valuation only if no price set
          const preferredPrice = enhancedVehicleData.price || 
                                enhancedVehicleData.valuation?.privatePrice || 
                                enhancedVehicleData.allValuations?.private || 0;
          
          
          // Ensure price is a valid number
          const finalPrice = preferredPrice && preferredPrice > 0 ? parseFloat(preferredPrice) : 0;
          
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
          }, 100);
          
          
          // Don't fetch MOT data to avoid API charges
          // For new users: MOT data should come from the initial vehicle lookup API call
          // For existing cars: MOT data should already be in the car document from when payment was completed
          if (vehicleData.registrationNumber) {
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
          
          
          // 🔒 PROTECTED: Only fetch for NEW cars OR if critical data is missing
          // NEVER fetch for existing cars with payment completed
          const shouldFetchEnhancedData = isNewUserCar && needsEnhancedData;
          const shouldFetchMOT = isNewUserCar && needsMOTData && !hasMOTHistory;
          
          if (!shouldFetchEnhancedData && !shouldFetchMOT) {
          }
          
          // Only fetch enhanced data for NEW user cars (draft/pending_payment)
          if (vehicleData.registrationNumber && (shouldFetchEnhancedData || shouldFetchMOT)) {
            if (isNewUserCar) {
            } else if (needsMOTData) {
            } else {
            }
            
            try {
              const enhancedVehicleData = await lookupVehicle(vehicleData.registrationNumber, vehicleData.mileage);
              
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
                }
              } else {
                // No valuation available - keep existing price or let user set manually
                if (!vehicleData.price || vehicleData.price === 0) {
                }
              }
              
              // Update running costs
              if (enhancedVehicleData.runningCosts) {
                
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
                  
                  
                  return {
                    ...prev,
                    runningCosts: newRunningCosts
                  };
                });
              } else {
              }
              
              // CRITICAL: Only update MOT data if it doesn't already exist in database
              // This prevents duplicate API calls and overwrites
              const hasMOTDataInDB = vehicleData.motHistory && vehicleData.motHistory.length > 0;
              
              if (!hasMOTDataInDB && (enhancedVehicleData.motStatus || enhancedVehicleData.motDue || enhancedVehicleData.motExpiry)) {
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
                  await api.patch(`/vehicles/${advertId}`, {
                    motStatus: motDataToSave.motStatus,
                    motDue: motDataToSave.motDue,
                    motExpiry: motDataToSave.motExpiry,
                    motHistory: motDataToSave.motHistory
                  });
                } catch (saveError) {
                  console.error('❌ Failed to save MOT data to database:', saveError.message);
                }
              } else if (hasMOTDataInDB) {
              } else {
                // FALLBACK: Try fetching MOT from DVLA if CheckCarDetails didn't have it
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
                  } else {
                  }
                } catch (dvlaError) {
                  console.error('❌ Failed to fetch MOT from DVLA:', dvlaError.message);
                }
              }
              
              if (enhancedVehicleData.year >= 2020) {
                // For new cars (2020+), calculate MOT due date (3 years from first registration)
                const motDueYear = enhancedVehicleData.year + 3;
                const motDueDate = `${motDueYear}-10-31`; // Approximate date
                
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
                  await api.patch(`/vehicles/${advertId}`, newCarMotData);
                } catch (saveError) {
                  console.error('❌ Failed to save calculated MOT data:', saveError.message);
                }
              } else {
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
          }
          
          setIsLoading(false);
          return;
        }
      } catch (vehicleErr) {
      }
      
      // Fallback to advert service (for backward compatibility)
      const response = await advertService.getAdvert(advertId);
      
      
      if (response.success && response.data) {
        
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
        
        
        // 🔒 PROTECTED: Only fetch for NEW cars OR if critical data is missing
        const shouldFetchEnhancedData = isNewUserCar && needsEnhancedData;
        const shouldFetchMOT = isNewUserCar && needsMOTData && !hasMOTHistory;
        
        if (!shouldFetchEnhancedData && !shouldFetchMOT) {
        }
        
        // Only fetch enhanced data for NEW user cars (draft/pending_payment)
        if (response.data.vehicleData?.registrationNumber && (shouldFetchEnhancedData || shouldFetchMOT)) {
          if (isNewUserCar) {
          } else {
          }
          
          try {
            const enhancedVehicleData = await lookupVehicle(
              response.data.vehicleData.registrationNumber, 
              response.data.vehicleData.mileage
            );
            
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
              } catch (saveError) {
                console.error('❌ Failed to save MOT data (fallback):', saveError.message);
              }
            } else if (hasMOTDataInDB) {
            } else {
              // DVLA Fallback in advert service path
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
                }
              } catch (dvlaError) {
                console.error('❌ DVLA MOT fetch failed (fallback):', dvlaError.message);
              }
            }
          } catch (enhancedError) {
            console.warn('⚠️ Failed to fetch enhanced data:', enhancedError.message);
          }
        } else {
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
        
        
      } else {
        console.error('❌ Failed to load advert:', response.message);
        throw new Error(response.message || 'Failed to load advert data');
      }
    } catch (error) {
      console.error('❌ Error loading advert:', error);
      setLoadError(error.message || 'Failed to load advert data');
      // Don't redirect immediately, let user retry
    } finally {
      setIsLoading(false);
    }
  }, [advertId, navigate, lookupVehicle]);

  // Fetch MOT data from API
  const fetchMOTData = async (vrm) => {
    
    // Set loading to false and empty data
    setMotLoading(false);
    setMotData({
      tests: [],
      message: 'MOT data should be available in the car listing data'
    });
  };

  // Auto-fix price if it's not set but we have valuation data
useEffect(() => {
  // ✅ YEH LINE ADD KARO — editing ke waqt price mat badlo
  if (isPriceEditing) return;
  
  if (vehicleData && (!advertData.price || advertData.price <= 0 || typeof advertData.price !== 'number')) {
    const availablePrice = vehicleData.valuation?.estimatedValue?.private || 
                         vehicleData.valuation?.estimatedValue?.retail ||
                         vehicleData.valuation?.privatePrice || 
                         vehicleData.allValuations?.private || 
                         vehicleData.estimatedValue || 
                         vehicleData.price;
    if (availablePrice && availablePrice > 0) {
      const numericPrice = parseFloat(availablePrice);
      if (!isNaN(numericPrice) && numericPrice > 0) {
        setAdvertData(prev => ({ ...prev, price: numericPrice }));
      }
    }
  }
}, [vehicleData, advertData.price, isPriceEditing]); // ✅ isPriceEditing add karo dependency mein
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
      // Allow typing freely - only validate on save
      if (value === '' || value === null || value === undefined) {
        setAdvertData(prev => ({ ...prev, [field]: '' }));
      } else {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
          setAdvertData(prev => ({ ...prev, [field]: numericValue }));
        } else if (/^\d*$/.test(value)) {
          // Allow partial numeric input while typing
          setAdvertData(prev => ({ ...prev, [field]: value }));
        }
      }
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
  // Save current price for Discard
  setPriceBeforeEdit(advertData.price);
  // Raw input string mein convert karo — yahi input field dikhayega
  setRawPriceInput(
    advertData.price !== '' && advertData.price !== null && advertData.price !== undefined
      ? String(Math.round(Number(advertData.price)))
      : ''
  );
  setIsPriceEditing(true);
};
 
  // Handle price save
 const handlePriceSave = async () => {
  // Use advertData.price (updated by handleInputChange) as the source of truth
  const priceValue = parseFloat(String(advertData.price).trim());
 
  if (!advertData.price || isNaN(priceValue) || priceValue <= 0) {
    setErrors(prev => ({ ...prev, price: 'Please enter a valid price' }));
    return;
  }
 
  setErrors(prev => ({ ...prev, price: null }));
 
  try {
    const updatedAdvertData = {
      ...advertData,
      price: priceValue,
    };
 
    await advertService.updateAdvert(advertId, updatedAdvertData, vehicleData);
 
    // State update: ab advertData.price ek clean number hai
    setAdvertData(prev => ({ ...prev, price: priceValue }));
    setIsPriceEditing(false);
    setRawPriceInput('');
    setPriceBeforeEdit(null);
  } catch (error) {
    console.error('Error saving price:', error);
    setErrors(prev => ({ ...prev, price: 'Failed to save price. Please try again.' }));
  }
};
  
  // Handle price cancel - restore price before edit
 const handlePriceCancel = () => {
  // Restore exactly what was there before editing
  if (priceBeforeEdit !== null && priceBeforeEdit !== undefined) {
    setAdvertData(prev => ({ ...prev, price: priceBeforeEdit }));
  }
  setRawPriceInput('');
  setPriceBeforeEdit(null);
  setErrors(prev => ({ ...prev, price: null }));
  setIsPriceEditing(false);
};
  // Handle vehicle details edit (make, model, variant only)
  const handleVehicleDetailsEdit = () => {
    
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
      
      // Update only make, model, and variant
      const updateData = {
        make: editableVehicleData.make.trim(),
        model: editableVehicleData.model.trim(),
        variant: editableVehicleData.variant ? editableVehicleData.variant.trim() : ''
      };
      
      
      // Save to backend (will update both Car and VehicleHistory)
      // CRITICAL: Pass empty object as advertData, and updateData as vehicleData
      const response = await advertService.updateAdvert(advertId, {}, {
        ...vehicleData,
        ...updateData
      });
      
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        ...updateData
      }));
      
      
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
  
  // Handle vehicle details cancel - auto-saves changes
  const handleVehicleDetailsCancel = async () => {
    // Auto-save if make and model are valid
    if (editableVehicleData.make?.trim() && editableVehicleData.model?.trim()) {
      try {
        const updateData = {
          make: editableVehicleData.make.trim(),
          model: editableVehicleData.model.trim(),
          variant: editableVehicleData.variant ? editableVehicleData.variant.trim() : ''
        };
        await advertService.updateAdvert(advertId, {}, { ...vehicleData, ...updateData });
        setVehicleData(prev => ({ ...prev, ...updateData }));
      } catch (error) {
        console.error('❌ Error auto-saving vehicle details:', error);
      }
    }
    setIsVehicleDetailsEditing(false);
  };
  
  // Handle Overview section edit (model, variant, motDue, engineSize, doors, transmission, seats, fuelType, color)
  const handleOverviewEdit = () => {
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
      
      
      // Save to backend
      const response = await advertService.updateAdvert(advertId, {}, {
        ...vehicleData,
        ...updateData
      });
      
      
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
  
  // Handle Overview cancel - auto-saves changes
  const handleOverviewCancel = async () => {
    // Auto-save if model is valid
    if (editableOverviewData.model?.trim()) {
      try {
        const updateData = {
          model: editableOverviewData.model.trim(),
          variant: editableOverviewData.variant ? editableOverviewData.variant.trim() : '',
          motDue: editableOverviewData.motDue || null,
          motExpiry: editableOverviewData.motDue || null,
          engineSize: editableOverviewData.engineSize ? parseFloat(editableOverviewData.engineSize) : null,
          doors: editableOverviewData.doors ? parseInt(editableOverviewData.doors) : null,
          transmission: editableOverviewData.transmission || null,
          seats: editableOverviewData.seats ? parseInt(editableOverviewData.seats) : null,
          fuelType: editableOverviewData.fuelType || null,
          color: editableOverviewData.color ? editableOverviewData.color.trim() : null
        };
        await advertService.updateAdvert(advertId, {}, { ...vehicleData, ...updateData });
        setVehicleData(prev => ({ ...prev, ...updateData }));
      } catch (error) {
        console.error('❌ Error auto-saving overview:', error);
      }
    }
    setIsOverviewEditing(false);
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
        
        // Send both features and serviceHistory
        const updateData = { 
          features: newFeatures,
          serviceHistory: serviceHistory
        };
        
        await advertService.updateAdvert(advertId, updateData, vehicleData);
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
    
    // Determine seller type based on business info
    const hasBusinessInfo = !!(
      (advertData?.businessLogo && advertData.businessLogo.trim()) ||
      (advertData?.businessWebsite && advertData.businessWebsite.trim()) ||
      (advertData?.businessName && advertData.businessName.trim())
    );

    // Navigate to seller contact details page
    navigate(`/selling/advert/contact/${advertId}`, {
      state: {
        advertData,
        vehicleData,
        sellerType: isTradeDealer ? 'trade' : (hasBusinessInfo ? 'trade' : 'private')
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
        <div className="popup-overlay" onClick={(e) => {
          // Only close if clicking directly on overlay, not on popup content
          if (e.target.className === 'popup-overlay') {
            closePopup();
          }
        }}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
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
        {/* Save All Changes Button - Only show in edit mode (payment complete or dealer car) */}
        {/* Hide for draft/pending_payment cars (new car being added) */}
        {((carStatus === 'active' || isDealerCar || (user?.isAdmin || user?.role === 'admin')) && 
          carStatus !== 'draft' && carStatus !== 'pending_payment') && (
          <div className="sticky-save-bar">
            <div className="sticky-save-container">
              <div className="save-info">
                <span className="save-icon">💾</span>
                <span className="save-text">
                  {advertData.photos.length === 0 || !advertData.description.trim()
                    ? 'Add photos and description to save'
                    : 'Click to save all your changes'}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || advertData.photos.length === 0 || !advertData.description.trim()}
                className="sticky-save-button"
              >
                {isSaving ? '⏳ Saving...' : '✓ Save All Changes'}
              </button>
            </div>
          </div>
        )}

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
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#1a4ba0',
                      color: 'white'
                    }}
                  >
                    ✓ Done
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
                          
                          
                          if (displayPrice && displayPrice > 0) {
                            return displayPrice.toLocaleString();
                          } else {
                            return 'Not set';
                          }
                        })()}
                      </span>
                    </div>
                    {/* Price edit allowed for all cars including active */}
                    {true && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePriceEdit(); }} 
                        className="edit-price-button"
                        style={{ position: 'relative', zIndex: 20 }}
                      >
                        ✏️ Edit Price
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="price-edit">
                    <span className="currency">£</span>
                    <input
                      type="text"
                      inputMode="numeric"
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
                        ✓ Save Price
                      </button>
                      <button 
                        type="button"
                        onClick={handlePriceCancel} 
                        className="cancel-price-button"
                      >
                        Discard
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
              {/* Edit Overview button - always show (price edit restricted for active cars) */}
              {!isOverviewEditing && (
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleOverviewEdit();
                  }} 
                  className="edit-overview-button"
                  style={{
                    background: '#1a4ba0',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}
                >
                  ✏️ Edit Overview
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
            
            {/* Done button for Overview editing - auto-saves on click */}
            {isOverviewEditing && (
              <div style={{ marginTop: '16px' }}>
                <button
                  key="overview-done"
                  type="button"
                  onClick={handleOverviewCancel}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#1a4ba0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ✓ Done
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

          {/* Business Information Section - Only show for non-trade dealers on draft/pending cars */}
          {!isTradeDealer && (carStatus || vehicleData?.advertStatus) !== 'active' && (
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
                  onChange={(e) => isDealerCar && carStatus === 'active' ? null : setAdvertData({
                    ...advertData,
                    businessName: e.target.value
                  })}
                  readOnly={isDealerCar && carStatus === 'active'}
                  placeholder="e.g., ABC Motors Ltd"
                  className="form-input"
                  style={isDealerCar && carStatus === 'active' ? { backgroundColor: '#f5f5f5', cursor: 'default' } : {}}
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
                  onChange={(e) => isDealerCar && carStatus === 'active' ? null : setAdvertData({
                    ...advertData,
                    businessWebsite: e.target.value
                  })}
                  readOnly={isDealerCar && carStatus === 'active'}
                  placeholder="https://www.yourbusiness.com"
                  className="form-input"
                  style={isDealerCar && carStatus === 'active' ? { backgroundColor: '#f5f5f5', cursor: 'default' } : {}}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="businessLogo">
                  Business Logo <span className="optional">(Optional)</span>
                </label>
                {!(isDealerCar && carStatus === 'active') && (
                <input
                  type="file"
                  id="businessLogo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="form-input"
                />
                )}
                {advertData.businessLogo && (
                  <div className="logo-preview">
                    <img src={advertData.businessLogo} alt="Business logo" />
                    {!(isDealerCar && carStatus === 'active') && (
                    <button
                      type="button"
                      onClick={() => setAdvertData({...advertData, businessLogo: ''})}
                      className="remove-logo-btn"
                    >
                      Remove
                    </button>
                    )}
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

          {/* Additional Sections - Only show for draft/pending cars */}
          {(carStatus || vehicleData?.advertStatus) !== 'active' && (
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
            
            {/* Show "I'm happy with my ad" button for draft/pending_payment cars */}
            {(carStatus === 'draft' || carStatus === 'pending_payment') && (
              <button
                onClick={handlePublish}
                disabled={advertData.photos.length === 0 || !advertData.description.trim()}
                className="publish-button"
              >
                I'm happy with my ad - Continue
              </button>
            )}
          </section>

         
        </div>
      </div>
    </div>
  );
};

export default CarAdvertEditPage;