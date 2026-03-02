import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import uploadService from '../../services/uploadService';
import AutoFillField from '../../components/AutoFillField/AutoFillField';
import useBikeLookup from '../../hooks/useBikeLookup';
import './BikeAdvertEditPage.css';

const BikeAdvertEditPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Bike lookup hook for auto-fill functionality
  const {
    loading: apiLoading,
    error: apiError,
    bikeData: enhancedData,
    sources: fieldSources,
    lookupBike,
    reset: resetLookup
  } = useBikeLookup();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
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
  const [isEditingVehicleDetails, setIsEditingVehicleDetails] = useState(false);
  const [editableVehicleData, setEditableVehicleData] = useState({
    make: '',
    model: '',
    variant: ''
  });
  
  // Overview editing state (fuel type, bike type, color, etc.)
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editableOverviewData, setEditableOverviewData] = useState({
    fuelType: '',
    bikeType: '',
    color: '',
    engineSize: '',
    engineCC: ''
  });
  
  // Price suggestion from valuation
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  
  // Enhanced data processing state
  const [enhancedDataProcessed, setEnhancedDataProcessed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load vehicle data and advert details on mount
  useEffect(() => {
    loadAdvertData();
  }, [advertId]);

  // Auto-save business info when it changes
  useEffect(() => {
    // Only auto-save if advertId exists and business info has changed
    if (!advertId || (!advertData.businessName && !advertData.businessWebsite && !advertData.businessLogo)) return;
    
    const timeout = setTimeout(async () => {
      try {
        // Save to localStorage
        const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
        const updatedData = {
          ...currentData,
          advertData: {
            ...currentData.advertData,
            businessName: advertData.businessName,
            businessWebsite: advertData.businessWebsite,
            businessLogo: advertData.businessLogo
          },
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
        console.log('✅ Business info auto-saved');
      } catch (error) {
        console.error('❌ Failed to auto-save business info:', error);
      }
    }, 1000); // Debounce 1 second
    
    return () => clearTimeout(timeout);
  }, [advertData.businessName, advertData.businessWebsite, advertData.businessLogo]);

  // Show popup when page loads
  useEffect(() => {
    if (vehicleData && !isLoading) {
      setShowPopup(true);
    }
  }, [vehicleData, isLoading]);

  // Set suggested price from valuation
  useEffect(() => {
    if (vehicleData && vehicleData.estimatedValue) {
      // For bikes, use the estimated value as suggested price
      setSuggestedPrice(vehicleData.estimatedValue);
    }
  }, [vehicleData]);
  
  // Auto-fill data when enhanced data is received from API
  useEffect(() => {
    if (enhancedData && !apiLoading && !enhancedDataProcessed) {
      setEnhancedDataProcessed(true); // Prevent duplicate processing
      
      console.log('🏍️ Auto-filling bike data from API:', enhancedData);
      
      // Auto-fill running costs ONLY if API has data
      if (enhancedData.combinedMpg || enhancedData.annualTax || enhancedData.insuranceGroup || enhancedData.co2Emissions) {
        console.log('💰 Auto-filling running costs from API:', {
          combinedMpg: enhancedData.combinedMpg,
          urbanMpg: enhancedData.urbanMpg,
          extraUrbanMpg: enhancedData.extraUrbanMpg,
          annualTax: enhancedData.annualTax,
          insuranceGroup: enhancedData.insuranceGroup,
          co2Emissions: enhancedData.co2Emissions
        });
        
        setAdvertData(prev => {
          const newRunningCosts = {
            fuelEconomy: {
              urban: String(enhancedData.urbanMpg || ''),
              extraUrban: String(enhancedData.extraUrbanMpg || ''),
              combined: String(enhancedData.combinedMpg || '')
            },
            annualTax: String(enhancedData.annualTax || ''),
            insuranceGroup: String(enhancedData.insuranceGroup || ''),
            co2Emissions: String(enhancedData.co2Emissions || '')
          };
          
          return {
            ...prev,
            runningCosts: newRunningCosts
          };
        });
        
        // Auto-save the running costs
        setTimeout(() => {
          const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
          const updatedData = {
            ...currentData,
            advertData: {
              ...currentData.advertData,
              runningCosts: {
                fuelEconomy: {
                  urban: String(enhancedData.urbanMpg || ''),
                  extraUrban: String(enhancedData.extraUrbanMpg || ''),
                  combined: String(enhancedData.combinedMpg || '')
                },
                annualTax: String(enhancedData.annualTax || ''),
                insuranceGroup: String(enhancedData.insuranceGroup || ''),
                co2Emissions: String(enhancedData.co2Emissions || '')
              }
            },
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
          console.log('✅ Running costs auto-saved from API data');
        }, 500);
      } else {
        console.log('ℹ️ API has no running costs data - fields will remain empty (no frontend generation)');
      }
    }
  }, [enhancedData, apiLoading, enhancedDataProcessed, advertId]);

  const loadAdvertData = async () => {
    try {
      setIsLoading(true);
      
      // STEP 1: Try to fetch bike from database first (if it exists after payment)
      let databaseBike = null;
      try {
        console.log('🔍 Fetching bike from database with advertId:', advertId);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bikes/advert/${advertId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            databaseBike = result.data;
            console.log('✅ Bike found in database:', databaseBike._id);
            console.log('📊 MOT History:', databaseBike.motHistory?.length || 0, 'records');
            console.log('📊 MOT Due Date:', databaseBike.motDue || databaseBike.motExpiry || 'Not available');
            console.log('📊 Previous Owners:', databaseBike.historyCheckData?.previousKeepers || 'Not available');
          }
        }
      } catch (dbError) {
        console.log('⚠️ Bike not yet in database (will be created after payment)');
      }
      
      // STEP 2: Fetch advert data from localStorage
      const storedData = localStorage.getItem(`bikeAdvert_${advertId}`);
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        
        // STEP 3: Merge database data with localStorage data (database takes priority for MOT/history)
        const mergedVehicleData = {
          ...parsed.vehicleData,
          // Override with database data if available (after payment, complete data is fetched)
          ...(databaseBike && {
            motDue: databaseBike.motDue || databaseBike.motExpiry || databaseBike.motExpiryDate,
            motHistory: databaseBike.motHistory || [],
            previousOwners: databaseBike.historyCheckData?.previousKeepers || parsed.vehicleData.previousOwners,
            isWrittenOff: databaseBike.historyCheckData?.isWrittenOff || false,
            // Update running costs from database if available
            ...(databaseBike.runningCosts && {
              combinedMpg: databaseBike.runningCosts.fuelEconomy?.combined,
              urbanMpg: databaseBike.runningCosts.fuelEconomy?.urban,
              extraUrbanMpg: databaseBike.runningCosts.fuelEconomy?.extraUrban,
              annualTax: databaseBike.runningCosts.annualTax,
              insuranceGroup: databaseBike.runningCosts.insuranceGroup,
              co2Emissions: databaseBike.runningCosts.co2Emissions
            })
          })
        };
        
        console.log('🔄 Merged vehicle data:', {
          fromDatabase: !!databaseBike,
          motDue: mergedVehicleData.motDue,
          motHistoryCount: mergedVehicleData.motHistory?.length || 0,
          previousOwners: mergedVehicleData.previousOwners
        });
        
        setVehicleData(mergedVehicleData);
        
        // Extract private price from valuation structure (priority order)
        const privatePrice = 
          parsed.advertData?.price || // Saved price (highest priority)
          mergedVehicleData.valuation?.private || // Valuation private price
          mergedVehicleData.allValuations?.private || // Alternative valuation structure
          mergedVehicleData.estimatedValue || // Fallback to estimated value
          '';
        
        console.log('💰 Price extraction:', {
          savedPrice: parsed.advertData?.price,
          valuationPrivate: mergedVehicleData.valuation?.private,
          allValuationsPrivate: mergedVehicleData.allValuations?.private,
          estimatedValue: mergedVehicleData.estimatedValue,
          finalPrice: privatePrice
        });
        
        setAdvertData({
          price: privatePrice,
          description: parsed.advertData?.description || '',
          photos: parsed.advertData?.photos || [],
          contactPhone: parsed.advertData?.contactPhone || '',
          contactEmail: parsed.advertData?.contactEmail || user?.email || '',
          location: parsed.advertData?.location || '',
          features: parsed.advertData?.features || [],
          runningCosts: parsed.advertData?.runningCosts || {
            fuelEconomy: { urban: '', extraUrban: '', combined: '' },
            annualTax: '',
            insuranceGroup: '',
            co2Emissions: ''
          },
          videoUrl: parsed.advertData?.videoUrl || '',
          // CRITICAL FIX: Include business info from sellerContact
          businessName: parsed.vehicleData?.sellerContact?.businessName || parsed.advertData?.businessName || '',
          businessLogo: parsed.vehicleData?.sellerContact?.businessLogo || parsed.advertData?.businessLogo || '',
          businessWebsite: parsed.vehicleData?.sellerContact?.businessWebsite || parsed.advertData?.businessWebsite || ''
        });
        
        console.log('🏢 Business info loaded:', {
          businessName: parsed.vehicleData?.sellerContact?.businessName || parsed.advertData?.businessName,
          businessLogo: parsed.vehicleData?.sellerContact?.businessLogo || parsed.advertData?.businessLogo,
          businessWebsite: parsed.vehicleData?.sellerContact?.businessWebsite || parsed.advertData?.businessWebsite
        });
        
        // CRITICAL: Fetch MOT + Valuation data immediately if not already available
        const needsMOTData = !mergedVehicleData.motDue || mergedVehicleData.motDue === 'Unknown';
        const needsValuationData = !mergedVehicleData.valuation?.private && !mergedVehicleData.estimatedValue;
        
        if ((needsMOTData || needsValuationData) && mergedVehicleData.registration) {
          console.log('🔍 Fetching MOT + Valuation data for:', mergedVehicleData.registration);
          console.log('   Needs MOT:', needsMOTData, '| Needs Valuation:', needsValuationData);
          
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/bikes/complete-lookup/${mergedVehicleData.registration}?mileage=${mergedVehicleData.mileage || 50000}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Complete bike data fetched:', {
                motDue: result.data?.motDue,
                motExpiry: result.data?.motExpiry,
                motHistoryCount: result.data?.motHistory?.length || 0,
                estimatedValue: result.data?.estimatedValue,
                valuation: result.data?.valuation,
                runningCosts: {
                  combinedMpg: result.data?.combinedMpg,
                  annualTax: result.data?.annualTax,
                  co2Emissions: result.data?.co2Emissions
                }
              });
              
              // Update merged vehicle data with API response
              if (result.data) {
                mergedVehicleData.motDue = result.data.motDue || result.data.motExpiry || mergedVehicleData.motDue;
                mergedVehicleData.motExpiry = result.data.motExpiry || result.data.motDue || mergedVehicleData.motExpiry;
                mergedVehicleData.motHistory = result.data.motHistory || mergedVehicleData.motHistory || [];
                mergedVehicleData.estimatedValue = result.data.estimatedValue || mergedVehicleData.estimatedValue;
                mergedVehicleData.valuation = result.data.valuation || mergedVehicleData.valuation;
                
                // CRITICAL: Update running costs from API (ONLY if API has data)
                if (result.data.combinedMpg || result.data.annualTax || result.data.co2Emissions) {
                  mergedVehicleData.combinedMpg = result.data.combinedMpg || mergedVehicleData.combinedMpg;
                  mergedVehicleData.urbanMpg = result.data.urbanMpg || mergedVehicleData.urbanMpg;
                  mergedVehicleData.extraUrbanMpg = result.data.extraUrbanMpg || mergedVehicleData.extraUrbanMpg;
                  mergedVehicleData.annualTax = result.data.annualTax || mergedVehicleData.annualTax;
                  mergedVehicleData.insuranceGroup = result.data.insuranceGroup || mergedVehicleData.insuranceGroup;
                  mergedVehicleData.co2Emissions = result.data.co2Emissions || mergedVehicleData.co2Emissions;
                  
                  console.log('✅ Running costs updated from API:', {
                    combinedMpg: mergedVehicleData.combinedMpg,
                    annualTax: mergedVehicleData.annualTax,
                    co2Emissions: mergedVehicleData.co2Emissions
                  });
                } else {
                  console.log('ℹ️ API has no running costs data - fields will remain empty');
                }
                
                // Update vehicleData state
                setVehicleData(mergedVehicleData);
                
                // Update localStorage with fetched data
                const updatedData = {
                  ...parsed,
                  vehicleData: {
                    ...parsed.vehicleData,
                    motDue: mergedVehicleData.motDue,
                    motExpiry: mergedVehicleData.motExpiry,
                    motHistory: mergedVehicleData.motHistory || [],
                    estimatedValue: mergedVehicleData.estimatedValue,
                    valuation: mergedVehicleData.valuation,
                    // Update running costs if API has data
                    ...(result.data.combinedMpg || result.data.annualTax || result.data.co2Emissions ? {
                      combinedMpg: mergedVehicleData.combinedMpg,
                      urbanMpg: mergedVehicleData.urbanMpg,
                      extraUrbanMpg: mergedVehicleData.extraUrbanMpg,
                      annualTax: mergedVehicleData.annualTax,
                      insuranceGroup: mergedVehicleData.insuranceGroup,
                      co2Emissions: mergedVehicleData.co2Emissions
                    } : {})
                  },
                  updatedAt: new Date().toISOString()
                };
                localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
                console.log('✅ MOT + Valuation + Running Costs data saved to localStorage');
              }
            } else {
              console.warn('⚠️ Failed to fetch complete bike data:', response.status);
            }
          } catch (error) {
            console.error('❌ Error fetching complete bike data:', error);
          }
        } else {
          console.log('ℹ️ MOT and Valuation data already available');
        }
        
      } else {
        throw new Error('Advert not found');
      }
    } catch (error) {
      console.error('Error loading advert:', error);
      setLoadError(error.message);
      // If advert doesn't exist, redirect back
      navigate('/bikes/sell-your-bike');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle feature selection
  const toggleFeature = (feature) => {
    setAdvertData(prev => {
      const newFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      
      return {
        ...prev,
        features: newFeatures
      };
    });
    
    // Auto-save features with debounce
    if (featureSaveTimeout) {
      clearTimeout(featureSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveFeatures(advertData.features);
    }, 1000);
    
    setFeatureSaveTimeout(timeout);
  };

  // Auto-save features
  const saveFeatures = useCallback(async (features) => {
    try {
      // Save to localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        advertData: {
          ...currentData.advertData,
          features: features
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      console.log('✅ Features auto-saved');
    } catch (error) {
      console.error('❌ Error auto-saving features:', error);
    }
  }, [advertId]);

  const handleInputChange = (field, value) => {
    setAdvertData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle price edit button click
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
    
    // Auto-save price to localStorage
    try {
      const updatedAdvertData = {
        ...advertData,
        price: priceValue // Ensure price is a number
      };
      
      console.log('💰 Saving bike price:', priceValue);
      
      // Save to localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        advertData: updatedAdvertData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      console.log('✅ Bike price saved successfully to localStorage');
      
      // Update local state with the saved price
      setAdvertData(prev => ({
        ...prev,
        price: priceValue
      }));
      
      // Exit editing mode after successful save
      setIsPriceEditing(false);
    } catch (error) {
      console.error('❌ Error saving bike price:', error);
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
  const handleVehicleDetailsEdit = (e) => {
    e.preventDefault();
    console.log('🖱️ Edit vehicle details button clicked!');
    
    // Initialize editable data with current values
    setEditableVehicleData({
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      variant: vehicleData.variant || ''
    });
    
    setIsEditingVehicleDetails(true);
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
      
      // Update only make, model, and variant
      const updateData = {
        make: editableVehicleData.make.trim(),
        model: editableVehicleData.model.trim(),
        variant: editableVehicleData.variant ? editableVehicleData.variant.trim() : '',
        userEditedFields: {
          make: true,
          model: true,
          variant: !!editableVehicleData.variant
        }
      };
      
      console.log('💾 Update data being sent:', updateData);
      
      // Save to backend via API
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/bikes/${advertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update vehicle details');
      }
      
      const data = await response.json();
      console.log('✅ Vehicle details saved successfully:', data);
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        make: updateData.make,
        model: updateData.model,
        variant: updateData.variant
      }));
      
      // Also update localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        vehicleData: {
          ...currentData.vehicleData,
          make: updateData.make,
          model: updateData.model,
          variant: updateData.variant
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      
      console.log('✅ Local state and localStorage updated');
      
      // Exit editing mode
      setIsEditingVehicleDetails(false);
      alert('Vehicle details updated successfully!');
    } catch (error) {
      console.error('❌ Error saving vehicle details:', error);
      setErrors(prev => ({ ...prev, vehicleDetails: 'Failed to save. Please try again.' }));
      alert('Failed to update vehicle details. Please try again.');
    }
  };
  
  // Handle vehicle details cancel
  const handleVehicleDetailsCancel = () => {
    setIsEditingVehicleDetails(false);
    // Reset editable data
    setEditableVehicleData({
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      variant: vehicleData.variant || ''
    });
    // Clear any errors
    setErrors(prev => ({ ...prev, make: null, model: null, variant: null }));
  };
  
  // Handle overview edit (fuel type, bike type, color, etc.)
  const handleOverviewEdit = (e) => {
    e.preventDefault();
    console.log('🖱️ Edit overview button clicked!');
    
    // Initialize editable data with current values
    setEditableOverviewData({
      fuelType: vehicleData.fuelType || '',
      bikeType: vehicleData.bikeType || '',
      color: vehicleData.color || '',
      engineSize: vehicleData.engineSize || '',
      engineCC: vehicleData.engineCC || ''
    });
    
    setIsEditingOverview(true);
  };
  
  // Handle overview save
  const handleOverviewSave = async () => {
    try {
      console.log('💾 Saving overview data:', editableOverviewData);
      
      // Validate required fields
      if (!editableOverviewData.fuelType || !editableOverviewData.fuelType.trim()) {
        setErrors(prev => ({ ...prev, fuelType: 'Fuel type is required' }));
        return;
      }
      
      // Clear any errors
      setErrors(prev => ({ ...prev, fuelType: null, bikeType: null, color: null }));
      
      // Update data
      const updateData = {
        fuelType: editableOverviewData.fuelType.trim(),
        bikeType: editableOverviewData.bikeType ? editableOverviewData.bikeType.trim() : '',
        color: editableOverviewData.color ? editableOverviewData.color.trim() : '',
        engineSize: editableOverviewData.engineSize ? editableOverviewData.engineSize.trim() : '',
        engineCC: editableOverviewData.engineCC ? parseInt(editableOverviewData.engineCC) : null,
        userEditedFields: {
          fuelType: true,
          bikeType: !!editableOverviewData.bikeType,
          color: !!editableOverviewData.color,
          engineSize: !!editableOverviewData.engineSize,
          engineCC: !!editableOverviewData.engineCC
        }
      };
      
      console.log('💾 Update data being sent:', updateData);
      
      // Save to backend via API
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/bikes/${advertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update overview data');
      }
      
      const data = await response.json();
      console.log('✅ Overview data saved successfully:', data);
      
      // Update local state
      setVehicleData(prev => ({
        ...prev,
        fuelType: updateData.fuelType,
        bikeType: updateData.bikeType,
        color: updateData.color,
        engineSize: updateData.engineSize,
        engineCC: updateData.engineCC
      }));
      
      // Also update localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        vehicleData: {
          ...currentData.vehicleData,
          fuelType: updateData.fuelType,
          bikeType: updateData.bikeType,
          color: updateData.color,
          engineSize: updateData.engineSize,
          engineCC: updateData.engineCC
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      
      console.log('✅ Local state and localStorage updated');
      
      // Exit editing mode
      setIsEditingOverview(false);
      alert('Overview data updated successfully!');
    } catch (error) {
      console.error('❌ Error saving overview data:', error);
      setErrors(prev => ({ ...prev, overview: 'Failed to save. Please try again.' }));
      alert('Failed to update overview data. Please try again.');
    }
  };
  
  // Handle overview cancel
  const handleOverviewCancel = () => {
    setIsEditingOverview(false);
    // Reset editable data
    setEditableOverviewData({
      fuelType: vehicleData.fuelType || '',
      bikeType: vehicleData.bikeType || '',
      color: vehicleData.color || '',
      engineSize: vehicleData.engineSize || '',
      engineCC: vehicleData.engineCC || ''
    });
    // Clear any errors
    setErrors(prev => ({ ...prev, fuelType: null, bikeType: null, color: null, overview: null }));
  };

  // Auto-save running costs with debounce
  const saveRunningCosts = useCallback(async (runningCostsData) => {
    try {
      // Save to localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        advertData: {
          ...currentData.advertData,
          runningCosts: runningCostsData
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      console.log('✅ Running costs auto-saved');
    } catch (error) {
      console.error('❌ Error auto-saving running costs:', error);
    }
  }, [advertId]);

  // Handle running costs changes with debounce
  const handleRunningCostsChange = (field, value) => {
    const newRunningCosts = { ...advertData.runningCosts };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newRunningCosts[parent] = { ...newRunningCosts[parent], [child]: value };
    } else {
      newRunningCosts[field] = value;
    }
    
    setAdvertData(prev => ({
      ...prev,
      runningCosts: newRunningCosts
    }));
    
    // Debounce auto-save
    if (runningCostsTimeout) {
      clearTimeout(runningCostsTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveRunningCosts(newRunningCosts);
    }, 1000);
    
    setRunningCostsTimeout(timeout);
  };

  // Auto-save video URL with debounce
  const saveVideoUrl = useCallback(async (videoUrl) => {
    try {
      // Save to localStorage
      const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
      const updatedData = {
        ...currentData,
        advertData: {
          ...currentData.advertData,
          videoUrl: videoUrl
        },
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
      console.log('✅ Video URL auto-saved');
    } catch (error) {
      console.error('❌ Error auto-saving video URL:', error);
    }
  }, [advertId]);

  // Handle video URL changes with debounce
  const handleVideoUrlChange = (value) => {
    setAdvertData(prev => ({
      ...prev,
      videoUrl: value
    }));
    
    // Debounce auto-save
    if (videoUrlTimeout) {
      clearTimeout(videoUrlTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveVideoUrl(value);
    }, 1000);
    
    setVideoUrlTimeout(timeout);
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
      
      // Upload to Cloudinary
      const response = await uploadService.uploadImage(base64Image, advertId);
      console.log('📡 Upload response:', response);
      
      const logoUrl = response.data?.url || response.url;
      console.log('🔗 Logo URL extracted:', logoUrl);
      
      if (logoUrl) {
        // Update state with new logo URL
        setAdvertData(prev => ({
          ...prev,
          businessLogo: logoUrl
        }));
        
        console.log('✅ Business logo uploaded successfully:', logoUrl);
        
        // CRITICAL: Auto-save business logo to localStorage
        try {
          console.log('💾 Auto-saving business logo to localStorage...');
          const currentData = JSON.parse(localStorage.getItem(`bikeAdvert_${advertId}`) || '{}');
          const updatedData = {
            ...currentData,
            advertData: {
              ...currentData.advertData,
              businessLogo: logoUrl
            },
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedData));
          console.log('✅ Business logo saved to localStorage');
        } catch (saveError) {
          console.error('❌ Failed to save business logo:', saveError);
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Save advert data to localStorage
      const bikeAdvertData = {
        id: advertId,
        vehicleData: vehicleData,
        advertData: advertData,
        status: 'draft',
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(bikeAdvertData));
      alert('Advert saved successfully!');
      
    } catch (error) {
      console.error('Error saving advert:', error);
      alert(error.message || 'Failed to save advert. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Save current state before navigating
    const bikeAdvertData = {
      id: advertId,
      vehicleData: vehicleData,
      advertData: advertData,
      status: 'draft',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(bikeAdvertData));
    
    // CRITICAL: Create bike in database with MOT History and Valuation
    // This will call Vehicle Specs, MOT History, and Valuation APIs
    try {
      console.log('📡 Creating bike in database with complete data (MOT + Valuation)...');
      setIsSaving(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bikes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          advertId: advertId,
          userId: user?._id,
          registrationNumber: vehicleData.registration,
          mileage: vehicleData.mileage,
          make: vehicleData.make || 'Unknown',
          model: vehicleData.model || 'Unknown',
          year: vehicleData.year || new Date().getFullYear(),
          color: vehicleData.color || 'Not specified',
          fuelType: vehicleData.fuelType || 'Petrol',
          engineCC: parseInt(vehicleData.engineCC || vehicleData.engineSize || '0') || 0,
          bikeType: vehicleData.bikeType || 'Other',
          transmission: 'manual',
          condition: 'used',
          status: 'incomplete', // CRITICAL: Will be changed to 'pending_payment' then 'active' after payment
          price: advertData.price || 0,
          description: advertData.description || '',
          images: advertData.photos ? advertData.photos.map(p => p.url || p) : [],
          postcode: advertData.location || '',
          sellerContact: {
            type: 'private',
            phoneNumber: advertData.contactPhone || '',
            email: advertData.contactEmail || user?.email || '',
            allowEmailContact: false,
            businessName: advertData.businessName || '',
            businessLogo: advertData.businessLogo || '',
            businessWebsite: advertData.businessWebsite || ''
          },
          runningCosts: advertData.runningCosts || undefined,
          features: advertData.features || []
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bike created in database with ID:', result.data?._id);
        console.log('📊 Complete data saved:', {
          motDue: result.data?.motDue,
          motHistory: result.data?.motHistory?.length || 0,
          previousOwners: result.data?.historyCheckData?.previousKeepers,
          valuation: result.data?.valuation,
          estimatedValue: result.data?.estimatedValue
        });
        
        // CRITICAL: Update vehicleData with fetched MOT and Valuation data
        if (result.data) {
          setVehicleData(prev => ({
            ...prev,
            motDue: result.data.motDue || prev.motDue,
            motExpiry: result.data.motExpiry || prev.motExpiry,
            motHistory: result.data.motHistory || prev.motHistory || [],
            estimatedValue: result.data.estimatedValue || prev.estimatedValue,
            valuation: result.data.valuation || prev.valuation
          }));
          
          // Also update localStorage with fetched data
          const updatedAdvertData = {
            ...bikeAdvertData,
            vehicleData: {
              ...bikeAdvertData.vehicleData,
              motDue: result.data.motDue,
              motExpiry: result.data.motExpiry,
              motHistory: result.data.motHistory || [],
              estimatedValue: result.data.estimatedValue,
              valuation: result.data.valuation
            }
          };
          localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(updatedAdvertData));
          
          console.log('✅ Vehicle data updated with MOT and Valuation from API');
        }
      } else {
        const error = await response.json();
        console.warn('⚠️ Failed to create bike in database:', error.message);
        // Continue anyway - bike will be created during payment
      }
    } catch (error) {
      console.error('❌ Error creating bike in database:', error);
      // Continue anyway - bike will be created during payment
    } finally {
      setIsSaving(false);
    }
    
    // Navigate to seller contact details page
    navigate(`/bikes/selling/advert/contact/${advertId}`);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (isLoading) {
    return (
      <div className="bike-advert-edit-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your advert...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="bike-advert-edit-page error">
        <div className="error-message">
          <h2>Advert not found</h2>
          <p>The advert you're looking for doesn't exist or you don't have permission to edit it.</p>
          <button onClick={() => navigate('/bikes/sell-your-bike')} className="back-button">
            Back to Sell Your Bike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bike-advert-edit-page">
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
                <span>Your bike description & spec</span>
              </div>
              <div className="checklist-item">
                <span className="photo-icon">📷</span>
                <span>Don't forget to add some photos.</span>
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
            onClick={() => navigate('/bikes/sell-your-bike')}
          >
            ← Back to Sell Your Bike
          </button>
          <h1>Your bike advert - Incomplete</h1>
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
                      <img src={photo.url} alt="Bike" />
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
                  ? `${advertData.photos.length} of 100 images uploaded. ${advertData.photos.length < 10 ? 'Buyers expect to see at least 10 images.' : 'Great! You have enough images.'}`
                  : 'You can upload up to 100 images. Buyers expect to see at least 10 images on an advert'}
              </span>
            </div>
            
            {errors.photos && (
              <p className="error-message">{errors.photos}</p>
            )}
          </section>

          {/* Vehicle Details Section */}
          <section className="vehicle-details-section">
            {!isEditingVehicleDetails ? (
              <>
                <h2>
                  {`${vehicleData.make} ${vehicleData.model}`}
                  {vehicleData.year && ` (${vehicleData.year})`}
                </h2>
                <p className="vehicle-subtitle">
                  {vehicleData.engineSize && `${vehicleData.engineSize} `}
                  {vehicleData.bikeType && `${vehicleData.bikeType} | `}
                  {vehicleData.mileage && `${vehicleData.mileage.toLocaleString()} miles`}
                </p>
                
                <div className="vehicle-actions">
                  <a href="#" onClick={handleVehicleDetailsEdit} className="edit-link">Edit vehicle details</a>
                  <a href="#" className="attention-link">Add attention grabber</a>
                </div>
              </>
            ) : (
              <div className="vehicle-details-edit-form">
                <h3>Edit Vehicle Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Make *</label>
                    <input
                      type="text"
                      value={editableVehicleData.make}
                      onChange={(e) => setEditableVehicleData({...editableVehicleData, make: e.target.value})}
                      placeholder="e.g. Honda"
                      className={errors.make ? 'error' : ''}
                      required
                    />
                    {errors.make && <p className="error-message">{errors.make}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      value={editableVehicleData.model}
                      onChange={(e) => setEditableVehicleData({...editableVehicleData, model: e.target.value})}
                      placeholder="e.g. CBR600RR"
                      className={errors.model ? 'error' : ''}
                      required
                    />
                    {errors.model && <p className="error-message">{errors.model}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Variant (optional)</label>
                  <input
                    type="text"
                    value={editableVehicleData.variant}
                    onChange={(e) => setEditableVehicleData({...editableVehicleData, variant: e.target.value})}
                    placeholder="e.g. ABS, Sport, Limited Edition"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={handleVehicleDetailsSave} className="save-button">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleVehicleDetailsCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>
                
                {errors.vehicleDetails && (
                  <p className="error-message">{errors.vehicleDetails}</p>
                )}
              </div>
            )}
            
            <div className="price-section">
              <div className="price-display-wrapper">
                {!isPriceEditing ? (
                  <div className="price-display">
                    <span className="currency">£</span>
                    <span className="price-value">
                      {advertData.price && advertData.price > 0
                        ? (typeof advertData.price === 'number' ? advertData.price.toLocaleString() : advertData.price)
                        : (vehicleData?.estimatedValue && vehicleData.estimatedValue > 0
                            ? vehicleData.estimatedValue.toLocaleString() 
                            : 'Not set')
                      }
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
              
              {/* Price suggestion from valuation - NO "Use this price" button */}
              {suggestedPrice && suggestedPrice > 0 && (
                <div className="price-suggestion">
                  <span className="suggestion-icon">💡</span>
                  <span className="suggestion-text">
                    Suggested price based on valuation: £{suggestedPrice.toLocaleString()}
                  </span>
                </div>
              )}
              
              {vehicleData.estimatedValue && (
                <p className="price-note">
                  Our current valuation for your bike is £{vehicleData.estimatedValue.toLocaleString()}
                </p>
              )}
              <p className="finance-note">
                We'll also display a monthly finance price on qualifying vehicles
              </p>
              <a href="#" className="find-out-more">Find out more</a>
            </div>
          </section>

          {/* Vehicle Specifications - EDITABLE */}
          <section className="specifications-section">
            <h3>Overview</h3>
            
            {!isEditingOverview && (
              <div className="spec-actions">
                <a href="#" onClick={handleOverviewEdit} className="edit-link">Edit vehicle</a>
              </div>
            )}
            
            <p className="mileage-note">
              We've set an initial mileage for your advert based on your bike's MOT history
            </p>
            
            <div className="mileage-display">
              <span className="mileage-icon">🛣️</span>
              <span className="mileage-text">{vehicleData.mileage?.toLocaleString() || 'Not available'} miles</span>
            </div>
            
            {!isEditingOverview ? (
              <div className="spec-grid">
                <div className="spec-item">
                  <label>MOT Due</label>
                  <span>
                    {vehicleData.motDue || vehicleData.motExpiry || vehicleData.motExpiryDate ? (
                      new Date(vehicleData.motDue || vehicleData.motExpiry || vehicleData.motExpiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : vehicleData.motHistory && vehicleData.motHistory.length > 0 && vehicleData.motHistory[0].expiryDate ? (
                      new Date(vehicleData.motHistory[0].expiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : (() => {
                      const currentYear = new Date().getFullYear();
                      const vehicleAge = currentYear - (vehicleData.year || 2020);
                      
                      if (vehicleAge < 3) {
                        return 'Not required (new vehicle)';
                      }
                      return 'Contact seller for MOT details';
                    })()}
                  </span>
                </div>
                <div className="spec-item">
                  <label>Fuel type</label>
                  <span>{vehicleData.fuelType || 'Not specified'}</span>
                </div>
                <div className="spec-item">
                  <label>Bike type</label>
                  <span>{vehicleData.bikeType || 'Not specified'}</span>
                </div>
                <div className="spec-item">
                  <label>Engine</label>
                  <span>
                    {vehicleData.engineSize || 
                     (vehicleData.engineCC ? `${vehicleData.engineCC}cc` : 'Not specified')}
                  </span>
                </div>
                <div className="spec-item">
                  <label>Color</label>
                  <span>{vehicleData.color || 'Not specified'}</span>
                </div>
                <div className="spec-item">
                  <label>Previous Owners</label>
                  <span>
                    {vehicleData.previousOwners !== undefined && vehicleData.previousOwners !== null
                      ? vehicleData.previousOwners
                      : 'Available after payment'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="overview-edit-form">
                <h4>Edit Overview Details</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type *</label>
                    <select
                      value={editableOverviewData.fuelType}
                      onChange={(e) => setEditableOverviewData({...editableOverviewData, fuelType: e.target.value})}
                      className={errors.fuelType ? 'error' : ''}
                      required
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Petrol Hybrid">Petrol Hybrid</option>
                      <option value="Diesel Hybrid">Diesel Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    </select>
                    {errors.fuelType && <p className="error-message">{errors.fuelType}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label>Bike Type</label>
                    <input
                      type="text"
                      value={editableOverviewData.bikeType}
                      onChange={(e) => setEditableOverviewData({...editableOverviewData, bikeType: e.target.value})}
                      placeholder="e.g. Sport, Cruiser, Adventure"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={editableOverviewData.color}
                      onChange={(e) => setEditableOverviewData({...editableOverviewData, color: e.target.value})}
                      placeholder="e.g. Black, Red, Blue"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Engine Size</label>
                    <input
                      type="text"
                      value={editableOverviewData.engineSize}
                      onChange={(e) => setEditableOverviewData({...editableOverviewData, engineSize: e.target.value})}
                      placeholder="e.g. 1.0L"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Engine CC</label>
                  <input
                    type="number"
                    value={editableOverviewData.engineCC}
                    onChange={(e) => setEditableOverviewData({...editableOverviewData, engineCC: e.target.value})}
                    placeholder="e.g. 600"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={handleOverviewSave} className="save-button">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleOverviewCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>
                
                {errors.overview && (
                  <p className="error-message">{errors.overview}</p>
                )}
              </div>
            )}
          </section>

          {/* Description Section */}
          <section className="description-section">
            <h3>Description</h3>
            <p className="section-note">
              You have not added a description yet. Bikes with a detailed description sell quicker
            </p>
            <textarea
              value={advertData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your bike's condition, service history, any extras or modifications..."
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
            {/* Bike Features Section */}
            <div className="section-item expandable">
              <div 
                className="section-header"
                onClick={() => toggleSection('features')}
              >
                <span className="section-icon">⭐</span>
                <span className="section-text">Bike features</span>
                <span className={`section-arrow ${expandedSections.features ? 'expanded' : ''}`}>
                  {expandedSections.features ? '▼' : '▶'}
                </span>
              </div>
              
              {expandedSections.features && (
                <div className="section-content">
                  <p className="section-description">
                    Select the features your bike has to help it stand out to buyers:
                  </p>
                  <div className="features-grid">
                    {[
                      'ABS', 'Traction Control', 'Heated Grips', 'Heated Seats',
                      'Quick Shifter', 'Cruise Control', 'LED Headlights', 'LED Indicators',
                      'USB Charging Port', 'Bluetooth Connectivity', 'TFT Display', 'Digital Dashboard',
                      'Adjustable Suspension', 'Adjustable Windscreen', 'Panniers/Side Cases', 'Top Box',
                      'Engine Bars', 'Crash Protection', 'Aftermarket Exhaust', 'Performance Tune',
                      'Full Service History', 'Partial Service History', 'Recent MOT', 'New Tyres',
                      'Chain & Sprockets Replaced', 'Recent Service'
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
                <span className={`section-arrow ${expandedSections.runningCosts ? 'expanded' : ''}`}>
                  {expandedSections.runningCosts ? '▼' : '▶'}
                </span>
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
                          placeholder="e.g. 45"
                          className="form-input"
                        />
                        <AutoFillField
                          label="Extra Urban"
                          type="number"
                          value={advertData.runningCosts.fuelEconomy.extraUrban}
                          onChange={(value) => handleRunningCostsChange('fuelEconomy.extraUrban', value)}
                          source={fieldSources?.runningCosts?.fuelEconomy?.extraUrban}
                          placeholder="e.g. 65"
                          className="form-input"
                        />
                        <AutoFillField
                          label="Combined"
                          type="number"
                          value={advertData.runningCosts.fuelEconomy.combined}
                          onChange={(value) => handleRunningCostsChange('fuelEconomy.combined', value)}
                          source={fieldSources?.runningCosts?.fuelEconomy?.combined}
                          placeholder="e.g. 55"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Insurance Group</label>
                        <AutoFillField
                          type="text"
                          value={advertData.runningCosts.insuranceGroup}
                          onChange={(value) => handleRunningCostsChange('insuranceGroup', value)}
                          source={fieldSources?.runningCosts?.insuranceGroup}
                          placeholder="e.g. 15"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Annual Tax (£)</label>
                        <AutoFillField
                          type="number"
                          value={advertData.runningCosts.annualTax}
                          onChange={(value) => handleRunningCostsChange('annualTax', value)}
                          source={fieldSources?.runningCosts?.annualTax}
                          placeholder="e.g. 150"
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>CO2 Emissions (g/km)</label>
                      <AutoFillField
                        type="number"
                        value={advertData.runningCosts.co2Emissions}
                        onChange={(value) => handleRunningCostsChange('co2Emissions', value)}
                        source={fieldSources?.runningCosts?.co2Emissions}
                        placeholder="e.g. 120"
                        className="form-input"
                      />
                    </div>
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
                <span className="section-text">
                  Advert video - {advertData.videoUrl ? 'edit video' : 'add a video'}
                </span>
                <span className={`section-arrow ${expandedSections.video ? 'expanded' : ''}`}>
                  {expandedSections.video ? '▼' : '▶'}
                </span>
              </div>
              
              {expandedSections.video && (
                <div className="section-content">
                  <p className="section-description">
                    Add a video URL to showcase your bike. Supported platforms: YouTube, Vimeo, Dailymotion.
                  </p>
                  
                  <div className="form-group">
                    <label>Video URL</label>
                    <AutoFillField
                      type="url"
                      value={advertData.videoUrl}
                      onChange={handleVideoUrlChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="form-input"
                    />
                    <small className="form-help">
                      Paste the full URL from YouTube, Vimeo, or Dailymotion
                    </small>
                  </div>

                  {advertData.videoUrl && (
                    <div className="video-preview">
                      <p><strong>Preview:</strong></p>
                      <div className="video-link">
                        <a href={advertData.videoUrl} target="_blank" rel="noopener noreferrer">
                          {advertData.videoUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Business Information Section */}
          <section className="business-info-section">
            <h3>Business Information (Optional)</h3>
            
            {/* Info Alert */}
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>ℹ️</span>
              <div>
                <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>
                  For Trade Dealers
                </strong>
                <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                  If you are a trade user, please add your business logo and website below. This helps buyers identify professional dealers and builds trust in your listing.
                </p>
              </div>
            </div>
            
            <p className="section-note">
              Add your business details to help buyers identify you as a professional dealer.
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
              <small className="field-hint">
                Enter your business website URL (must start with http:// or https://)
              </small>
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
                disabled={isUploading}
              />
              <small className="field-hint">
                Upload your business logo (max 5MB, JPG/PNG)
              </small>
              
              {/* Logo Preview */}
              {advertData.businessLogo && (
                <div className="logo-preview" style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Logo Preview:</p>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={advertData.businessLogo} 
                      alt="Business Logo Preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '100px', 
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        backgroundColor: '#f9f9f9'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAdvertData({...advertData, businessLogo: ''})}
                      className="remove-logo-btn"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Trade indicator */}
            {(advertData.businessLogo || advertData.businessWebsite) && (
              <div className="trade-indicator" style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="indicator-icon" style={{ fontSize: '18px' }}>✓</span>
                <span className="indicator-text" style={{ color: '#155724', fontSize: '14px' }}>
                  Your listing will appear as a trade seller
                </span>
              </div>
            )}
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
            
            <button
              onClick={handlePublish}
              disabled={isSaving || advertData.photos.length === 0 || !advertData.description.trim()}
              className="publish-button"
            >
              {isSaving ? 'Publishing...' : "I'm happy with my ad"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BikeAdvertEditPage;