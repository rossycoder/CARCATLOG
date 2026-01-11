import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './SellYourBikePage.css';

// Utility component for the "How to sell" steps
const StepCard = ({ icon, title, description }) => (
  <div className="step-card">
    <div className="step-icon-wrapper">
      <div className="step-icon-emoji">{icon}</div>
    </div>
    <h4 className="step-title">{title}</h4>
    <p className="step-description">{description}</p>
  </div>
);

// Utility component for guide cards
const GuideCard = ({ icon, title, description }) => (
  <div className="guide-card">
    <div className="guide-icon-wrapper">
      <div className="guide-icon-emoji">{icon}</div>
    </div>
    <h4 className="guide-card-title">{title}</h4>
    <p className="guide-card-description">{description}</p>
  </div>
);

const SellYourBikePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get passed state from navigation (from advertising prices page)
  const passedRegistration = location.state?.registrationNumber || '';
  const passedMileage = location.state?.mileage || '';
  
  const [registration, setRegistration] = useState(passedRegistration);
  const [mileage, setMileage] = useState(passedMileage);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Update form when passed state changes
  useEffect(() => {
    if (passedRegistration) setRegistration(passedRegistration);
    if (passedMileage) setMileage(passedMileage);
  }, [passedRegistration, passedMileage]);

  // Validation functions
  const validateRegistration = (value) => {
    if (!value.trim()) {
      return 'Registration number is required';
    }
    const ukRegPattern = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}[A-Z]{3}$|^[A-Z]{3}[0-9]{1,3}[A-Z]$|^[0-9]{1,4}[A-Z]{1,2}$|^[0-9]{1,3}[A-Z]{1,3}$|^[A-Z]{1,2}[0-9]{1,4}$|^[A-Z]{1,3}[0-9]{1,3}$/i;
    if (!ukRegPattern.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid UK registration number';
    }
    return '';
  };

  const validateMileage = (value) => {
    if (!value.trim()) {
      return 'Mileage is required';
    }
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid mileage';
    }
    return '';
  };

  // Generate mock bike data
  const generateMockBikeData = (reg, miles) => {
    const yearMatch = reg.match(/[A-Z]{2}(\d{2})/i);
    let year = 2020;
    if (yearMatch) {
      const regYear = parseInt(yearMatch[1]);
      year = regYear >= 50 ? 1950 + regYear : 2000 + regYear;
    }
    
    const makes = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Triumph', 'Harley-Davidson'];
    const models = {
      'Honda': ['CBR600RR', 'CB500F', 'Africa Twin', 'Gold Wing', 'Rebel 500'],
      'Yamaha': ['YZF-R1', 'MT-07', 'Tracer 900', 'XSR700', 'Tenere 700'],
      'Kawasaki': ['Ninja ZX-6R', 'Z900', 'Versys 650', 'Vulcan S', 'Z650'],
      'Suzuki': ['GSX-R750', 'SV650', 'V-Strom 650', 'Hayabusa', 'GSX-S1000'],
      'BMW': ['S1000RR', 'R1250GS', 'F900R', 'R nineT', 'G310R'],
      'Ducati': ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Diavel'],
      'Triumph': ['Street Triple', 'Tiger 900', 'Bonneville', 'Speed Triple', 'Trident 660'],
      'Harley-Davidson': ['Street Glide', 'Iron 883', 'Fat Boy', 'Road King', 'Sportster S']
    };
    
    const randomMake = makes[Math.floor(Math.random() * makes.length)];
    const makeModels = models[randomMake];
    const randomModel = makeModels[Math.floor(Math.random() * makeModels.length)];
    
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Orange', 'Silver'];
    const bikeTypes = ['Sport', 'Naked', 'Adventure', 'Cruiser', 'Touring', 'Scrambler'];
    
    const baseValue = 8000;
    const yearDepreciation = (2024 - year) * 500;
    const mileageDepreciation = Math.floor(parseInt(miles) / 5000) * 300;
    const estimatedValue = Math.max(baseValue - yearDepreciation - mileageDepreciation, 1500);
    
    return {
      registration: reg.toUpperCase(),
      mileage: miles,
      make: randomMake,
      model: randomModel,
      year: year.toString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      fuelType: 'Petrol',
      engineSize: ['125cc', '300cc', '500cc', '650cc', '750cc', '900cc', '1000cc', '1200cc'][Math.floor(Math.random() * 8)],
      bikeType: bikeTypes[Math.floor(Math.random() * bikeTypes.length)],
      previousOwners: Math.floor(Math.random() * 4 + 1).toString(),
      motDue: `${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}/${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}/2026`,
      taxDue: '01/04/2025',
      estimatedValue: estimatedValue
    };
  };

  const handleSellMyBike = async () => {
    const regError = validateRegistration(registration);
    const mileageError = validateMileage(mileage);
    
    setErrors({
      registration: regError,
      mileage: mileageError
    });
    
    if (regError || mileageError) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const vehicleData = generateMockBikeData(registration, mileage);
      const advertId = uuidv4();
      
      const bikeAdvertData = {
        id: advertId,
        vehicleData: vehicleData,
        advertData: {
          price: '',
          description: '',
          photos: [],
          contactPhone: '',
          contactEmail: '',
          location: ''
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`bikeAdvert_${advertId}`, JSON.stringify(bikeAdvertData));
      navigate(`/bikes/selling/advert/edit/${advertId}`);
    } catch (error) {
      console.error('Error creating bike advert:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sellSteps = [
    { 
      icon: "📸", 
      title: "Take high quality photos", 
      description: "Use clear, high-quality images to show the bike accurately. This helps buyers understand the vehicle's condition." 
    },
    { 
      icon: "📝", 
      title: "Have documents ready", 
      description: "Make sure you have all required paperwork ready before listing your bike. Having the correct documents helps the sale go smoothly and avoids delays or complications." 
    },
    { 
      icon: "✅", 
      title: "Honesty is key", 
      description: "Ensure your vehicle description is accurate and complete. Clearly mention any faults, such as scratches or wear, so buyers know exactly what to expect before purchasing." 
    },
  ]
  const guides = [
    {
      icon: "🏍️",
      title: "Preparing your bike",
      description: "Thoroughly clean your bike inside and out before listing it to create a strong first impression."
    },
    {
      icon: "📝",
      title: "Your advert",
      description: "A well-written, high-quality advert attracts more buyers and helps your bike sell faster."
    },
    {
      icon: "💳",
      title: "Your payment",
      description: "An instant bank transfer is the safest payment method. Make sure the funds have fully cleared before handing over your bike."
    },
    {
      icon: "🛡️",
      title: "Watch for  Scams",
      description: "Stay alert and check online for the most common scams to protect yourself during the selling process."
    }
  ];

  return (
    <div className="sell-your-bike-page">
      {/* Section 1: Hero Banner and CTAs */}
      <section className="hero-section">
        <div className="hero-section-background">
          <div className="hero-content">
            <div className="hero-header">
              <p className="hero-label">Sell your bike</p>
              <h1 className="hero-title">
                Reach thousands of bike buyers
              </h1>
              <p className="hero-subtitle">
              Get the best price for you motorcycle. List on the UK's newest platform for a price cheaper than other current sites,
              </p>
            </div>
            
            {/* Bike Registration Form */}
            <div className="bike-form-wrapper">
              <div className="bike-form-container">
                <h2 className="form-title">Enter your bike details</h2>
                
                <div className="form-fields">
                  <div className="form-field">
                    <label htmlFor="registration" className="form-label">
                      Registration number<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="registration"
                      className={`form-input ${errors.registration ? 'error' : ''}`}
                      value={registration}
                      onChange={(e) => {
                        setRegistration(e.target.value.toUpperCase());
                        if (errors.registration) {
                          setErrors(prev => ({ ...prev, registration: '' }));
                        }
                      }}
                      placeholder="e.g. AB12 CDE"
                    />
                    {errors.registration && (
                      <span className="error-message">{errors.registration}</span>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="mileage" className="form-label">
                      Current mileage<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="mileage"
                      className={`form-input ${errors.mileage ? 'error' : ''}`}
                      value={mileage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setMileage(value);
                        if (errors.mileage) {
                          setErrors(prev => ({ ...prev, mileage: '' }));
                        }
                      }}
                      placeholder="e.g. 15000"
                    />
                    {errors.mileage && (
                      <span className="error-message">{errors.mileage}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  className="sell-bike-button"
                  onClick={handleSellMyBike}
                  disabled={isLoading}
                >
                  {isLoading ? 'Finding your bike...' : 'Sell My Bike'}
                </button>
                
                <a href="/bikes/advertising-prices" className="advertising-link">
                  View Bike Advertising Packages →
                </a>
              </div>
          </div>
        </div>
        </div>
      </section>

      {/* Section 2: Advertising Card */}
      <section className="advertising-card-section">
        <div className="advertising-card-container">
          <h2 className="advertising-section-title">Place an advert on CarCatALog</h2>
          <div className="advertising-card-with-image">
            <div className="advertising-card-image">
              <img 
                src="/images/brands/bikes.png" 
                alt="Place an advert on CarCatALog" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Tips to selling your bike */}
      <section className="steps-section">
        <div className="steps-container">
          <h2 className="section-title">
            Tips to sell you bike,quickly 
          </h2>
          <div className="steps-grid">
            {sellSteps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Guides to selling your bike */}
      <section className="guides-cards-section">
        <div className="guides-cards-container">
          <h2 className="section-title">
            Tips to sell you  bike,quickly 
          </h2>
          <div className="guides-cards-grid">
            {guides.map((guide, index) => (
              <GuideCard key={index} {...guide} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellYourBikePage;
