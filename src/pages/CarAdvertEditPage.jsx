import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import advertService from '../services/advertService';
import uploadService from '../services/uploadService';
import useEnhancedVehicleLookup from '../hooks/useEnhancedVehicleLookup';
import AutoFillField from '../components/AutoFillField/AutoFillField';
import './CarAdvertEditPage.css';

const CarAdvertEditPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lookupVehicle, loading: apiLoading, error: apiError, vehicleData: enhancedData, sources: fieldSources, dataSources } = useEnhancedVehicleLookup();
  
  console.log('🔍 Hook state - enhancedData:', enhancedData);
  console.log('🔍 Hook state - fieldSources:', fieldSources);
  console.log('🔍 Hook state - dataSources:', dataSources);
  
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
    runningCosts: false,
    video: false
  });
  
  // Price editing state
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  const [videoUrlTimeout, setVideoUrlTimeout] = useState(null);
  const [runningCostsTimeout, setRunningCostsTimeout] = useState(null);

  // Show popup when page loads
  useEffect(() => {
    if (vehicleData && !isLoading) {
      setShowPopup(true);
    }
  }, [vehicleData, isLoading]);

  // Auto-fill data when enhanced data is received from API
  useEffect(() => {
    if (enhancedData && !apiLoading) {
      console.log('✨ Enhanced data received');
      console.log('📊 Data sources:', dataSources);
      console.log('🔧 Field sources available:', !!fieldSources);
      console.log('🚗 Enhanced data:', enhancedData);
      
      // Auto-fill price from valuation data if available and not already set
      // Check for null/undefined specifically, not falsy (0 is a valid price)
      if (enhancedData.valuation?.estimatedValue && (advertData.price === null || advertData.price === undefined || advertData.price === '')) {
        // For private sellers, prefer PRIVATE price, then RETAIL, then TRADE
        // estimatedValue might be an object with retail/trade/private values
        const priceValue = typeof enhancedData.valuation.estimatedValue === 'object'
          ? (enhancedData.valuation.estimatedValue.private || 
             enhancedData.valuation.estimatedValue.Private ||
             enhancedData.valuation.estimatedValue.retail || 
             enhancedData.valuation.estimatedValue.trade)
          : enhancedData.valuation.estimatedValue;
          
        console.log('💰 Auto-filling price from API (PRIVATE preferred):', priceValue);
        console.log('💰 Full valuation object:', enhancedData.valuation);
        console.log('💰 Valuation confidence:', enhancedData.valuation.confidence);
        console.log('💰 All valuation prices:', {
          private: enhancedData.valuation.estimatedValue?.private,
          retail: enhancedData.valuation.estimatedValue?.retail,
          trade: enhancedData.valuation.estimatedValue?.trade
        });
        
        if (priceValue) {
          setAdvertData(prev => ({
            ...prev,
            price: priceValue
          }));
          
          // Also update vehicleData with estimated value
          setVehicleData(prev => ({
            ...prev,
            estimatedValue: priceValue,
            valuationConfidence: enhancedData.valuation.confidence || 'medium',
            allValuations: enhancedData.valuation.estimatedValue
          }));
        }
      }
      
      // Note: MOT data is not available from the API
      // MOT information should be stored in the database when the vehicle is created
      console.log('ℹ️ MOT data is not provided by the vehicle lookup API');
      console.log('📋 MOT data should be in vehicleData from database:', {
        motDue: vehicleData?.motDue,
        motStatus: vehicleData?.motStatus,
        motExpiry: vehicleData?.motExpiry
      });
      
      // Auto-fill running costs
      if (enhancedData.runningCosts) {
        console.log('💰 Running costs from API:');
        console.log('  - Urban:', enhancedData.runningCosts.fuelEconomy?.urban, 'mpg');
        console.log('  - Extra Urban:', enhancedData.runningCosts.fuelEconomy?.extraUrban, 'mpg');
        console.log('  - Combined:', enhancedData.runningCosts.fuelEconomy?.combined, 'mpg');
        console.log('  - CO2:', enhancedData.runningCosts.co2Emissions, 'g/km');
        console.log('  - Annual Tax: £', enhancedData.runningCosts.annualTax);
        console.log('  - Insurance Group:', enhancedData.runningCosts.insuranceGroup || 'N/A');
        
        setAdvertData(prev => ({
          ...prev,
          runningCosts: {
            fuelEconomy: {
              urban: enhancedData.runningCosts?.fuelEconomy?.urban || prev.runningCosts.fuelEconomy.urban,
              extraUrban: enhancedData.runningCosts?.fuelEconomy?.extraUrban || prev.runningCosts.fuelEconomy.extraUrban,
              combined: enhancedData.runningCosts?.fuelEconomy?.combined || prev.runningCosts.fuelEconomy.combined
            },
            annualTax: enhancedData.runningCosts?.annualTax || prev.runningCosts.annualTax,
            insuranceGroup: enhancedData.runningCosts?.insuranceGroup || prev.runningCosts.insuranceGroup,
            co2Emissions: enhancedData.runningCosts?.co2Emissions || prev.runningCosts.co2Emissions
          }
        }));
        
        console.log('✅ Running costs auto-filled successfully');
      }
    }
  }, [enhancedData, apiLoading]);

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
          
          setVehicleData(vehicleData);
          setCarStatus(vehicleData.advertStatus); // Store car status
          setIsDealerCar(vehicleData.isDealerListing || false); // Store if it's a dealer car
          
          console.log('🚗 Car loaded:', {
            advertStatus: vehicleData.advertStatus,
            isDealerListing: vehicleData.isDealerListing,
            dealerId: vehicleData.dealerId,
            willShowSaveButton: vehicleData.advertStatus === 'active' || vehicleData.isDealerListing
          });
          
          // Populate form fields with existing data
          setAdvertData({
            price: vehicleData.price || '',
            description: vehicleData.description || '',
            photos: vehicleData.images || [],
            contactPhone: vehicleData.sellerContact?.phoneNumber || '',
            contactEmail: vehicleData.sellerContact?.email || '',
            location: vehicleData.postcode || '',
            features: vehicleData.features || [],
            runningCosts: {
              fuelEconomy: {
                urban: vehicleData.runningCosts?.fuelEconomy?.urban || vehicleData.fuelEconomyUrban || '',
                extraUrban: vehicleData.runningCosts?.fuelEconomy?.extraUrban || vehicleData.fuelEconomyExtraUrban || '',
                combined: vehicleData.runningCosts?.fuelEconomy?.combined || vehicleData.fuelEconomyCombined || ''
              },
              annualTax: vehicleData.runningCosts?.annualTax || vehicleData.annualTax || '',
              insuranceGroup: vehicleData.runningCosts?.insuranceGroup || vehicleData.insuranceGroup || '',
              co2Emissions: vehicleData.runningCosts?.co2Emissions || vehicleData.co2Emissions || ''
            },
            videoUrl: vehicleData.videoUrl || ''
          });
          
          console.log('✅ Form fields populated with existing data');
          
          // Fetch MOT data if registration exists
          if (vehicleData.registrationNumber) {
            fetchMOTData(vehicleData.registrationNumber);
          }
          
          // Fetch enhanced data if registration exists
          if (vehicleData.registrationNumber && !enhancedData) {
            console.log('🚗 Fetching enhanced data for:', vehicleData.registrationNumber);
            try {
              await lookupVehicle(vehicleData.registrationNumber);
            } catch (apiErr) {
              console.error('Enhanced lookup failed:', apiErr);
            }
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
        
        // Fetch MOT data from API if registration number exists
        if (response.data.vehicleData?.registrationNumber) {
          fetchMOTData(response.data.vehicleData.registrationNumber);
        }
        
        // Fetch enhanced data from CheckCarDetails API if registration number exists
        // Only fetch if we haven't already fetched it
        if (response.data.vehicleData?.registrationNumber && !enhancedData) {
          console.log('🚗 Fetching enhanced data for:', response.data.vehicleData.registrationNumber);
          try {
            await lookupVehicle(response.data.vehicleData.registrationNumber);
          } catch (apiErr) {
            console.warn('⚠️ Enhanced lookup failed, continuing without it:', apiErr.message);
          }
        }
        
        // Handle price carefully - 0 is a valid price, so check for null/undefined specifically
        let priceValue = response.data.advertData?.price;
        if (priceValue === null || priceValue === undefined) {
          priceValue = response.data.vehicleData?.estimatedValue;
        }
        if (priceValue === null || priceValue === undefined) {
          priceValue = '';
        }
        console.log('Setting price to:', priceValue);
        
        setAdvertData({
          price: priceValue,
          description: response.data.advertData?.description || '',
          photos: response.data.advertData?.photos || [],
          contactPhone: response.data.advertData?.contactPhone || '',
          contactEmail: response.data.advertData?.contactEmail || user?.email || '',
          location: response.data.advertData?.location?.postcode || response.data.advertData?.location || '',
          features: response.data.advertData?.features || [],
          runningCosts: response.data.advertData?.runningCosts || {
            fuelEconomy: { 
              urban: response.data.vehicleData?.fuelEconomyUrban || '', 
              extraUrban: response.data.vehicleData?.fuelEconomyExtraUrban || '', 
              combined: response.data.vehicleData?.fuelEconomyCombined || '' 
            },
            annualTax: response.data.vehicleData?.annualTax || '',
            insuranceGroup: response.data.vehicleData?.insuranceGroup || '',
            co2Emissions: response.data.vehicleData?.co2Emissions || ''
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
  }, [advertId, navigate, enhancedData]);

  // Fetch MOT data from API
  const fetchMOTData = async (vrm) => {
    try {
      setMotLoading(true);
      const cleanVrm = vrm.replace(/\s+/g, '').toUpperCase();
      console.log('🔧 Fetching MOT data for:', cleanVrm);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/vehicle-history/mot/${cleanVrm}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ MOT data fetched:', result);
        setMotData(result.data || result);
      } else {
        console.warn('⚠️ MOT data not available');
        setMotData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching MOT data:', error);
      setMotData(null);
    } finally {
      setMotLoading(false);
    }
  };

  // Load advert data on mount - only once
  useEffect(() => {
    loadAdvertData();
  }, [advertId]); // Only depend on advertId, not loadAdvertData

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
  
  // Handle feature toggle
  const toggleFeature = async (feature) => {
    const newFeatures = advertData.features.includes(feature)
      ? advertData.features.filter(f => f !== feature)
      : [...advertData.features, feature];
    
    setAdvertData(prev => ({
      ...prev,
      features: newFeatures
    }));
    
    // Auto-save to database
    try {
      await advertService.updateAdvert(advertId, { ...advertData, features: newFeatures }, vehicleData);
      console.log('Features saved successfully');
    } catch (error) {
      console.error('Error saving features:', error);
    }
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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
              {[
                vehicleData.engineSize ? `${parseFloat(vehicleData.engineSize).toFixed(1)}L` : null,
                vehicleData.variant && vehicleData.variant !== 'null' && vehicleData.variant !== 'undefined' ? vehicleData.variant : null,
                vehicleData.fuelType,
                vehicleData.transmission,
                vehicleData.mileage ? `${vehicleData.mileage.toLocaleString()} miles` : null
              ].filter(Boolean).join(' | ')}
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
              <p className="price-note">
                {vehicleData?.estimatedValue && vehicleData.estimatedValue > 0 ? (
                  <>
                    Our current valuation for your vehicle is £{vehicleData.estimatedValue.toLocaleString()}
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
              <a href="#" className="edit-link">Edit service history, MOT and seats</a>
            </div>
            
            <div className="spec-grid">
              <div className="spec-item">
                <label>MOT Due</label>
                <span>
                  {motLoading ? (
                    'Loading...'
                  ) : motData?.mot?.motDueDate ? (
                    (() => {
                      const dateStr = motData.mot.motDueDate;
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    })()
                  ) : motData?.expiryDate ? (
                    (() => {
                      const dateStr = motData.expiryDate;
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    })()
                  ) : motData?.mot?.motStatus ? (
                    motData.mot.motStatus
                  ) : vehicleData.motDue ? (
                    (() => {
                      const dateStr = vehicleData.motDue;
                      if (typeof dateStr === 'string' && dateStr.includes('-')) {
                        const [year, month, day] = dateStr.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      }
                      return dateStr;
                    })()
                  ) : vehicleData.motExpiry ? (
                    (() => {
                      const dateValue = vehicleData.motExpiry;
                      if (typeof dateValue === 'string' && dateValue.includes('-')) {
                        const [year, month, day] = dateValue.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      } else if (dateValue instanceof Date || !isNaN(Date.parse(dateValue))) {
                        const date = new Date(dateValue);
                        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                      }
                      return dateValue;
                    })()
                  ) : (
                    'Contact seller for MOT details'
                  )}
                </span>
              </div>
              <div className="spec-item">
                <label>Fuel type</label>
                <span>{vehicleData.fuelType || 'Petrol'}</span>
              </div>
              <div className="spec-item">
                <label>Body type</label>
                <span>{vehicleData.bodyType || 'Saloon'}</span>
              </div>
              <div className="spec-item">
                <label>Engine</label>
                <span>
                  {vehicleData.engineSize 
                    ? (vehicleData.engineSize.toString().includes('L') 
                        ? vehicleData.engineSize 
                        : `${vehicleData.engineSize}L`)
                    : '4.4L'}
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
                <span>{vehicleData.seats || '5'}</span>
              </div>
              <div className="spec-item">
                <label>Emission Class</label>
                <span>
                  {enhancedData?.emissionClass || vehicleData.emissionClass || 'N/A'}
                </span>
              </div>
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
            
            {/* Show different button based on car status or dealer listing */}
            {(carStatus === 'active' || isDealerCar) ? (
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