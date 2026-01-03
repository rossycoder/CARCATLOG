import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import uploadService from '../../services/uploadService';
import './BikeAdvertEditPage.css';

const BikeAdvertEditPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [advertData, setAdvertData] = useState({
    price: '',
    description: '',
    photos: [],
    contactPhone: '',
    contactEmail: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

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
      const storedData = localStorage.getItem(`bikeAdvert_${advertId}`);
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setVehicleData(parsed.vehicleData);
        setAdvertData({
          price: parsed.advertData?.price || '',
          description: parsed.advertData?.description || '',
          photos: parsed.advertData?.photos || [],
          contactPhone: parsed.advertData?.contactPhone || '',
          contactEmail: parsed.advertData?.contactEmail || user?.email || '',
          location: parsed.advertData?.location || ''
        });
      } else {
        throw new Error('Advert not found');
      }
    } catch (error) {
      console.error('Error loading advert:', error);
      // If advert doesn't exist, redirect back
      navigate('/bikes/find-your-bike');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePublish = () => {
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
          <button onClick={() => navigate('/bikes/find-your-bike')} className="back-button">
            Back to Find Your Bike
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
            onClick={() => navigate('/bikes/find-your-bike')}
          >
            ← Back to Find Your Bike
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
            <h2>{vehicleData.make} {vehicleData.model} ({vehicleData.year})</h2>
            <p className="vehicle-subtitle">
              {vehicleData.engineSize} {vehicleData.bikeType} | {vehicleData.mileage?.toLocaleString()} miles
            </p>
            
            <div className="vehicle-actions">
              <a href="#" className="edit-link">Edit bike details</a>
              <a href="#" className="attention-link">Add attention grabber</a>
            </div>
            
            <div className="price-section">
              <div className="price-input-wrapper">
                <span className="currency">£</span>
                <input
                  type="number"
                  value={advertData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="5,000"
                  className={`price-input ${errors.price ? 'error' : ''}`}
                />
                <a href="#" className="edit-price-link">Edit price</a>
              </div>
              {errors.price && (
                <p className="error-message">{errors.price}</p>
              )}
              <p className="price-note">
                Our current valuation for your bike is £{vehicleData.estimatedValue?.toLocaleString() || '5,000'}
              </p>
              <p className="finance-note">
                We'll also display a monthly finance price on qualifying vehicles
              </p>
              <a href="#" className="find-out-more">Find out more</a>
            </div>
          </section>

          {/* Vehicle Specifications */}
          <section className="specifications-section">
            <h3>Overview</h3>
            <div className="spec-actions">
              <a href="#" className="edit-link">Edit service history and MOT</a>
            </div>
            
            <p className="mileage-note">
              We've set an initial mileage for your advert based on your bike's MOT history
            </p>
            
            <div className="mileage-display">
              <span className="mileage-icon">🛣️</span>
              <span className="mileage-text">{vehicleData.mileage?.toLocaleString() || '15,000'} miles</span>
              <a href="#" className="edit-mileage">Edit mileage</a>
            </div>
            
            <div className="spec-grid">
              <div className="spec-item">
                <label>MOT Due</label>
                <span>{vehicleData.motDue || '05/06/2026'}</span>
              </div>
              <div className="spec-item">
                <label>Fuel type</label>
                <span>{vehicleData.fuelType || 'Petrol'}</span>
              </div>
              <div className="spec-item">
                <label>Bike type</label>
                <span>{vehicleData.bikeType || 'Sport'}</span>
              </div>
              <div className="spec-item">
                <label>Engine</label>
                <span>{vehicleData.engineSize || '600cc'}</span>
              </div>
              <div className="spec-item">
                <label>Color</label>
                <span>{vehicleData.color || 'Black'}</span>
              </div>
              <div className="spec-item">
                <label>Previous Owners</label>
                <span>{vehicleData.previousOwners || '1'}</span>
              </div>
            </div>
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
            <div className="section-item">
              <span className="section-icon">⭐</span>
              <span className="section-text">Bike features</span>
              <span className="section-arrow">›</span>
            </div>
            <div className="section-item">
              <span className="section-icon">💰</span>
              <span className="section-text">Running costs</span>
              <span className="section-arrow">›</span>
            </div>
            <div className="section-item">
              <span className="section-icon">🎥</span>
              <span className="section-text">Advert video - add a video</span>
              <span className="section-arrow">›</span>
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
