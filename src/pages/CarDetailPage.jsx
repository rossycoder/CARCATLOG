import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { vehicleSchema, breadcrumbSchema } from '../utils/seoSchemas';
import VehicleHistorySection from '../components/VehicleHistory/VehicleHistorySection';
import MOTHistorySection from '../components/VehicleHistory/MOTHistorySection';
import LocationDisplay from '../components/Location/LocationDisplay';
import ElectricVehicleCharging from '../components/ElectricVehicleCharging';
import ElectricVehicleRunningCosts from '../components/ElectricVehicleRunningCosts';
import FinanceCalculator from '../components/FinanceCalculator';
import { generateVariantDisplay, extractTownName, formatColor } from '../utils/vehicleFormatter';
import authService from '../services/authService';
import './CarDetailPage.css';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Start with false, will be set in useEffect
  const [activeTab, setActiveTab] = useState('contact');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Call masking state
  const [callSession, setCallSession] = useState(null); // { proxyNumber, expiresIn }
  const [callLoading, setCallLoading] = useState(false);
  
  // Share functionality state
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  // Favorite functionality state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    setShareCopied(false);
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token') || localStorage.getItem('tradeToken');
    if (!token) {
      alert('Please sign in to save favorites');
      navigate('/signin');
      return;
    }

    setFavoriteLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/saved-cars/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ carId: car._id })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsFavorite(data.isSaved);
      } else {
        alert(data.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const shareToSocial = (platform) => {
    const url = window.location.href;
    const title = `${car.year} ${car.make} ${car.model} - ${formatPrice(car.price)}`;
    const text = `Check out this ${car.year} ${car.make} ${car.model} for sale at ${formatPrice(car.price)}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setShareCopied(true);
          setTimeout(() => {
            setShareCopied(false);
            setShowShareMenu(false);
          }, 2000);
        });
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const handleMaskedCall = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradeToken');
    if (!token) {
      alert('Please sign in to call the seller.');
      window.location.href = '/signin';
      return;
    }
    setCallLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/calls/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: id })
      });
      const data = await res.json();
      if (data.success) {
        setCallSession(data);
        trackInquiry('phone');
        // On mobile, immediately open the dialler
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          window.location.href = `tel:${data.proxyNumber}`;
        }
      } else {
        alert(data.message || 'Could not get a proxy number. Please try again.');
      }
    } catch {
      alert('Error connecting. Please try again.');
    } finally {
      setCallLoading(false);
    }
  };

  // Helper function to check if vehicle is electric or plug-in hybrid (has charging capability)
  const isElectricOrPluginHybrid = (fuelType) => {
    if (!fuelType) return false;
    return fuelType === 'Electric' || 
           fuelType === 'Hybrid' ||
           fuelType === 'Petrol Hybrid' ||
           fuelType === 'Diesel Hybrid' ||
           fuelType === 'Plug-in Hybrid' ||
           fuelType === 'Petrol Plug-in Hybrid' ||
           fuelType === 'Diesel Plug-in Hybrid' ||
           fuelType.toLowerCase().includes('hybrid') ||
           fuelType.toLowerCase().includes('electric');
  };

  // Function to handle back navigation intelligently
  const handleBackClick = () => {
    // Check if we have a 'from' state passed from the previous page
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      // Try to go back in history
      navigate(-1);
    } else {
      // Default to search results
      navigate('/search-results');
    }
  };

  useEffect(() => {
    fetchCarDetails();
    checkIfFavorite();
  }, [id]);

  // Add window resize listener to detect mobile/desktop
  useEffect(() => {
    // Set initial value
    const checkMobile = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
    };
    
    // Check immediately on mount
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll spy for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'cd-contact', name: 'contact' },
        { id: 'cd-overview', name: 'overview' },
        { id: 'cd-description', name: 'description' },
        { id: 'cd-running-costs', name: 'running-costs' },
        { id: 'cd-vehicle-history', name: 'vehicle-history' },
        { id: 'cd-mot-history', name: 'mot-history' },
        { id: 'price-indicator-section', name: 'price-indicator' },
        { id: 'cd-finance', name: 'finance' },
        { id: 'cd-meet-seller', name: 'meet-seller' }
      ];

      const scrollPosition = window.scrollY + 200; // Offset for sticky nav height

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(sections[i].name);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % (car?.images?.length || 1));
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + (car?.images?.length || 1)) % (car?.images?.length || 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, car]);

  // Close share menu when clicking outside
  useEffect(() => {
    if (!showShareMenu) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.share-icon-btn') && !e.target.closest('.share-menu-image')) {
        setShowShareMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navHeight = 80; // Height of sticky nav
      // getBoundingClientRect gives position relative to viewport — works correctly
      // even for elements inside sticky/fixed containers
      const rect = section.getBoundingClientRect();
      const targetPosition = window.scrollY + rect.top - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Get user's postcode from localStorage (saved from search)
      const userPostcode = localStorage.getItem('userPostcode');
      
      // Build URL with optional postcode parameter
      let url = `${API_BASE_URL}/vehicles/${id}`;
      if (userPostcode) {
        url += `?postcode=${encodeURIComponent(userPostcode)}`;
      }
      
      
      // CRITICAL: Add cache-busting headers to prevent stale data
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Car not found');
      }
      
      const data = await response.json();
      setCar(data.data);
    } catch (err) {
      console.error('Error fetching car details:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('tradeToken');
    if (!token) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/saved-cars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const savedCarIds = data.data.map(savedCar => savedCar.carId);
        setIsFavorite(savedCarIds.includes(id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Track inquiry when user clicks phone or email
  const trackInquiry = async (type) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/vehicles/${id}/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }) // 'phone' or 'email'
      });
    } catch (error) {
      console.error('Failed to track inquiry:', error);
      // Don't show error to user, just log it
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-GB').format(mileage);
  };

  // Helper function to ensure URL has protocol
  const ensureHttpProtocol = (url) => {
    if (!url) return '';
    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Add https:// prefix
    return `https://${url}`;
  };

  // Generate comprehensive title for ALL vehicles (AutoTrader style)
  // Examples:
  // Electric: "M50 83.9kWh Gran Coupe Auto AWD 5dr"
  // Petrol/Diesel: "2.2 i-DTEC ES GT Tourer Euro 5 5dr"
  // Van: "35 L2H2 PRIME PV PANEL VAN Manual 5dr"
  const generateComprehensiveVehicleTitle = (car) => {
    const parts = [];
    
    // For NON-ELECTRIC/NON-PHEV vehicles: Add engine size first (but not for vans if variant already contains it)
    if (!isElectricOrPluginHybrid(car.fuelType) && car.engineSize) {
      const size = parseFloat(car.engineSize);
      if (!isNaN(size) && size > 0) {
        // Check if variant already contains engine size info (common for vans like "35 L2H2")
        const variantHasEngineInfo = car.variant && /^\d+/.test(car.variant);
        if (!variantHasEngineInfo) {
          // If engine size is > 100, it's in CC, convert to litres
          const sizeInLitres = size > 100 ? size / 1000 : size;
          // Use 1 decimal precision (1.598 -> 1.6)
          parts.push(sizeInLitres.toFixed(1));
        }
      }
    }
    
    // Add fuel type for better search filtering
    // For hybrids, show "Petrol Hybrid" or "Diesel Hybrid" (AutoTrader format)
    if (car.fuelType && !isElectricOrPluginHybrid(car.fuelType)) {
      if (car.fuelType === 'Hybrid') {
        // Check if it's petrol or diesel hybrid from variant or default to Petrol Hybrid
        const variantLower = (car.variant || '').toLowerCase();
        if (variantLower.includes('diesel') || variantLower.includes('tdi') || variantLower.includes('hdi')) {
          parts.push('Diesel Hybrid');
        } else {
          parts.push('Petrol Hybrid');
        }
      } else {
        parts.push(car.fuelType);
      }
    }
    
    // Add variant if available (contains fuel type + trim like "i-DTEC ES GT" or "M50" or "35 L2H2 PRIME PV PANEL VAN")
    if (car.variant && car.variant !== 'null' && car.variant !== 'undefined' && car.variant.trim() !== '') {
      parts.push(car.variant.trim());
    }
    
    // For ELECTRIC/PHEV vehicles: Add battery capacity
    if (isElectricOrPluginHybrid(car.fuelType)) {
      const batteryCapacity = car.batteryCapacity || car.runningCosts?.batteryCapacity;
      if (batteryCapacity) {
        parts.push(`${batteryCapacity}kWh`);
      }
    }
    
    // Add body type ONLY if it's NOT already in the variant
    // For vans, "PANEL VAN" is often part of the variant, so don't duplicate
    if (car.bodyType && car.bodyType !== 'null' && car.bodyType !== 'undefined') {
      const bodyTypeInVariant = car.variant && 
        car.variant.toUpperCase().includes(car.bodyType.toUpperCase());
      
      if (!bodyTypeInVariant) {
        parts.push(car.bodyType);
      }
    }
    
    // Add transmission (Auto/Manual)
    if (car.transmission) {
      const trans = car.transmission.toLowerCase();
      if (trans === 'automatic' || trans === 'auto') {
        parts.push('Auto');
      } else if (trans === 'manual') {
        parts.push('Manual');
      } else {
        parts.push(car.transmission);
      }
    }
    
    // Add emission class (Euro 5, Euro 6, etc.) - for non-electric/non-PHEV vehicles
    if (!isElectricOrPluginHybrid(car.fuelType) && car.emissionClass && car.emissionClass.includes('Euro')) {
      parts.push(car.emissionClass);
    }
    
    // Add drive type if available (AWD, FWD, RWD, 4WD)
    if (car.driveType) {
      parts.push(car.driveType);
    }
    
    // Add doors (5dr, 3dr, etc.)
    if (car.doors) {
      parts.push(`${car.doors}dr`);
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  };

  if (isLoading) {
    return (
      <div className="car-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-detail-page">
        <div className="error-container">
          <h2>Car Not Found</h2>
          <p>{error || 'The car you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/search-results')} className="back-btn">
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 
    ? car.images 
    : ['/images/dummy/red-car.png'];

  // Handle image error
  const handleImageError = (e) => {
    console.error('Main image failed to load:', getCurrentImage());
    setImageError(true);
    if (e && e.target) {
      e.target.src = '/images/dummy/red-car.png';
    }
  };

  // Get current image with fallback
  const getCurrentImage = () => {
    if (imageError || !images[currentImageIndex]) {
      return '/images/dummy/red-car.png';
    }
    return images[currentImageIndex];
  };

  // Generate SEO data
  const carTitle = `${car.year} ${car.make} ${car.model}${car.submodel ? ` ${car.submodel}` : ''}`;
  const carDescription = `${carTitle} for sale. ${formatMileage(car.mileage)} miles, ${car.fuelType}, ${car.transmission}. ${car.description ? car.description.substring(0, 100) : 'View full details and contact seller.'}`;
  const carLocation = extractTownName(car.locationName) || 'UK';

  return (
    <>
      <SEOHelmet 
        title={`${carTitle} for Sale in ${carLocation} | ${formatPrice(car.price)} | CarCatlog`}
        description={carDescription}
        keywords={`${car.make} ${car.model}, ${car.year} ${car.make}, ${car.fuelType} car, ${car.transmission} car, used ${car.make}, cars for sale ${carLocation}`}
        url={`/cars/${car._id}`}
        image={images[0]}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            vehicleSchema(car),
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Used Cars', url: '/used-cars' },
              { name: carTitle, url: `/cars/${car._id}` }
            ])
          ]
        }}
      />
      <div className="car-detail-page">
        <div className="detail-container">
          {/* Back Button and Action Icons Row */}
          <div className="page-header-row">
            <button onClick={handleBackClick} className="back-to-results">
              ← Back to results
            </button>
            
            {/* Action Icons - Heart and Share */}
            <div className="page-action-icons">
              {/* Favorite Icon */}
              <button 
                className={`page-icon-btn favorite-icon-btn ${isFavorite ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(e); }}
                disabled={favoriteLoading}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              {/* Share Icon */}
              <button 
                className="page-icon-btn share-icon-btn"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                title="Share this car"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>
          </div>

        {/* Sticky Navigation Tabs */}
        <div className="sticky-nav-tabs">
          <div className="sticky-nav-container">
            <button 
              className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-contact')}
            >
              Contact Seller
            </button>
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-overview')}
            >
              Overview
            </button>
            <button 
              className={`nav-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-description')}
            >
              Description
            </button>
            <button 
              className={`nav-tab ${activeTab === 'running-costs' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-running-costs')}
            >
              Running Costs
            </button>
            <button 
              className={`nav-tab ${activeTab === 'vehicle-history' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-vehicle-history')}
            >
              Vehicle History
            </button>
            <button 
              className={`nav-tab ${activeTab === 'mot-history' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-mot-history')}
            >
              MOT History
            </button>
            <button 
              className={`nav-tab ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-finance')}
            >
              Finance Calculator
            </button>
            
            <button 
              className={`nav-tab ${activeTab === 'meet-seller' ? 'active' : ''}`}
              onClick={() => scrollToSection('cd-meet-seller')}
            >
              Meet Seller
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div id="cd-gallery" className="image-gallery">
          <div className="main-image" style={{ cursor: 'zoom-in' }} onClick={() => { setLightboxIndex(currentImageIndex); setLightboxOpen(true); }}>
            <img 
              src={getCurrentImage()} 
              alt={`${car.make} ${car.model}${car.submodel ? ` ${car.submodel}` : ''}`}
              onError={handleImageError}
              onLoad={() => {}} // Image loaded successfully
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#f5f5f5'
              }}
            />
            <button className="gallery-btn" onClick={(e) => { e.stopPropagation(); setLightboxIndex(currentImageIndex); setLightboxOpen(true); }}>
              📷 Gallery
            </button>
            <span className="image-counter">
              🖼️ {images.length}
            </span>
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`View ${index + 1}`}
                  className={currentImageIndex === index ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    console.error('Thumbnail image failed to load:', img);
                    e.target.src = '/images/dummy/red-car.png';
                  }}
                  style={{
                    width: '100px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: currentImageIndex === index ? '2px solid #0066cc' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                    background: '#f5f5f5'
                  }}
                />
              ))}
              {images.length > 4 && (
                <button className="more-images">
                  +{images.length - 4} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Share Dropdown Menu - Positioned below image gallery */}
        {showShareMenu && (
          <div className="share-menu-image">
            <button onClick={() => shareToSocial('whatsapp')} className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
            <button onClick={() => shareToSocial('facebook')} className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button onClick={() => shareToSocial('twitter')} className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            <button onClick={() => shareToSocial('email')} className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email
            </button>
            <button onClick={() => shareToSocial('copy')} className="share-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {shareCopied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxOpen(false)}
          >
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
            {images.length > 1 && (
              <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + images.length) % images.length); }}>‹</button>
            )}
            <img
              src={images[lightboxIndex] || '/images/dummy/red-car.png'}
              alt={`Photo ${lightboxIndex + 1}`}
              className="lightbox-img"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.target.src = '/images/dummy/red-car.png'; }}
            />
            {images.length > 1 && (
              <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % images.length); }}>›</button>
            )}
            <div className="lightbox-counter">{lightboxIndex + 1} / {images.length}</div>
          </div>
        )}

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column - Car Details */}
          <div className="left-column">
            {/* Location - AutoTrader Style */}
            <div className="location-info">
              <span className="location-label">From</span>
              <span className="location-value">
                {extractTownName(car.locationName) || 'Location available'}
                {car.distance && car.distance > 0 && (
                  <> • <span className="distance-info">{Math.round(car.distance)} miles away</span></>
                )}
              </span>
            </div>

            {/* Title and Price - AutoTrader Format */}
            <div className="car-header">
              <div className="car-header-left">
                {/* Write-off Warning Badge - Show for CAT A, B, C, S, N, D, and UNKNOWN */}
                {car.historyCheckId && 
                 car.historyCheckId.writeOffCategory && 
                 (() => {
                   const category = car.historyCheckId.writeOffCategory.toUpperCase();
                   const isKnownCategory = ['A', 'B', 'C', 'S', 'N', 'D'].includes(category);
                   const isUnknownCategory = category === 'UNKNOWN' || category === 'NOT KNOWN';
                   
                   // Show badge for known categories OR unknown category
                   if (isKnownCategory || isUnknownCategory) {
                     return (
                       <div className="write-off-warning-badge">
                         <svg className="warning-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                           <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16v2h2v-2h-2zm0-6v4h2v-4h-2z"/>
                         </svg>
                         <span className="warning-text">
                           {isUnknownCategory ? 'CAT UNKNOWN' : `CAT ${category}`}
                         </span>
                       </div>
                     );
                   }
                   return null;
                 })()
                }
                
                <h1 className="car-make-model">
                  {/* AutoTrader Style Line 1: Make + Model only */}
                  {car.make} {car.model}
                </h1>
                <h2 className="car-variant-line">
                  {/* AutoTrader Style Line 2: Variant + Battery + BodyType + Transmission + Doors */}
                  {(() => {
                    const parts = [];
                    
                    // 1. Variant
                    if (car.variant && car.variant !== 'null' && car.variant !== 'undefined' && car.variant.trim() !== '') {
                      parts.push(car.variant.trim());
                    }
                    
                    // 2. Battery capacity for PHEV/Electric
                    if (car.batteryCapacity) {
                      parts.push(`${car.batteryCapacity}kWh`);
                    }
                    
                    // 3. Body type
                    if (car.bodyType && car.bodyType !== 'null' && car.bodyType !== 'undefined') {
                      parts.push(car.bodyType);
                    }
                    
                    // 4. Transmission
                    if (car.transmission) {
                      const trans = car.transmission.toLowerCase();
                      parts.push(trans === 'automatic' || trans === 'auto' ? 'Auto' : trans === 'manual' ? 'Manual' : car.transmission);
                    }
                    
                    // 5. Doors
                    if (car.doors) {
                      parts.push(`${car.doors}dr`);
                    }
                    
                    return parts.join(' ');
                  })()}
                </h2>
                <div
                  className="price-tag"
                  onClick={() => scrollToSection('price-indicator-section')}
                  style={{ cursor: 'pointer' }}
                  title="Click to see price analysis"
                >
                  {formatPrice(car.price)}
                </div>
              </div>
              
              {/* Price Indicator - Right side on mobile */}
              <div className="car-header-right">
                {car.price && (() => {
                  // Get market value from different sources
                  // car.valuation structure: { privatePrice, dealerPrice, partExchangePrice }
                  // car.allValuations structure: { private, retail, trade } (set by controller)
                  let marketValue = car.allValuations?.private || 
                                   car.allValuations?.Private ||
                                   car.valuation?.privatePrice ||
                                   car.allValuations?.retail || 
                                   car.allValuations?.Retail ||
                                   car.valuation?.dealerPrice ||
                                   car.estimatedValue;
                  
                  // Only hide if no valuation data at all
                  // price === marketValue is valid (Fair price) — still show indicator
                  if (!marketValue) {
                    return null;
                  }
                  
                  const priceRatio = car.price / marketValue;
                  let priceLevel = '';
                  let needleAngle = 270;
                  let labelColor = '';
                  let underlineColor = '';
                  
                  if (priceRatio <= 0.78) {
                    priceLevel = 'Great price';
                    needleAngle = 210;
                    labelColor = '#1565C0';
                    underlineColor = '#4A90E2';
                  } else if (priceRatio <= 0.92) {
                    priceLevel = 'Good price';
                    needleAngle = 240;
                    labelColor = '#0D47A1';
                    underlineColor = '#1657C4';
                  } else if (priceRatio <= 1.05) {
                    priceLevel = 'Fair price';
                    needleAngle = 300;
                    labelColor = '#E65100';
                    underlineColor = '#F5A623';
                  } else if (priceRatio <= 1.20) {
                    priceLevel = 'Higher price';
                    needleAngle = 330;
                    labelColor = '#E65100';
                    underlineColor = '#FF7043';
                  } else {
                    priceLevel = 'Higher price';
                    needleAngle = 350;
                    labelColor = '#BF360C';
                    underlineColor = '#FF5722';
                  }
                  
                  const rad = needleAngle * Math.PI / 180;
                  const nx = 120 + 60 * Math.cos(rad);
                  const ny = 120 + 60 * Math.sin(rad);
                  
                  return (
                    <div 
                      className="good-price-indicator mobile-header-indicator"
                      onClick={() => scrollToSection('price-indicator-section')}
                      style={{ cursor: 'pointer' }}
                      title="Tap to see full price analysis"
                    >
                      <div className="price-gauge">
                        <svg viewBox="0 0 240 140" className="gauge-svg">
                          {/* Outer blue arc - with gap from inner segments */}
                          <path d="M 28 120 A 92 92 0 0 1 212 120" fill="none" stroke="#2196F3" strokeWidth="6" strokeLinecap="round" opacity="1"/>
                          
                          {/* Inner colored segments with MINIMAL GAPS - flat edges */}
                          {/* Gray segment - left */}
                          <path d="M 50 120 A 70 70 0 0 1 71 66" fill="none" stroke="#CFD8DC" strokeWidth="16" strokeLinecap="butt"/>
                          
                          {/* Light blue segment - left-center (tiny gap) */}
                          <path d="M 73 64 A 70 70 0 0 1 108 45" fill="none" stroke="#90CAF9" strokeWidth="16" strokeLinecap="butt"/>
                          
                          {/* Dark blue segment - center (tiny gap) */}
                          <path d="M 110 44 A 70 70 0 0 1 130 44" fill="none" stroke="#1565C0" strokeWidth="16" strokeLinecap="butt"/>
                          
                          {/* Yellow/Orange segment - center-right (tiny gap) */}
                          <path d="M 132 45 A 70 70 0 0 1 167 64" fill="none" stroke="#FFB300" strokeWidth="16" strokeLinecap="butt"/>
                          
                          {/* Orange segment - right (tiny gap) */}
                          <path d="M 169 66 A 70 70 0 0 1 190 120" fill="none" stroke="#FF6F00" strokeWidth="16" strokeLinecap="butt"/>
                          
                          {/* Needle */}
                          <line x1="120" y1="120" x2={nx} y2={ny} stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                          
                          {/* Hollow center pivot */}
                          <circle cx="120" cy="120" r="8" fill="#fff" stroke="#1a1a1a" strokeWidth="3"/>
                        </svg>
                      </div>
                      <div className="price-label-wrap">
                        <div className="price-label-text" style={{ color: labelColor }}>{priceLevel}</div>
                        <div className="price-label-underline" style={{ background: underlineColor }}></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Contact Seller - Mobile Only (appears between header and overview) */}
            <div id="cd-contact" className="contact-card mobile-contact-card">
              <h3>Contact seller</h3>
              
              <div className="seller-info">
                <span className="seller-type">
                  {car.sellerContact?.type === 'trade' || car.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                {car.sellerContact?.businessName && (
                  <div className="business-name">{car.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {extractTownName(car.locationName)}
                  {car.distance && car.distance > 0 && (
                    <span className="distance-highlight"> • {Math.round(car.distance)} miles away</span>
                  )}
                </div>
              </div>

              {(car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber) && (
                <>
                  {(car.isDealerListing || car.dealerId || car.sellerContact?.type === 'trade') ? (
                    <a
                      href={`tel:${car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}`}
                      className="phone-btn"
                      style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}
                      onClick={() => trackInquiry('phone')}
                    >
                      📞 {car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}
                    </a>
                  ) : callSession ? (
                    <a href={`tel:${callSession.proxyNumber}`} className="phone-btn" style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}>
                      📞 {callSession.proxyNumber} <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{!callSession.isDirectNumber && callSession.expiresIn && `(expires in ${Math.floor(callSession.expiresIn / 60)}m)`}</span>
                    </a>
                  ) : (
                    <button
                      className="phone-btn"
                      onClick={handleMaskedCall}
                      disabled={callLoading}
                      style={{ width: '100%', cursor: 'pointer', border: 'none' }}
                    >
                      {callLoading ? '⏳ Connecting...' : '📞 Call Seller'}
                    </button>
                  )}
                </>
              )}
              {car.sellerContact?.allowEmailContact && car.sellerContact?.email && (
                <a 
                  href={`mailto:${car.sellerContact.email}`}
                  className="seller-email-contact"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => trackInquiry('email')}
                >
                  ✉️ {car.sellerContact.email}
                </a>
              )}
            </div>

            {/* Overview Section */}
            <div id="cd-overview" className="overview-section">
              <h2>Overview</h2>
              
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/mileage.jpeg" alt="Mileage" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">{formatMileage(car.mileage)} miles</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/registration.jpeg" alt="Registration" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Registration</span>
                    <span className="spec-value">
                      {car.year}
                      {car.registrationNumber && (
                        <span className="spec-reg-plate"> {car.registrationNumber}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/fuel-type.jpeg" alt="Fuel type" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Fuel type</span>
                    <span className="spec-value">{car.fuelType}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/body-type.jpeg" alt="Body type" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Body type</span>
                    <span className="spec-value">{car.bodyType ? car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1).toLowerCase() : 'Hatchback'}</span>
                  </div>
                </div>
                {/* Engine size for NON-ELECTRIC cars, or PLUG-IN HYBRIDS (they have both engine and electric) */}
                {(!isElectricOrPluginHybrid(car.fuelType) || car.fuelType.toLowerCase().includes('plug-in')) && (
                  <div className="spec-item">
                    <span className="spec-icon">
                      <img src="/icon/engine-size.jpeg" alt="Engine size" style={{ width: '80px', height: '80px' }} />
                    </span>
                    <div className="spec-details">
                      <span className="spec-label">Engine size</span>
                      <span className="spec-value">
                        {car.engineSize 
                          ? (() => {
                              const size = parseFloat(car.engineSize);
                              // If size > 100, it's in CC, convert to litres
                              const sizeInLitres = size > 100 ? size / 1000 : size;
                              // Use 1 decimal precision (1.598 -> 1.6L)
                              return `${sizeInLitres.toFixed(1)}L`;
                            })()
                          : car.variant && /\d+cc/i.test(car.variant)
                            ? car.variant.match(/(\d+)cc/i)[1] + 'cc'
                            : 'Contact seller'
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Electric Range for ELECTRIC and PLUG-IN HYBRID cars */}
                {isElectricOrPluginHybrid(car.fuelType) && (
                  <div className="spec-item">
                    <span className="spec-icon">
                      <img src="/icon/electric-range.jpeg" alt="Electric Range" style={{ width: '80px', height: '80px' }} />
                    </span>
                    <div className="spec-details">
                      <span className="spec-label">Electric Range</span>
                      <span className="spec-value">
                        {car.electricRange || car.runningCosts?.electricRange 
                          ? `${car.electricRange || car.runningCosts?.electricRange} miles` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/gearbox.jpeg" alt="Gearbox" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Gearbox</span>
                    <span className="spec-value">
                      {car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1).toLowerCase() : 'Manual'}
                      {car.gearbox && ` (${car.gearbox} speed)`}
                    </span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/doors.jpeg" alt="Doors" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Doors</span>
                    <span className="spec-value">{car.doors || 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/seats.jpeg" alt="Seats" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Seats</span>
                    <span className="spec-value">{car.seats || 'N/A'}</span>
                  </div>
                </div>

                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/body-color.jpeg" alt="Body colour" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">Body colour</span>
                    <span className="spec-value">
                      {formatColor(car.color)}
                    </span>
                  </div>
                </div>

                {/* MOT Due Information */}
                <div className="spec-item">
                  <span className="spec-icon">
                    <img src="/icon/mot-due.jpeg" alt="MOT Due" style={{ width: '80px', height: '80px' }} />
                  </span>
                  <div className="spec-details">
                    <span className="spec-label">MOT Due</span>
                    <span className="spec-value">
                      {(() => {
                        // Use UTC parts to avoid BST/timezone shift on date-only values stored as UTC midnight
                        const formatMotDate = (val, short = false) => {
                          const d = new Date(val);
                          if (isNaN(d.getTime())) return null;
                          const months = short
                            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                            : ['January','February','March','April','May','June','July','August','September','October','November','December'];
                          const day = String(d.getUTCDate()).padStart(2, '0');
                          return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
                        };

                        if (car.motDue || car.motExpiry) {
                          return formatMotDate(car.motDue || car.motExpiry, true);
                        }
                        if (car.motHistory && car.motHistory.length > 0 && car.motHistory[0].expiryDate) {
                          return formatMotDate(car.motHistory[0].expiryDate, true);
                        }
                        // Check if vehicle is new (less than 3 years old)
                        const currentYear = new Date().getFullYear();
                        const vehicleAge = currentYear - car.year;
                        if (vehicleAge < 3) return 'Not required (new vehicle)';
                        return 'Contact seller for MOT details';
                      })()}
                    </span>
                  </div>
                </div>

                {car.emissionClass && (
                  <div className="spec-item">
                    <span className="spec-icon">🏷️</span>
                    <div className="spec-details">
                      <span className="spec-label">Emission class</span>
                      <span className="spec-value">{car.emissionClass}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="view-all-specs"
                onClick={() => {
                  setShowAllFeatures(true);
                  // Scroll to features section
                  setTimeout(() => {
                    const featuresSection = document.querySelector('.features-section');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              >
                ≡ Display all specs and features →
              </button>
            </div>

            {/* Description */}
            {car.description && (
              <div id="cd-description" className="description-section">
                <h2>Description</h2>
                <p>{car.description}</p>
              </div>
            )}

            {/* YouTube Video Section */}
            {car.videoUrl && (
              <div className="video-section">
                <h2>Video</h2>
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={car.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="Vehicle Video"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Running Costs Section - For ALL cars (Electric and Non-Electric) */}
            {car.runningCosts && (
              <div id="cd-running-costs" className="running-costs-section-new">
                <h2>Running costs</h2>
                <div className="running-costs-horizontal">
                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <img src="/icon/running cost/combined-mpg.jpeg" alt="CO2 Emissions" style={{ width: '80px', height: '80px' }} />
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">CO₂ emissions</div>
                      <div className="cost-value">
                        {isElectricOrPluginHybrid(car.fuelType) && car.fuelType === 'Electric' ? '0g/km' : (car.runningCosts?.co2Emissions ? `${car.runningCosts.co2Emissions}g/km` : 'N/A')}
                      </div>
                    </div>
                  </div>

                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <img src="/icon/running cost/insurance.jpeg" alt="Insurance" style={{ width: '80px', height: '80px' }} />
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">Insurance group</div>
                      <div className="cost-value">{(car.runningCosts?.insuranceGroup || car.insuranceGroup) || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="running-cost-item">
                    <div className="cost-icon-wrapper">
                      <img src="/icon/running cost/tax.jpeg" alt="Tax" style={{ width: '80px', height: '80px' }} />
                    </div>
                    <div className="cost-content">
                      <div className="cost-label">Tax per year</div>
                      <div className="cost-value">
                        {(car.runningCosts?.annualTax || car.annualTax) ? formatPrice(car.runningCosts?.annualTax || car.annualTax) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {!isElectricOrPluginHybrid(car.fuelType) && car.runningCosts?.fuelEconomy && (car.runningCosts.fuelEconomy.combined || car.runningCosts.fuelEconomy.urban || car.runningCosts.fuelEconomy.extraUrban) && (
                  <div className="additional-running-costs">
                    <div className="fuel-economy-grid">
                      {car.runningCosts.fuelEconomy.combined && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/co2-emissions.jpeg" alt="Combined MPG" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Combined MPG</span>
                            <span className="fuel-value">{car.runningCosts.fuelEconomy.combined} mpg</span>
                          </div>
                        </div>
                      )}

                      {car.runningCosts.fuelEconomy.urban && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/urban-mpg.jpeg" alt="Urban MPG" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Urban MPG</span>
                            <span className="fuel-value">{car.runningCosts.fuelEconomy.urban} mpg</span>
                          </div>
                        </div>
                      )}

                      {car.runningCosts.fuelEconomy.extraUrban && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/combined-mpg.jpeg" alt="Extra Urban MPG" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Extra Urban MPG</span>
                            <span className="fuel-value">{car.runningCosts.fuelEconomy.extraUrban} mpg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isElectricOrPluginHybrid(car.fuelType) && (car.runningCosts?.electricRange || car.runningCosts?.batteryCapacity || car.runningCosts?.chargingTime || car.electricRange || car.batteryCapacity || car.chargingTime) && (
                  <div className="additional-running-costs">
                    <div className="fuel-economy-grid">
                      {(car.runningCosts?.electricRange || car.electricRange) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/electric-range.jpeg" alt="Electric Range" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Electric Range</span>
                            <span className="fuel-value">{car.runningCosts?.electricRange || car.electricRange} miles</span>
                          </div>
                        </div>
                      )}

                      {(car.runningCosts?.batteryCapacity || car.batteryCapacity) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/battery.jpeg" alt="Battery Capacity" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Battery Capacity</span>
                            <span className="fuel-value">{car.runningCosts?.batteryCapacity || car.batteryCapacity} kWh</span>
                          </div>
                        </div>
                      )}

                      {(car.runningCosts?.chargingTime || car.chargingTime) && (
                        <div className="fuel-economy-item">
                          <span className="fuel-icon">
                            <img src="/icon/running cost/charging-time.jpeg" alt="Charging Time" style={{ width: '80px', height: '80px' }} />
                          </span>
                          <div className="fuel-details">
                            <span className="fuel-label">Charging Time</span>
                            <span className="fuel-value">{car.runningCosts?.chargingTime || car.chargingTime} hours</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Electric Vehicle Sections - Show for both Mobile and Desktop (after Running Costs) */}
            <div className="electric-vehicle-sections">
              <ElectricVehicleCharging vehicle={car} />
              <ElectricVehicleRunningCosts vehicle={car} />
            </div>

            {/* Vehicle Features Section */}
            {showAllFeatures && car.features && car.features.length > 0 && (
              <div className="features-section">
                <h2>Vehicle Features</h2>
                <div className="features-grid">
                  {car.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Display */}
            <LocationDisplay 
              sellerPostcode={car.postcode || car.sellerContact?.postcode}
              sellerLocation={extractTownName(car.locationName)}
              distance={car.distance}
            />



            {/* Vehicle History Section - Always show, component handles missing VRM */}
            <div id="cd-vehicle-history">
            <VehicleHistorySection 
              vrm={car.registrationNumber || car.vrm}
              carData={car}
            />
            </div>

            {/* MOT History Section - Always show, component handles missing VRM */}
            <div id="cd-mot-history">
            <MOTHistorySection 
              vrm={car.registrationNumber || car.vrm}
              carData={car}
            />
            </div>

            {/* Meet the Seller Section */}
            <div id="cd-meet-seller" className="meet-seller-section">
              <h2>Meet the seller</h2>
              
              <div className="seller-details">
                {/* Seller Type Badge */}
                <span className="seller-type-badge">
                  {car.sellerType === 'trade' || car.sellerContact?.type === 'trade' ? 'Trade' : 'Private'}
                </span>
                
                {/* Trade Dealer - Show Logo and Business Info */}
                {(car.sellerType === 'trade' || car.sellerContact?.type === 'trade') && (
                  <div className="trade-seller-details">
                    {car.sellerContact?.businessLogo && (
                      <div className="dealer-logo-display">
                        <img src={car.sellerContact.businessLogo} alt={car.sellerContact?.businessName || 'Dealer'} />
                      </div>
                    )}
                    {car.sellerContact?.businessName && (
                      <div className="dealer-business-name">{car.sellerContact.businessName}</div>
                    )}
                    {car.sellerContact?.businessWebsite && (
                      <div className="dealer-website">
                        <a 
                          href={ensureHttpProtocol(car.sellerContact.businessWebsite)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dealer-website-link"
                        >
                          🌐 Visit Website →
                        </a>
                      </div>
                    )}
                    {car.sellerContact?.businessAddress && (
                      <div className="dealer-business-address">
                        {car.sellerContact.businessAddress.street && (
                          <div>{car.sellerContact.businessAddress.street}</div>
                        )}
                        {car.sellerContact.businessAddress.city && (
                          <div>{car.sellerContact.businessAddress.city}</div>
                        )}
                        {car.sellerContact.businessAddress.postcode && (
                          <div>{car.sellerContact.businessAddress.postcode}</div>
                        )}
                        {car.sellerContact.businessAddress.country && (
                          <div>{car.sellerContact.businessAddress.country}</div>
                        )}
                      </div>
                    )}
                    {!car.sellerContact?.businessAddress && (
                      <div className="dealer-location">
                        📍 {extractTownName(car.locationName) || 'Location available'}
                        {car.distance && car.distance > 0 && (
                          <> • <span className="distance-highlight">{Math.round(car.distance)} miles away</span></>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Private Seller */}
                {(car.sellerType === 'private' || car.sellerContact?.type === 'private') && (
                  <div className="private-seller-details">
                    <div className="private-seller-icon">👤</div>
                    <div className="private-seller-label">Private Seller</div>
                    <div className="private-seller-location">
                      📍 {extractTownName(car.locationName) || 'Location available'}
                      {car.distance && car.distance > 0 && (
                        <> • <span className="distance-highlight">{Math.round(car.distance)} miles away</span></>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="seller-contact-buttons">
                  {(car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber) && (
                    <>
                      {/* Trade seller — show real number directly */}
                      {(car.isDealerListing || car.dealerId) ? (
                        <a
                          href={`tel:${car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}`}
                          className="call-seller-btn"
                          style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}
                          onClick={() => trackInquiry('phone')}
                        >
                          📞 {car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}
                        </a>
                      ) : callSession ? (
                        <a href={`tel:${callSession.proxyNumber}`} className="call-seller-btn" style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}>
                          📞 {callSession.proxyNumber} <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{!callSession.isDirectNumber && callSession.expiresIn && `(expires in ${Math.floor(callSession.expiresIn / 60)}m)`}</span>
                        </a>
                      ) : (
                        <button
                          className="call-seller-btn"
                          onClick={handleMaskedCall}
                          disabled={callLoading}
                          style={{ width: '100%', cursor: 'pointer', border: 'none' }}
                        >
                          {callLoading ? '⏳ Connecting...' : '📞 Call Seller'}
                        </button>
                      )}
                    </>
                  )}
                  {car.sellerContact?.allowEmailContact && car.sellerContact?.email && (
                    <a 
                      href={`mailto:${car.sellerContact.email}`}
                      className="seller-email"
                      style={{ textDecoration: 'none', display: 'block' }}
                      onClick={() => trackInquiry('email')}
                    >
                      ✉️ {car.sellerContact.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Seller */}
          <div className="right-column">
            <div id="cd-contact-desktop" className="contact-card">
              <h3>Contact seller</h3>
              
              <div className="seller-info">
                <span className="seller-type">
                  {car.sellerContact?.type === 'trade' || car.sellerType === 'trade' ? 'Trade seller' : 'Private seller'}
                </span>
                {car.sellerContact?.businessName && (
                  <div className="business-name">{car.sellerContact.businessName}</div>
                )}
                <div className="seller-location">
                  {extractTownName(car.locationName)}
                  {car.distance && car.distance > 0 && (
                    <span className="distance-highlight"> • {Math.round(car.distance)} miles away</span>
                  )}
                </div>
              </div>

              {(car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber) && (
                <>
                  {(car.isDealerListing || car.dealerId || car.sellerContact?.type === 'trade') ? (
                    <a
                      href={`tel:${car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}`}
                      className="phone-btn"
                      style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}
                      onClick={() => trackInquiry('phone')}
                    >
                      📞 {car.sellerContact?.phoneNumber || car.sellerContact?.phone || car.phoneNumber}
                    </a>
                  ) : callSession ? (
                    <a href={`tel:${callSession.proxyNumber}`} className="phone-btn" style={{ textDecoration: 'none', display: 'block', background: '#0066cc' }}>
                      📞 {callSession.proxyNumber} <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{!callSession.isDirectNumber && callSession.expiresIn && `(expires in ${Math.floor(callSession.expiresIn / 60)}m)`}</span>
                    </a>
                  ) : (
                    <button
                      className="phone-btn"
                      onClick={handleMaskedCall}
                      disabled={callLoading}
                      style={{ width: '100%', cursor: 'pointer', border: 'none' }}
                    >
                      {callLoading ? '⏳ Connecting...' : '📞 Call Seller'}
                    </button>
                  )}
                </>
              )}
              {car.sellerContact?.allowEmailContact && car.sellerContact?.email && (
                <a 
                  href={`mailto:${car.sellerContact.email}`}
                  className="seller-email-contact"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onClick={() => trackInquiry('email')}
                >
                  ✉️ {car.sellerContact.email}
                </a>
              )}
            </div>

            {/* Price Indicator - Above Finance Calculator */}
            {car.price && (() => {
              // Get market value from different sources
              // Priority: private price > retail price > dealer price > estimated value
              // car.valuation structure: { privatePrice, dealerPrice, partExchangePrice }
              // car.allValuations structure: { private, retail, trade } (set by controller)
              let marketValue = car.allValuations?.private || 
                               car.allValuations?.Private ||
                               car.valuation?.privatePrice ||
                               car.allValuations?.retail || 
                               car.allValuations?.Retail ||
                               car.valuation?.dealerPrice ||
                               car.estimatedValue;
              
              // Only show neutral gauge if no valuation data at all
              // price === marketValue is valid (Fair price) — still show indicator
              if (!marketValue) {
                return (
                  <div className="good-price-indicator" id="price-indicator-section">
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <svg viewBox="0 0 200 120" className="gauge-svg" style={{ width: '160px' }}>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e0e0e0" strokeWidth="18" strokeLinecap="round"/>
                        <line x1="100" y1="100" x2="100" y2="35" stroke="#999" strokeWidth="3" strokeLinecap="round"/>
                        <circle cx="100" cy="100" r="5" fill="#999"/>
                      </svg>
                      <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>No valuation data available</div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '4px' }}>{car.price ? `£${car.price.toLocaleString()}` : ''}</div>
                    </div>
                  </div>
                );
              }
              
              const priceRatio = car.price / marketValue;
              let priceLevel = null;
              let needleAngle = 0;
              let labelColor = '';
              
              // CORRECT LOGIC: Match gauge arc positions exactly
              // Gauge zones: Gray (0-36°) → Light Green (36-72°) → Dark Green (72-108°) → Yellow (108-144°) → Coral (144-180°)
              // IMPORTANT: Lower price ratio = Better deal = Needle points to GREEN zones (72-108°)
              if (priceRatio <= 0.75) {
                // 25% or more below market value - GREAT PRICE (Light Green zone: 36-72°)
                priceLevel = 'Great price';
                needleAngle = 54; // Middle of Light Green zone (36+72)/2
                labelColor = '#A5D6A7'; // Light Green
              } else if (priceRatio <= 0.85) {
                // 15-25% below market value - GOOD PRICE (Dark Green zone: 72-108°)
                priceLevel = 'Good price';
                needleAngle = 80; // Left side of Dark Green zone
                labelColor = '#388E3C'; // Dark Green
              } else if (priceRatio <= 0.95) {
                // 5-15% below market value - Still GOOD (Dark Green zone: 72-108°)
                priceLevel = 'Good price';
                needleAngle = 100; // Right side of Dark Green zone
                labelColor = '#388E3C'; // Dark Green
              } else if (priceRatio <= 1.05) {
                // Within 5% of market value - FAIR PRICE (Yellow zone: 108-144°)
                priceLevel = 'Fair price';
                needleAngle = 126; // Middle of Yellow zone (108+144)/2
                labelColor = '#FFC107'; // Yellow/Gold
              } else if (priceRatio <= 1.15) {
                // 5-15% above market value - HIGHER PRICE (Coral zone: 144-180°)
                priceLevel = 'Higher price';
                needleAngle = 162; // Middle of Coral zone (144+180)/2
                labelColor = '#FF7043'; // Coral/Orange
              } else {
                // More than 15% above market value - VERY HIGH PRICE (Far right of Coral zone)
                priceLevel = 'Higher price';
                needleAngle = 170; // Far right of Coral zone
                labelColor = '#FF5722'; // Deeper Red/Orange
              }
              
              // Calculate needle position
              const svgAngle = 180 - needleAngle;
              const needleX = 100 + 70 * Math.cos(svgAngle * Math.PI / 180);
              const needleY = 100 - 70 * Math.sin(svgAngle * Math.PI / 180);
              
              return (
                <div className="good-price-indicator" id="price-indicator-section">
                  <div className="price-gauge">
                    <svg viewBox="0 0 240 150" className="gauge-svg">
                      {/* OUTER BLUE GAUGE ARC - Thin and clean */}
                      <path d="M 30 130 A 90 90 0 0 1 210 130" fill="none" stroke="#2196F3" strokeWidth="6" strokeLinecap="round"/>
                      
                      {/* SPACE between outer blue arc and inner colored segments */}
                      
                      {/* INNER COLORED RANGE SEGMENTS - Equal minimal spacing between ALL segments */}
                      
                      {/* Zone 1: Gray - FAR LEFT */}
                      <path d="M 48 126 A 70 70 0 0 1 70 84" fill="none" stroke="#D3D3D3" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Zone 2: Light Blue - LEFT-CENTER (1 unit gap) */}
                      <path d="M 71 83 A 70 70 0 0 1 88 71" fill="none" stroke="#90CAF9" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Zone 3: Dark Blue - CENTER LEFT (1 unit gap) */}
                      <path d="M 89 70 A 70 70 0 0 1 118 60" fill="none" stroke="#2196F3" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Zone 4: Yellow/Orange - CENTER RIGHT (1 unit gap - same as others) */}
                      <path d="M 119 60 A 70 70 0 0 1 151 70" fill="none" stroke="#FFA726" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Zone 5: Orange - RIGHT-CENTER (1 unit gap) */}
                      <path d="M 152 71 A 70 70 0 0 1 169 83" fill="none" stroke="#FF7043" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Zone 6: Red/Orange - FAR RIGHT (1 unit gap) */}
                      <path d="M 170 84 A 70 70 0 0 1 192 126" fill="none" stroke="#FF7043" strokeWidth="10" strokeLinecap="butt"/>
                      
                      {/* Needle pointing to appropriate zone - SHORTER */}
                      <line x1="120" y1="130" x2={120 + 50 * Math.cos((180 - needleAngle) * Math.PI / 180)} y2={130 - 50 * Math.sin((180 - needleAngle) * Math.PI / 180)} stroke="#212121" strokeWidth="4" strokeLinecap="round"/>
                      <circle cx="120" cy="130" r="8" fill="#212121"/>
                      <circle cx="120" cy="130" r="4" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="price-label">
                    {priceLevel}
                  </div>
                  <div className="price-amount">
                    {formatPrice(car.price)}
                  </div>
                </div>
              );
            })()}

            {/* Finance Calculator - Below Price Indicator */}
            <div id="cd-finance">
              <FinanceCalculator 
                price={car.price || car.estimatedValue || 10000}
                apr={car.year ? (() => {
                  const age = new Date().getFullYear() - car.year;
                  if (age <= 2) return 6.9;
                  if (age <= 5) return 9.9;
                  if (age <= 9) return 12.9;
                  return 16.9;
                })() : 9.9}
                minDepositPercent={0}
                maxDepositPercent={50}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CarDetailPage;