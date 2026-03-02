import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { lookupVanByRegistration } from '../../services/vanService';
import { v4 as uuidv4 } from 'uuid';
import '../VehicleCheckPage.css'; // Use the same styles as bike check page

const VanCheckPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vanData, setVanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const registration = searchParams.get('registration');
    const mileage = searchParams.get('mileage');

    if (!registration || !mileage) {
      setError('Missing registration or mileage');
      setLoading(false);
      return;
    }

    fetchVanData(registration, mileage);
  }, [searchParams]);

  const fetchVanData = async (registration, mileage) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching van data for:', registration, 'with mileage:', mileage);
      
      const response = await lookupVanByRegistration(registration, mileage);
      
      console.log('✅ Van data received:', response);
      
      if (response.success && response.data) {
        setVanData(response.data);
      } else {
        setError(response.error || 'Failed to fetch van details');
      }
    } catch (err) {
      console.error('❌ Error fetching van data:', err);
      setError(err.message || 'An error occurred while fetching van details');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!vanData) return;

    const advertId = uuidv4();
    
    const vanAdvertData = {
      id: advertId,
      vehicleData: vanData,
      advertData: {
        price: vanData.estimatedValue || '',
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
    
    console.log('💾 Saving van advert data to localStorage:', vanAdvertData);
    localStorage.setItem(`vanAdvert_${advertId}`, JSON.stringify(vanAdvertData));
    
    console.log('🚀 Navigating to van advert edit page');
    navigate(`/vans/selling/advert/edit/${advertId}`);
  };

  const handleCheckAnother = () => {
    navigate('/vans/sell-your-van');
  };

  if (loading) {
    return (
      <div className="vehicle-check-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching van details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-check-page">
        <div className="container">
          <div className="error-state">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={handleCheckAnother} className="btn-secondary">
              Try Another Van
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vanData) {
    return (
      <div className="vehicle-check-page">
        <div className="container">
          <div className="error-state">
            <h2>No Van Data</h2>
            <p>Unable to fetch van details</p>
            <button onClick={handleCheckAnother} className="btn-secondary">
              Try Another Van
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-check-page">
      <section className="vehicle-found-section">
        <div className="container">
          <div className="vehicle-found-card">
            <div className="found-header">
              <h2>✓ Van Found</h2>
              <p className="vrm-display">{vanData.registration}</p>
            </div>

            <div className="vehicle-details-grid">
              {/* Basic Information */}
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-items">
                  <div className="detail-item">
                    <span className="detail-label">MAKE</span>
                    <span className="detail-value">{vanData.make || 'Unknown'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">MODEL</span>
                    <span className="detail-value">{vanData.model || 'Unknown'}</span>
                  </div>

                  {vanData.variant && (
                    <div className="detail-item">
                      <span className="detail-label">VARIANT</span>
                      <span className="detail-value">{vanData.variant}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">YEAR</span>
                    <span className="detail-value">{vanData.year || 'Unknown'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">COLOUR</span>
                    <span className="detail-value">{vanData.color || 'Not specified'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">MILEAGE</span>
                    <span className="detail-value">{vanData.mileage?.toLocaleString() || '0'} miles</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="detail-section">
                <h3>Technical Specifications</h3>
                <div className="detail-items">
                  <div className="detail-item">
                    <span className="detail-label">FUEL TYPE</span>
                    <span className="detail-value">{vanData.fuelType || 'Diesel'}</span>
                  </div>

                  {vanData.engineSize && (
                    <div className="detail-item">
                      <span className="detail-label">ENGINE</span>
                      <span className="detail-value">{vanData.engineSize}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">TRANSMISSION</span>
                    <span className="detail-value">{vanData.transmission || 'Manual'}</span>
                  </div>

                  {vanData.vanType && (
                    <div className="detail-item">
                      <span className="detail-label">VAN TYPE</span>
                      <span className="detail-value">{vanData.vanType}</span>
                    </div>
                  )}

                  {vanData.payloadCapacity && (
                    <div className="detail-item">
                      <span className="detail-label">PAYLOAD</span>
                      <span className="detail-value">{vanData.payloadCapacity}kg</span>
                    </div>
                  )}

                  {vanData.estimatedValue && (
                    <div className="detail-item highlight">
                      <span className="detail-label">ESTIMATED VALUE</span>
                      <span className="detail-value">£{vanData.estimatedValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleContinue} className="btn-primary">
                Continue to Create Advert →
              </button>
              <button onClick={handleCheckAnother} className="btn-secondary">
                Check Another Van
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VanCheckPage;
