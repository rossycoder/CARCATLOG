
// PAYMENT FIX VERSION 2.1 - Force browser cache refresh
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import advertService from '../services/advertService';
import './CarAdvertisingPricesPage.css';

const CarAdvertisingPricesPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { user } = useAuth();
  const [processingPackageId, setProcessingPackageId] = useState(null);
  const [error, setError] = useState(null);
  const [registration, setRegistration] = useState('');
  const [mileage, setMileage] = useState('');
  const [sellerType, setSellerType] = useState('private');
  const [priceRange, setPriceRange] = useState('under-1000');
  const [isPriceRangeLocked, setIsPriceRangeLocked] = useState(false); // Track if price range is auto-selected
  const [quickFormErrors, setQuickFormErrors] = useState({
    registration: '',
    mileage: ''
  });

  // Check if this is view-only mode (from /sell-your-car page)
  const searchParams = new URLSearchParams(locationState.search);
  const isViewOnly = searchParams.get('viewOnly') === 'true';

  const advertId = locationState.state?.advertId;
  const [advertData, setAdvertData] = useState(locationState.state?.advertData);
  const [vehicleData, setVehicleData] = useState(locationState.state?.vehicleData);
  const contactDetails = locationState.state?.contactDetails;
  const vehicleValuation = locationState.state?.vehicleValuation; // Get valuation from state

  // Debug logging for received data
  console.log('🔍 PRICING PAGE: Received data from navigation:', {
    advertId,
    'advertData keys': advertData ? Object.keys(advertData) : 'null',
    'vehicleData keys': vehicleData ? Object.keys(vehicleData) : 'null',
    'advertData.price': advertData?.price,
    'vehicleData.price': vehicleData?.price,
    'vehicleData.estimatedValue': vehicleData?.estimatedValue,
    'vehicleValuation': vehicleValuation,
    'vehicleValuation type': typeof vehicleValuation
  });

  // Fetch advert data ONLY if not passed via state AND no vehicleData exists
  // CRITICAL FIX: Prevent duplicate API calls by checking both advertData AND vehicleData
  useEffect(() => {
    // Only fetch if we have advertId but BOTH advertData AND vehicleData are missing
    if (advertId && !advertData && !vehicleData) {
      console.log('📸 Fetching advert data for advertId:', advertId);
      advertService.getAdvert(advertId)
        .then(response => {
          if (response.success && response.data) {
            console.log('📸 Fetched advert data with', response.data.advertData?.photos?.length || 0, 'photos');
            setAdvertData(response.data.advertData);
            setVehicleData(response.data.vehicleData);
          }
        })
        .catch(error => {
          console.error('Failed to fetch advert data:', error);
        });
    } else if (advertData || vehicleData) {
      console.log('✅ Using data from navigation state - NO API CALL NEEDED');
      console.log('📸 advertData photos:', advertData?.photos?.length || 0);
      console.log('🚗 vehicleData available:', !!vehicleData);
    }
  }, [advertId]); // Removed advertData from dependencies to prevent loops

  // Private seller pricing tiers (prices in GBP)
  const privatePricingTiers = {
    'under-1000': {
      label: 'Under £1,000',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 7.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 13.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 16.99, durationWeeks: null }
      ]
    },
    '1000-2999': {
      label: '£1,000 - £2,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 12.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 17.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 22.99, durationWeeks: null }
      ]
    },
    '3000-4999': {
      label: '£3,000 - £4,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 15.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 21.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 28.99, durationWeeks: null }
      ]
    },
    '5000-6999': {
      label: '£5,000 - £6,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 20.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 27.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 35.99, durationWeeks: null }
      ]
    },
    '7000-9999': {
      label: '£7,000 - £9,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 25.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 32.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 42.99, durationWeeks: null }
      ]
    },
    '10000-12999': {
      label: '£10,000 - £12,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 26.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 34.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 44.99, durationWeeks: null }
      ]
    },
    '13000-16999': {
      label: '£13,000 - £16,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 27.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 36.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 46.99, durationWeeks: null }
      ]
    },
    '17000-24999': {
      label: '£17,000 - £24,999',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 28.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 37.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 48.99, durationWeeks: null }
      ]
    },
    'over-24995': {
      label: 'Over £24,995',
      packages: [
        { id: 'bronze', name: 'Bronze', duration: '3 weeks', price: 29.99, durationWeeks: 3 },
        { id: 'silver', name: 'Silver', duration: '6 weeks', price: 39.99, durationWeeks: 6 },
        { id: 'gold', name: 'Gold', duration: 'Until sold', price: 49.99, durationWeeks: null }
      ]
    }
  };

  // Trade seller pricing tiers (prices exclude VAT)
  const tradePricingTiers = {
    'under-1000': {
      label: 'Under £1,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 7.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 9.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 13.99, durationWeeks: 6 }
      ]
    },
    '1001-2000': {
      label: '£1,001 - £2,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 13.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 16.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 22.99, durationWeeks: 6 }
      ]
    },
    '2001-3000': {
      label: '£2,001 - £3,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 17.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 22.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 30.99, durationWeeks: 6 }
      ]
    },
    '3001-5000': {
      label: '£3,001 - £5,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 22.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 28.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 38.99, durationWeeks: 6 }
      ]
    },
    '5001-7000': {
      label: '£5,001 - £7,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 28.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 36.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 48.99, durationWeeks: 6 }
      ]
    },
    '7001-10000': {
      label: '£7,001 - £10,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 34.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 43.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 57.99, durationWeeks: 6 }
      ]
    },
    '10001-17000': {
      label: '£10,001 - £17,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 39.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 50.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 64.99, durationWeeks: 6 }
      ]
    },
    'over-17000': {
      label: 'Over £17,000',
      packages: [
        { id: 'bronze', name: 'TRADE BRONZE', duration: '3 weeks', price: 41.99, durationWeeks: 3 },
        { id: 'silver', name: 'TRADE SILVER', duration: '4 weeks', price: 53.99, durationWeeks: 4 },
        { id: 'gold', name: 'TRADE GOLD', duration: '6 weeks', price: 67.99, durationWeeks: 6 }
      ]
    }
  };

  // Get price range options based on seller type
  const getPriceRangeOptions = () => {
    if (sellerType === 'trade') {
      return [
        { value: 'under-1000', label: 'Under £1,000' },
        { value: '1001-2000', label: '£1,001 - £2,000' },
        { value: '2001-3000', label: '£2,001 - £3,000' },
        { value: '3001-5000', label: '£3,001 - £5,000' },
        { value: '5001-7000', label: '£5,001 - £7,000' },
        { value: '7001-10000', label: '£7,001 - £10,000' },
        { value: '10001-17000', label: '£10,001 - £17,000' },
        { value: 'over-17000', label: 'Over £17,000' }
      ];
    }
    return [
      { value: 'under-1000', label: 'Under £1,000' },
      { value: '1000-2999', label: '£1,000 - £2,999' },
      { value: '3000-4999', label: '£3,000 - £4,999' },
      { value: '5000-6999', label: '£5,000 - £6,999' },
      { value: '7000-9999', label: '£7,000 - £9,999' },
      { value: '10000-12999', label: '£10,000 - £12,999' },
      { value: '13000-16999', label: '£13,000 - £16,999' },
      { value: '17000-24999', label: '£17,000 - £24,999' },
      { value: 'over-24995', label: 'Over £24,995' }
    ];
  };

  // Calculate the appropriate price range based on vehicle valuation
  const calculatePriceRange = (valuation, isTradeType) => {
    console.log('📊 calculatePriceRange called with:', { valuation, isTradeType, type: typeof valuation });
    
    if (!valuation || isNaN(valuation)) {
      console.log('❌ Invalid valuation:', valuation);
      return null;
    }
    
    const value = parseFloat(valuation);
    console.log('💰 Parsed value:', value);
    
    if (isTradeType) {
      // Trade pricing tiers
      if (value < 1000) return 'under-1000';
      if (value <= 2000) return '1001-2000';
      if (value <= 3000) return '2001-3000';
      if (value <= 5000) return '3001-5000';
      if (value <= 7000) return '5001-7000';
      if (value <= 10000) return '7001-10000';
      if (value <= 17000) return '10001-17000';
      return 'over-17000';
    } else {
      // Private pricing tiers
      let selectedRange;
      if (value < 1000) {
        selectedRange = 'under-1000';
      } else if (value <= 2999) {
        selectedRange = '1000-2999';
      } else if (value <= 4999) {
        selectedRange = '3000-4999';
      } else if (value <= 6999) {
        selectedRange = '5000-6999';
      } else if (value <= 9999) {
        selectedRange = '7000-9999';
      } else if (value <= 12999) {
        selectedRange = '10000-12999';
      } else if (value <= 16999) {
        selectedRange = '13000-16999';
      } else if (value <= 24999) {
        selectedRange = '17000-24999';
      } else {
        selectedRange = 'over-24995';
      }
      
      console.log(`✅ Selected range for £${value}: ${selectedRange}`);
      return selectedRange;
    }
  };

  // Auto-select price range on component mount if valuation is available
  useEffect(() => {
    console.log('🔍 DEBUGGING: useEffect triggered with data:', {
      vehicleValuation,
      advertData,
      vehicleData,
      sellerType,
      'vehicleData keys': vehicleData ? Object.keys(vehicleData) : 'null'
    });
    
    // Extract numeric valuation from various possible sources
    // CRITICAL FIX: Use user's entered price if no valuation available
    let valuation = null;
    let valuationSource = 'none';
    
    // Try valuation fields FIRST (these are the actual vehicle worth, not asking price)
    if (vehicleData?.allValuations?.private && typeof vehicleData.allValuations.private === 'number' && vehicleData.allValuations.private > 0) {
      valuation = vehicleData.allValuations.private;
      valuationSource = 'allValuations.private';
    } else if (vehicleData?.valuation?.estimatedValue?.private && typeof vehicleData.valuation.estimatedValue.private === 'number' && vehicleData.valuation.estimatedValue.private > 0) {
      valuation = vehicleData.valuation.estimatedValue.private;
      valuationSource = 'valuation.estimatedValue.private';
    } else if (vehicleData?.estimatedValue && typeof vehicleData.estimatedValue === 'number' && vehicleData.estimatedValue > 0) {
      valuation = vehicleData.estimatedValue;
      valuationSource = 'estimatedValue';
    } else if (vehicleValuation && typeof vehicleValuation === 'number' && vehicleValuation > 0) {
      valuation = vehicleValuation;
      valuationSource = 'vehicleValuation prop';
    } else if (vehicleData?.price && typeof vehicleData.price === 'number' && vehicleData.price > 0) {
      // Use user-entered price if no valuation available
      valuation = vehicleData.price;
      valuationSource = 'vehicleData.price (user-entered)';
    } else if (advertData?.price && typeof advertData.price === 'number' && advertData.price > 0) {
      valuation = advertData.price;
      valuationSource = 'advertData.price (user-entered)';
    }
    
    console.log('💰 Valuation extraction result:', {
      valuation,
      valuationSource,
      'vehicleData.price': vehicleData?.price,
      'advertData.price': advertData?.price,
      'vehicleData.allValuations': vehicleData?.allValuations,
      'vehicleData.estimatedValue': vehicleData?.estimatedValue
    });
    
    if (valuation && !isNaN(valuation) && valuation > 0) {
      const calculatedRange = calculatePriceRange(valuation, sellerType === 'trade');
      if (calculatedRange) {
        console.log(`🔒 Auto-selecting price range: ${calculatedRange} for valuation: £${valuation} (source: ${valuationSource}, seller type: ${sellerType})`);
        console.log(`🔒 Current priceRange state before update: ${priceRange}`);
        
        // FORCE UPDATE: Always set the calculated range regardless of current state
        console.log(`🔄 FORCE UPDATE: Setting price range to ${calculatedRange}`);
        setPriceRange(calculatedRange);
        setIsPriceRangeLocked(true);
        
        console.log(`🔒 Price range should now be: ${calculatedRange}`);
      }
    } else {
      // No valuation data - allow manual selection
      setIsPriceRangeLocked(false);
      console.log('🔓 No valuation data - manual price range selection enabled');
    }
  }, [vehicleValuation, advertData, vehicleData, sellerType]); // Removed priceRange from dependencies to prevent loops

  // Auto-detect seller type based on business info
  useEffect(() => {
    console.log('🔍 Auto-detection check:', {
      hasAdvertData: !!advertData,
      hasVehicleData: !!vehicleData,
      businessLogo: advertData?.businessLogo,
      businessWebsite: advertData?.businessWebsite,
      vehicleBusinessLogo: vehicleData?.sellerContact?.businessLogo,
      vehicleBusinessWebsite: vehicleData?.sellerContact?.businessWebsite
    });
    
    // Check both advertData and vehicleData for business info
    const hasLogo = (advertData?.businessLogo && advertData.businessLogo.trim() !== '') ||
                    (vehicleData?.sellerContact?.businessLogo && vehicleData.sellerContact.businessLogo.trim() !== '');
    const hasWebsite = (advertData?.businessWebsite && advertData.businessWebsite.trim() !== '') ||
                       (vehicleData?.sellerContact?.businessWebsite && vehicleData.sellerContact.businessWebsite.trim() !== '');
    
    if (hasLogo || hasWebsite) {
      setSellerType('trade');
      console.log('✅ Auto-detected as TRADE seller (has logo or website)');
      console.log('   Logo:', hasLogo ? '✓' : '✗');
      console.log('   Website:', hasWebsite ? '✓' : '✗');
    } else if (advertData || vehicleData) {
      // Only set to private if we have data but no business info
      setSellerType('private');
      console.log('✅ Auto-detected as PRIVATE seller (no business info)');
    }
  }, [advertData, vehicleData]);

  // Separate effect to handle initial price range setting when vehicleData becomes available
  useEffect(() => {
    if (vehicleData?.price && typeof vehicleData.price === 'number' && priceRange === 'under-1000') {
      console.log('🚀 INITIAL: vehicleData.price available, forcing price range calculation');
      const calculatedRange = calculatePriceRange(vehicleData.price, sellerType === 'trade');
      if (calculatedRange && calculatedRange !== 'under-1000') {
        console.log(`🚀 INITIAL: Setting price range to ${calculatedRange} for £${vehicleData.price}`);
        setPriceRange(calculatedRange);
        setIsPriceRangeLocked(true);
      }
    }
  }, [vehicleData?.price, sellerType]);

  // EMERGENCY FALLBACK: Force correct price range if we detect the wrong one is being used
  useEffect(() => {
    if (priceRange === 'under-1000' && vehicleData?.price && vehicleData.price > 1000) {
      console.log('🚨 EMERGENCY FALLBACK: Detected under-1000 with high value vehicle, forcing correction');
      const correctRange = calculatePriceRange(vehicleData.price, sellerType === 'trade');
      if (correctRange) {
        console.log(`🚨 EMERGENCY: Correcting ${priceRange} to ${correctRange} for £${vehicleData.price}`);
        setPriceRange(correctRange);
        setIsPriceRangeLocked(true);
      }
    }
  }, [priceRange, vehicleData?.price, sellerType]);

  // Reset price range when seller type changes
  const handleSellerTypeChange = (type) => {
    console.log('🔄 Seller type changed to:', type);
    setSellerType(type);
    
    // If price range is locked (auto-selected), recalculate for new seller type
    if (isPriceRangeLocked) {
      // Extract numeric valuation - CRITICAL FIX: Prioritize actual valuation over user price
      let valuation = null;
      
      if (vehicleData?.allValuations?.private && typeof vehicleData.allValuations.private === 'number') {
        valuation = vehicleData.allValuations.private;
      } else if (vehicleData?.valuation?.estimatedValue?.private && typeof vehicleData.valuation.estimatedValue.private === 'number') {
        valuation = vehicleData.valuation.estimatedValue.private;
      } else if (vehicleData?.estimatedValue && typeof vehicleData.estimatedValue === 'number') {
        valuation = vehicleData.estimatedValue;
      } else if (vehicleValuation && typeof vehicleValuation === 'number') {
        valuation = vehicleValuation;
      } else if (vehicleData?.valuation?.estimatedValue?.retail && typeof vehicleData.valuation.estimatedValue.retail === 'number') {
        valuation = vehicleData.valuation.estimatedValue.retail;
      } else if (vehicleData?.price && typeof vehicleData.price === 'number') {
        // LAST RESORT: Use user-entered price only if no valuation available
        valuation = vehicleData.price;
      } else if (advertData?.price && typeof advertData.price === 'number') {
        valuation = advertData.price;
      }
      
      if (valuation && !isNaN(valuation) && valuation > 0) {
        const calculatedRange = calculatePriceRange(valuation, type === 'trade');
        if (calculatedRange) {
          console.log(`🔄 Recalculated price range for ${type}: ${calculatedRange} (valuation: £${valuation})`);
          setPriceRange(calculatedRange);
        }
      }
    } else {
      // Manual selection - reset to first option for the new seller type
      const firstOption = type === 'trade' ? 'under-1000' : 'under-1000';
      setPriceRange(firstOption);
      console.log(`🔄 Reset to first option for ${type}: ${firstOption}`);
    }
  };

  const currentPricingTiers = sellerType === 'trade' ? tradePricingTiers : privatePricingTiers;
  const currentTier = currentPricingTiers[priceRange] || currentPricingTiers['under-1000'];

  const getPackageDetails = (pkg) => ({
    ...pkg,
    priceInPence: Math.round(pkg.price * 100),
    durationDays: pkg.durationWeeks ? pkg.durationWeeks * 7 : null,
    color: pkg.id === 'bronze' ? '#CD7F32' : pkg.id === 'silver' ? '#C0C0C0' : '#FFD700',
    description: sellerType === 'trade' 
      ? `Gets your vehicle listed for up to ${pkg.durationWeeks} weeks.`
      : pkg.durationWeeks 
        ? `Our ${pkg.name} package gets your vehicle listed for up to ${pkg.durationWeeks} weeks.`
        : `Our ${pkg.name} package keeps your vehicle listing live until it sells.`,
    features: sellerType === 'trade' 
      ? [
          'Attract buyers—display your vehicle\'s best features with up to 100 photos',
          'Stand out with photos in search results',
          'Free basic HPI check'
        ]
      : [
          `Attract buyers - Display your vehicle's best features with up to 100 photos.`,
          'Stand out with photos in search results.',
          pkg.durationWeeks 
            ? `Your listing will remain active for up to ${pkg.durationWeeks} weeks or less if sold within this time.`
            : 'Your listing will remain active until you sell your vehicle or decide to remove it.'
        ],
    popular: pkg.id === 'silver'
  });

  const packages = currentTier.packages.map(getPackageDetails);


  const handleSelectPackage = async (pkg) => {
    if (!user) {
      navigate('/signin', { state: { from: locationState.pathname } });
      return;
    }

    try {
      setProcessingPackageId(pkg.id);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      let finalPrice = pkg.priceInPence;
      let vatAmount = 0;
      
      // Add VAT for trade sellers
      if (sellerType === 'trade') {
        vatAmount = Math.round(pkg.price * 0.20 * 100);
        finalPrice = pkg.priceInPence + vatAmount;
      }
      
      // Extract the actual vehicle value for backend validation
      let actualVehicleValue = null;
      
      // CRITICAL FIX: Prioritize actual valuation over user-entered price
      if (vehicleData?.allValuations?.private && typeof vehicleData.allValuations.private === 'number') {
        actualVehicleValue = vehicleData.allValuations.private;
      } else if (vehicleData?.valuation?.estimatedValue?.private && typeof vehicleData.valuation.estimatedValue.private === 'number') {
        actualVehicleValue = vehicleData.valuation.estimatedValue.private;
      } else if (vehicleData?.estimatedValue && typeof vehicleData.estimatedValue === 'number') {
        actualVehicleValue = vehicleData.estimatedValue;
      } else if (vehicleValuation && typeof vehicleValuation === 'number') {
        actualVehicleValue = vehicleValuation;
      } else if (vehicleData?.valuation?.estimatedValue?.retail && typeof vehicleData.valuation.estimatedValue.retail === 'number') {
        actualVehicleValue = vehicleData.valuation.estimatedValue.retail;
      } else if (vehicleData?.price && typeof vehicleData.price === 'number') {
        // LAST RESORT: Use user-entered price only if no valuation available
        actualVehicleValue = vehicleData.price;
      } else if (advertData?.price && typeof advertData.price === 'number') {
        actualVehicleValue = advertData.price;
      }
      
      console.log('💰 Payment request vehicle value extraction:', {
        actualVehicleValue,
        priceRange,
        'priceRange state': priceRange,
        'isPriceRangeLocked': isPriceRangeLocked,
        'vehicleData.estimatedValue': vehicleData?.estimatedValue,
        'vehicleData.estimatedValue type': typeof vehicleData?.estimatedValue,
        'vehicleData.valuation': vehicleData?.valuation,
        'vehicleValuation': vehicleValuation,
        'advertData.price': advertData?.price,
        'vehicleData.price': vehicleData?.price
      });
      
      const requestBody = {
        packageId: pkg.id,
        packageName: pkg.name,
        price: finalPrice,
        priceExVat: pkg.priceInPence,
        vatAmount: vatAmount,
        duration: pkg.duration,
        durationDays: pkg.durationDays,
        advertId: advertId || null,
        advertData: advertData || { price: null, description: null, photos: [] },
        vehicleData: vehicleData || {
          make: null, model: null, year: null,
          registrationNumber: registration || null,
          mileage: mileage || null
        },
        contactDetails: contactDetails || {
          phoneNumber: null, email: null, postcode: null, allowEmailContact: false
        },
        vehicleType: 'car',
        vehicleValue: priceRange, // Send price range string for backend validation
        actualVehicleValue: actualVehicleValue, // Send actual numeric value for reference
        sellerType: sellerType
      };
      
      console.log('📦 Payment request - Seller Type:', sellerType);
      console.log('📸 Sending payment request with', advertData?.photos?.length || 0, 'photos');
      console.log('📸 Photo URLs:', advertData?.photos?.map(p => p.url).slice(0, 3), '...');
      
      const response = await fetch(`${API_BASE_URL}/payments/create-car-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        let errorMessage = `Payment request failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          if (response.status === 404) errorMessage = 'Payment service not available.';
          else if (response.status >= 500) errorMessage = 'Server error. Please try again.';
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message.includes('Failed to fetch') 
        ? 'Unable to connect to payment service.' 
        : err.message);
      setProcessingPackageId(null);
    }
  };

  const handleCreateAd = () => {
    // Validate inputs
    const errors = {
      registration: '',
      mileage: ''
    };

    if (!registration.trim()) {
      errors.registration = 'Registration is required';
    }

    if (!mileage.trim()) {
      errors.mileage = 'Mileage is required';
    } else if (isNaN(mileage) || parseInt(mileage) <= 0) {
      errors.mileage = 'Please enter a valid mileage';
    }

    setQuickFormErrors(errors);

    // If there are errors, don't navigate
    if (errors.registration || errors.mileage) {
      return;
    }

    // Navigate with state
    navigate(`/find-your-car`, {
      state: {
        registrationNumber: registration,
        mileage: mileage
      }
    });
  };

  return (
    <div className="car-advertising-prices-page">
      <div className="container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>x</button>
          </div>
        )}
        
        <div className="page-title-section">
          <h1>Advertising prices</h1>
          {sellerType === 'trade' && <p className="subtitle">All prices shown exclude VAT</p>}
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">Vehicle type</label>
            <div className="filter-display">
              <span className="region-display">Cars</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Showing prices for</label>
            <div className="filter-display">
              <span className="region-display">Great Britain</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Seller type</label>
            <div className="seller-type-toggle" style={{ display: 'flex', gap: '0' }}>
              <button 
                type="button"
                onClick={() => handleSellerTypeChange('trade')}
                style={{ 
                  padding: '14px 40px', 
                  borderTop: sellerType === 'trade' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderBottom: sellerType === 'trade' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderLeft: sellerType === 'trade' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  background: 'white',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: sellerType === 'trade' ? '500' : '400'
                }}
              >
                Trade
              </button>
              <button 
                type="button"
                onClick={() => handleSellerTypeChange('private')}
                style={{ 
                  padding: '14px 40px', 
                  borderTop: sellerType === 'private' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderBottom: sellerType === 'private' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderLeft: sellerType === 'private' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderRight: sellerType === 'private' ? '2px solid #1a1a2e' : '1px solid #ddd',
                  borderRadius: '0 8px 8px 0',
                  background: 'white',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: sellerType === 'private' ? '500' : '400'
                }}
              >
                Private
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              How much is your car worth?
              {isPriceRangeLocked && (
                <span className="locked-indicator" title="Price range auto-selected based on your vehicle valuation">
                  🔒 Auto-selected
                </span>
              )}
            </label>
            <select 
              className="filter-select"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              disabled={isPriceRangeLocked}
              style={isPriceRangeLocked ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
            >
              {getPriceRangeOptions().map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {isPriceRangeLocked && (
              <p className="helper-text" style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                Price range is automatically selected based on your vehicle's estimated private sale value of £{(
                  vehicleData?.allValuations?.private || 
                  vehicleData?.valuation?.estimatedValue?.private || 
                  vehicleData?.estimatedValue ||
                  vehicleValuation || 
                  vehicleData?.valuation?.estimatedValue?.retail ||
                  vehicleData?.price ||
                  advertData?.price
                )?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="pricing-cards">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`pricing-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              <div className="card-header" style={{ backgroundColor: pkg.color }}>
                <h2>{sellerType === 'trade' ? pkg.name.replace('TRADE ', '') : pkg.name}</h2>
              </div>
              <div className="card-body">
                <div className="price-section">
                  <div className="price">£{pkg.price.toFixed(2)}</div>
                  {sellerType === 'trade' && <p className="vat-note">+ VAT</p>}
                  <p className="duration">{pkg.duration === 'Until sold' ? pkg.duration : `for ${pkg.duration}`}</p>
                  <p className="description">{pkg.description}</p>
                </div>
                
                <div className="features-section">
                  <h3>What's Included</h3>
                  <ul className="features-list">
                    {pkg.features.map((feature, index) => (
                      <li key={index}><span className="checkmark">✓</span>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                {!isViewOnly && (
                  <>
                    {user ? (
                      <button 
                        className="select-package-btn"
                        onClick={() => handleSelectPackage(pkg)}
                        disabled={processingPackageId !== null}
                      >
                        {processingPackageId === pkg.id ? 'Processing...' : `Choose ${sellerType === 'trade' ? pkg.name.replace('TRADE ', '') : pkg.name}`}
                      </button>
                    ) : (
                      <button 
                        className="select-package-btn login-required-btn"
                        onClick={() => navigate('/signin', { state: { returnTo: '/sell-my-car/advertising-prices' } })}
                      >
                        Sign in to Select
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>




        <div className="promotion-section">
          <h2>Why Advertise Your Car With Us?</h2>
          <div className="promotion-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <h3>Massive Audience</h3>
              <ul>
                <li>Thousands of active car buyers</li>
                <li>Daily searches for vehicles</li>
                <li>UK-wide coverage</li>
              </ul>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
              </div>
              <h3>Mobile Optimized</h3>
              <ul>
                <li>Perfect on all devices</li>
                <li>Responsive design</li>
                <li>Easy to browse</li>
              </ul>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3>{sellerType === 'trade' ? 'Free Basic HPI Check' : 'Secure Platform'}</h3>
              <ul>
                {sellerType === 'trade' ? (
                  <>
                    <li>Included with all packages</li>
                    <li>Build buyer confidence</li>
                    <li>Verified vehicle history</li>
                  </>
                ) : (
                  <>
                    <li>Safe environment</li>
                    <li>Verified listings</li>
                    <li>Buyer protection</li>
                  </>
                )}
              </ul>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M9 2l1.17 1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-6.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              </div>
              <h3>Up to 100 Photos</h3>
              <ul>
                <li>Showcase every angle</li>
                <li>High quality display</li>
                <li>Gallery view</li>
              </ul>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h3>Quick Results</h3>
              <ul>
                <li>Fast listing approval</li>
                <li>Instant visibility</li>
                <li>Quick enquiries</li>
              </ul>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#2196F3">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h3>Direct Contact</h3>
              <ul>
                <li>Buyers contact you directly</li>
                <li>No middleman fees</li>
                <li>Negotiate your price</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="newsletter-section">
          <h2>Ready to sell? Quickly create your ad</h2>
          <div className="newsletter-form">
            <div className="input-group">
              <label className="input-label">Registration</label>
              <input 
                type="text" 
                placeholder="e.g. AB12 CDE"
                className={`registration-input ${quickFormErrors.registration ? 'input-error' : ''}`}
                value={registration}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegistration(value.toUpperCase());
                  if (quickFormErrors.registration) {
                    setQuickFormErrors(prev => ({ ...prev, registration: '' }));
                  }
                }}
              />
              {quickFormErrors.registration && (
                <span className="error-message-quick">{quickFormErrors.registration}</span>
              )}
            </div>
            <div className="input-group">
              <label className="input-label">Current mileage</label>
              <input 
                type="text" 
                placeholder="e.g. 50000"
                className={`mileage-input ${quickFormErrors.mileage ? 'input-error' : ''}`}
                value={mileage}
                onChange={(e) => {
                  setMileage(e.target.value.replace(/[^0-9]/g, ''));
                  if (quickFormErrors.mileage) {
                    setQuickFormErrors(prev => ({ ...prev, mileage: '' }));
                  }
                }}
              />
              {quickFormErrors.mileage && (
                <span className="error-message-quick">{quickFormErrors.mileage}</span>
              )}
            </div>
            <button className="create-ad-btn" onClick={handleCreateAd}>
              Create your ad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarAdvertisingPricesPage;
