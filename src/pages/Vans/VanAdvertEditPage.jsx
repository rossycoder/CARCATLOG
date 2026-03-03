import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import uploadService from '../../services/uploadService';
import { formatDateUK } from '../../utils/dateFormatter';
import './VanAdvertEditPage.css';

// VAT Status Options
const VAT_STATUS_OPTIONS = {
  no_vat: {
    label: 'No VAT',
    description: 'The price above is the full price to be paid.'
  },
  plus_vat: {
    label: 'Plus VAT',
    description: 'VAT will be added to the price shown.'
  },
  including_vat: {
    label: 'Including VAT',
    description: 'The price shown includes VAT.'
  }
};

const VanAdvertEditPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dealer, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const isTradeDealer = isTradeAuthenticated && dealer;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showVatInfo, setShowVatInfo] = useState(false);
  const [advertData, setAdvertData] = useState({
    price: '',
    vatStatus: 'no_vat',
    description: '',
    photos: [],
    contactPhone: '',
    contactEmail: '',
    location: '',
    features: [],
    runningCosts: {
      fuelEconomy: {
        urban: '',
        extraUrban: '',
        combined: ''
      },
      annualTax: '',
      insuranceGroup: '',
      co2Emissions: ''
    },
    videoUrl: '',
    businessName: '',
    businessWebsite: '',
    businessLogo: ''
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Expandable sections state - All expanded by default
  const [expandedSections, setExpandedSections] = useState({
    features: true,      // Always expanded
    runningCosts: true,  // Always expanded
    video: true          // Always expanded
  });

  // Load vehicle data and advert details on mount
  useEffect(() => {
    loadAdvertData();
  }, [advertId]);

  // Show popup when page loads
  useEffect(() => {
    if (vehicleData && !isLoading) {
      setShowPopup(true);
    }
  }, [vehicleData, isLoading]);


  const loadAdvertData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch advert data from localStorage
      const storedData = localStorage.getItem(`vanAdvert_${advertId}`);
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setVehicleData(parsed.vehicleData);
        
        // CRITICAL: Auto-populate trade dealer info if logged in as trade dealer
        const businessName = parsed.advertData?.businessName || 
                            (isTradeDealer ? dealer?.businessName : '') || '';
        const businessLogo = parsed.advertData?.businessLogo || 
                            (isTradeDealer ? dealer?.logo : '') || '';
        const businessWebsite = parsed.advertData?.businessWebsite || 
                               (isTradeDealer ? dealer?.website : '') || '';
        
        console.log('🏢 Trade Dealer Auto-Population:', {
          isTradeDealer,
          dealerBusinessName: dealer?.businessName,
          dealerLogo: dealer?.logo,
          dealerWebsite: dealer?.website,
          finalBusinessName: businessName,
          finalBusinessLogo: businessLogo,
          finalBusinessWebsite: businessWebsite
        });
        
        // AUTO-POPULATE RUNNING COSTS FROM API DATA
        // Check if runningCosts object exists in vehicleData (new structure)
        // Otherwise fall back to top-level fields (old structure)
        const runningCostsFromAPI = parsed.vehicleData?.runningCosts || {
          fuelEconomy: {
            urban: parsed.vehicleData?.urbanMpg || '',
            extraUrban: parsed.vehicleData?.extraUrbanMpg || '',
            combined: parsed.vehicleData?.combinedMpg || ''
          },
          annualTax: parsed.vehicleData?.annualTax || '',
          insuranceGroup: parsed.vehicleData?.insuranceGroup || '',
          co2Emissions: parsed.vehicleData?.co2Emissions || ''
        };
        
        console.log('💰 Running Costs Auto-Population:', {
          fromAPI: runningCostsFromAPI,
          fromStored: parsed.advertData?.runningCosts,
          vehicleDataHasRunningCosts: !!parsed.vehicleData?.runningCosts
        });
        
        setAdvertData({
          price: parsed.advertData?.price || '',
          vatStatus: parsed.advertData?.vatStatus || 'no_vat',
          description: parsed.advertData?.description || '',
          photos: parsed.advertData?.photos || [],
          contactPhone: parsed.advertData?.contactPhone || '',
          contactEmail: parsed.advertData?.contactEmail || user?.email || '',
          location: parsed.advertData?.location || '',
          features: parsed.advertData?.features || [],
          // Use stored running costs if available, otherwise use API data
          runningCosts: parsed.advertData?.runningCosts || runningCostsFromAPI,
          videoUrl: parsed.advertData?.videoUrl || '',
          businessName: businessName,
          businessWebsite: businessWebsite,
          businessLogo: businessLogo
        });
      } else {
        throw new Error('Advert not found');
      }
    } catch (error) {
      console.error('Error loading advert:', error);
      navigate('/vans/sell-your-van');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAdvertData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePriceChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    handleInputChange('price', numValue);
  };

  const incrementPrice = () => {
    const currentPrice = parseInt(advertData.price) || 0;
    handleInputChange('price', String(currentPrice + 100));
  };

  const decrementPrice = () => {
    const currentPrice = parseInt(advertData.price) || 0;
    if (currentPrice >= 100) {
      handleInputChange('price', String(currentPrice - 100));
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
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
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please upload only images under 5MB.');
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const base64 = await uploadService.fileToBase64(file);
        
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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle feature selection
  const toggleFeature = (feature) => {
    setAdvertData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Handle running costs change
  const handleRunningCostsChange = (field, value) => {
    if (field.includes('.')) {
      // Nested field like 'fuelEconomy.urban'
      const [parent, child] = field.split('.');
      setAdvertData(prev => ({
        ...prev,
        runningCosts: {
          ...prev.runningCosts,
          [parent]: {
            ...prev.runningCosts[parent],
            [child]: value
          }
        }
      }));
    } else {
      // Top-level field like 'annualTax'
      setAdvertData(prev => ({
        ...prev,
        runningCosts: {
          ...prev.runningCosts,
          [field]: value
        }
      }));
    }
  };

  // Handle video URL change
  const handleVideoUrl = (url) => {
    setAdvertData(prev => ({
      ...prev,
      videoUrl: url
    }));
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    try {
      const base64 = await uploadService.fileToBase64(file);
      const result = await uploadService.uploadImage(base64, `${advertId}_logo`);
      
      if (result.success) {
        setAdvertData(prev => ({
          ...prev,
          businessLogo: result.data.url
        }));
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo. Please try again.');
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
      
      const vanAdvertData = {
        id: advertId,
        vehicleData: vehicleData,
        advertData: advertData,
        status: 'draft',
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
      alert('Advert saved successfully!');
      
    } catch (error) {
      console.error('Error saving advert:', error);
      alert(error.message || 'Failed to save advert. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    if (!validateForm()) {
      return;
    }
    
    const vanAdvertData = {
      id: advertId,
      vehicleData: vehicleData,
      advertData: advertData,
      status: 'draft',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
    
    navigate(`/vans/selling/advert/contact/${advertId}`);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (isLoading) {
    return (
      <div className="van-advert-edit-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your advert...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="van-advert-edit-page error">
        <div className="error-message">
          <h2>Advert not found</h2>
          <p>The advert you're looking for doesn't exist or you don't have permission to edit it.</p>
          <button onClick={() => navigate('/vans/sell-your-van')} className="back-button">
            Back to Sell Your Van
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="van-advert-edit-page">
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
                <span>Your van description & spec</span>
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

      {/* VAT Info Modal */}
      {showVatInfo && (
        <div className="popup-overlay">
          <div className="popup-content vat-info-modal">
            <button className="popup-close" onClick={() => setShowVatInfo(false)}>
              ✕ Close
            </button>
            <h2>About VAT Status</h2>
            <div className="vat-info-content">
              <div className="vat-info-item">
                <h4>No VAT</h4>
                <p>Select this if you are a private seller or if VAT does not apply to your sale. The price shown is the full price the buyer will pay.</p>
              </div>
              <div className="vat-info-item">
                <h4>Plus VAT</h4>
                <p>Select this if you are VAT registered and the buyer will need to pay VAT on top of the advertised price. The final price will be higher than shown.</p>
              </div>
              <div className="vat-info-item">
                <h4>Including VAT</h4>
                <p>Select this if you are VAT registered and the advertised price already includes VAT. The price shown is the full price the buyer will pay.</p>
              </div>
            </div>
            <button className="popup-ok-button" onClick={() => setShowVatInfo(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="advert-header">
        <div className="container">
          <button 
            className="back-link" 
            onClick={() => navigate('/vans/sell-your-van')}
          >
            ← Back to Sell Your Van
          </button>
          <h1>Your van advert - Incomplete</h1>
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
                      <img src={photo.url} alt="Van" />
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
            <h2>{vehicleData.make} {vehicleData.model} ({vehicleData.year})</h2>
            <p className="vehicle-subtitle">
              {vehicleData.vanType} | {vehicleData.fuelType} | {vehicleData.mileage?.toLocaleString()} miles
            </p>
            
            <div className="vehicle-actions">
              <a href="#" className="edit-link">Edit van details</a>
              <a href="#" className="attention-link">Add attention grabber</a>
            </div>
            
            <div className="price-section" style={{ position: 'relative', zIndex: 10 }}>
              <div className="price-input-wrapper" style={{ position: 'relative', zIndex: 20 }}>
                <button 
                  type="button"
                  className="price-adjust-btn decrement"
                  onClick={() => {
                    console.log('➖ Decrement button clicked');
                    decrementPrice();
                  }}
                  disabled={!advertData.price || parseInt(advertData.price) < 100}
                  style={{ 
                    cursor: 'pointer', 
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 30
                  }}
                >
                  −
                </button>
                <span className="currency">£</span>
                <input
                  type="text"
                  value={advertData.price ? parseInt(advertData.price).toLocaleString() : ''}
                  onChange={(e) => handlePriceChange(e.target.value.replace(/,/g, ''))}
                  placeholder="0"
                  className={`price-input ${errors.price ? 'error' : ''}`}
                />
                <button 
                  type="button"
                  className="price-adjust-btn increment"
                  onClick={() => {
                    console.log('➕ Increment button clicked');
                    incrementPrice();
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 30
                  }}
                >
                  +
                </button>
              </div>
              {errors.price && (
                <p className="error-message">{errors.price}</p>
              )}
              
              {/* VAT Status Section */}
              <div className="vat-status-section" style={{ position: 'relative', zIndex: 100 }}>
                <h4>VAT status</h4>
                <p className="vat-description">
                  {VAT_STATUS_OPTIONS[advertData.vatStatus].description}
                </p>
                <div className="vat-options" style={{ position: 'relative', zIndex: 101 }}>
                  {Object.entries(VAT_STATUS_OPTIONS).map(([key, option]) => (
                    <button
                      key={key}
                      type="button"
                      className={`vat-option-button ${advertData.vatStatus === key ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('🔘 VAT Status button clicked:', key);
                        console.log('Current vatStatus:', advertData.vatStatus);
                        handleInputChange('vatStatus', key);
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 102
                      }}
                    >
                      <span className={`radio-circle ${advertData.vatStatus === key ? 'checked' : ''}`} style={{ pointerEvents: 'none' }}>
                        {advertData.vatStatus === key && <span className="radio-dot" style={{ pointerEvents: 'none' }}></span>}
                      </span>
                      <span className="vat-option-label" style={{ pointerEvents: 'none' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
                <button 
                  type="button"
                  className="learn-more-link"
                  onClick={() => {
                    console.log('Learn more clicked');
                    setShowVatInfo(true);
                  }}
                >
                  Learn more about VAT status
                </button>
              </div>
              
              {((vehicleData.allValuations?.private || vehicleData.estimatedValue) && !advertData.price) && (
                <>
                  <p className="price-note">
                    Our current valuation for your van is £{(vehicleData.allValuations?.private || vehicleData.estimatedValue).toLocaleString()}
                  </p>
                  <button 
                    type="button"
                    className="sell-price-button"
                    onClick={() => handleInputChange('price', String(vehicleData.allValuations?.private || vehicleData.estimatedValue))}
                  >
                    Sell for this much
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Vehicle Specifications */}
          <section className="specifications-section">
            <h3>Overview</h3>
            <div className="spec-actions">
              <a href="#" className="edit-link">Edit service history and MOT</a>
            </div>
            
            <p className="mileage-note">
              We've set an initial mileage for your advert based on your van's MOT history
            </p>
            
            <div className="mileage-display">
              <span className="mileage-icon">🛣️</span>
              <span className="mileage-text">{vehicleData.mileage?.toLocaleString() || 'Not available'} miles</span>
              <a href="#" className="edit-mileage">Edit mileage</a>
            </div>
            
            <div className="spec-grid">
              <div className="spec-item">
                <label>MOT Due</label>
                <span>{formatDateUK(vehicleData.motDue)}</span>
              </div>
              <div className="spec-item">
                <label>Fuel type</label>
                <span>{vehicleData.fuelType || 'Not specified'}</span>
              </div>
              <div className="spec-item">
                <label>Van type</label>
                <span>{vehicleData.vanType || 'Not specified'}</span>
              </div>
              <div className="spec-item">
                <label>Payload</label>
                <span>{vehicleData.payloadCapacity ? `${vehicleData.payloadCapacity} kg` : 'Not available'}</span>
              </div>
              <div className="spec-item">
                <label>Color</label>
                <span>{vehicleData.color || 'Not specified'}</span>
              </div>
              <div className="spec-item">
                <label>Year</label>
                <span>{vehicleData.year || 'Not available'}</span>
              </div>
            </div>
          </section>


          {/* Description Section */}
          <section className="description-section">
            <h3>Description</h3>
            <p className="section-note">
              You have not added a description yet. Vans with a detailed description sell quicker
            </p>
            <textarea
              value={advertData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your van's condition, service history, any extras or modifications..."
              className={`description-textarea ${errors.description ? 'error' : ''}`}
              rows={6}
            />
            {errors.description && (
              <p className="error-message">{errors.description}</p>
            )}
            <div className="description-footer">
              <span className="char-count">
                {advertData.description.length} / 50 minimum characters
              </span>
              <a href="#" className="add-description-link">Add description</a>
            </div>
          </section>

          {/* Business Information Section - For Trade Users */}
          <section className="business-info-section">
            <h3>Business Information (Optional)</h3>
            
            {/* Alert for Trade Users */}
            <div className="trade-user-alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Important for Trade Users</strong>
                <p className="alert-text">
                  If you are a trade user, please add your business logo and website below. This helps buyers identify professional dealers and builds trust in your listing.
                </p>
              </div>
            </div>
            
            <p className="section-note">
              Add business details to list as a trade seller. If you add a logo or website, your listing will automatically be marked as "Trade".
            </p>
            
            <div className="business-form">
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
                  placeholder="e.g., ABC Van Sales Ltd"
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
              {(advertData.businessLogo || advertData.businessWebsite || advertData.businessName) && (
                <div className="trade-indicator">
                  <span className="indicator-icon">✓</span>
                  <span className="indicator-text">
                    Your listing will appear as a trade seller
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Additional Sections */}
          <section className="additional-sections">
            {/* Van Features Section */}
            <div className="section-item expandable">
              <div 
                className="section-header"
                onClick={() => toggleSection('features')}
              >
                <span className="section-icon">⭐</span>
                <span className="section-text">Van features</span>
                <span className={`section-arrow ${expandedSections.features ? 'expanded' : ''}`}>›</span>
              </div>
              
              {expandedSections.features && (
                <div className="section-content">
                  <p className="section-description">Select the features your van has:</p>
                  <div className="features-grid">
                    {[
                      'Air Conditioning', 'Climate Control', 'Cruise Control', 'Sat Nav',
                      'Bluetooth', 'USB Port', 'Parking Sensors', 'Reversing Camera',
                      'Electric Windows', 'Electric Mirrors', 'Central Locking', 'Remote Locking',
                      'Alloy Wheels', 'Roof Rack', 'Tow Bar', 'Bulkhead',
                      'Ply Lining', 'Racking System', 'Side Loading Door', 'Rear Barn Doors',
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
                    Add running cost information to help buyers.
                  </p>
                  
                  <div className="running-costs-form">
                    <div className="form-group">
                      <label>Fuel Economy (MPG)</label>
                      <div className="fuel-economy-inputs">
                        <div className="fuel-input-group">
                          <label className="fuel-label">Urban</label>
                          <input
                            type="number"
                            value={advertData.runningCosts.fuelEconomy.urban}
                            onChange={(e) => handleRunningCostsChange('fuelEconomy.urban', e.target.value)}
                            placeholder="e.g. 30.5"
                            className="fuel-input"
                          />
                          <span className="fuel-unit">mpg</span>
                        </div>
                        <div className="fuel-input-group">
                          <label className="fuel-label">Extra Urban</label>
                          <input
                            type="number"
                            value={advertData.runningCosts.fuelEconomy.extraUrban}
                            onChange={(e) => handleRunningCostsChange('fuelEconomy.extraUrban', e.target.value)}
                            placeholder="e.g. 45.2"
                            className="fuel-input"
                          />
                          <span className="fuel-unit">mpg</span>
                        </div>
                        <div className="fuel-input-group">
                          <label className="fuel-label">Combined</label>
                          <input
                            type="number"
                            value={advertData.runningCosts.fuelEconomy.combined}
                            onChange={(e) => handleRunningCostsChange('fuelEconomy.combined', e.target.value)}
                            placeholder="e.g. 40.8"
                            className="fuel-input"
                          />
                          <span className="fuel-unit">mpg</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Annual Tax (£)</label>
                      <input
                        type="number"
                        value={advertData.runningCosts.annualTax}
                        onChange={(e) => handleRunningCostsChange('annualTax', e.target.value)}
                        placeholder="e.g. 290"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Insurance Group</label>
                      <input
                        type="number"
                        value={advertData.runningCosts.insuranceGroup}
                        onChange={(e) => handleRunningCostsChange('insuranceGroup', e.target.value)}
                        placeholder="e.g. 8"
                        min="1"
                        max="50"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CO2 Emissions (g/km)</label>
                      <input
                        type="number"
                        value={advertData.runningCosts.co2Emissions}
                        onChange={(e) => handleRunningCostsChange('co2Emissions', e.target.value)}
                        placeholder="e.g. 150"
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
                <span className="section-text">Advert video - add a video</span>
                <span className={`section-arrow ${expandedSections.video ? 'expanded' : ''}`}>›</span>
              </div>
              
              {expandedSections.video && (
                <div className="section-content">
                  <p className="section-description">
                    Add a YouTube video link to showcase your van. First upload your video to YouTube, then paste the link here.
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
                        <li>Showcase the interior and load space</li>
                        <li>Demonstrate any special features</li>
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
            {(advertData.photos.length === 0 || !advertData.description.trim() || advertData.description.trim().length < 50) && (
              <p className="validation-message">
                {advertData.photos.length === 0 && advertData.description.trim().length < 50
                  ? 'Please add photos and a description (min 50 characters) to continue'
                  : advertData.photos.length === 0 
                    ? 'Please add at least one photo to continue'
                    : 'Please add a description (min 50 characters) to continue'}
              </p>
            )}
            <button
              onClick={handlePublish}
              disabled={isSaving || advertData.photos.length === 0 || advertData.description.trim().length < 50}
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

export default VanAdvertEditPage;
