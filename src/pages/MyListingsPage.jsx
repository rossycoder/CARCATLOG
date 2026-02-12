import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MyListingsPage.css';

function MyListingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // Redirect if not authenticated
    if (!user) {
      navigate('/signin', { state: { from: '/my-listings' } });
      return;
    }
    
    // Fetch listings
    fetchMyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[MyListings] Fetching listings for user:', user);
      const response = await api.get('/vehicles/my-listings');
      console.log('[MyListings] Response:', response.data);
      setListings(response.data.listings || []);
      setIsAdminView(response.data.isAdmin || false);
      
      if (response.data.isAdmin) {
        console.log('[MyListings] Admin view: Showing all listings from all users');
      }
    } catch (err) {
      console.error('[MyListings] Error fetching listings:', err);
      console.error('[MyListings] Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Please sign in to view your listings');
        navigate('/signin', { state: { from: '/my-listings' } });
      } else {
        setError(err.response?.data?.error || 'Failed to load your listings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = (listingId, vehicleType = 'car') => {
    const basePath = vehicleType === 'bike' ? '/bikes' : vehicleType === 'van' ? '/vans' : '';
    navigate(`${basePath}/selling/advert/edit/${listingId}`);
  };

  const handleViewListing = (listingId, vehicleType = 'car') => {
    // Navigate to public car detail page with return state
    if (vehicleType === 'bike') {
      navigate(`/bikes/${listingId}`, { state: { from: '/my-listings' } });
    } else if (vehicleType === 'van') {
      navigate(`/vans/${listingId}`, { state: { from: '/my-listings' } });
    } else {
      navigate(`/cars/${listingId}`, { state: { from: '/my-listings' } });
    }
  };

  const handleMarkAsSold = async (listingId) => {
    if (!window.confirm('Mark this vehicle as sold?')) return;

    try {
      await api.patch(`/vehicles/${listingId}/status`, { advertStatus: 'sold' });
      fetchMyListings();
    } catch (err) {
      console.error('Error marking as sold:', err);
      alert('Failed to mark as sold');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;

    try {
      await api.delete(`/vehicles/${listingId}`);
      fetchMyListings();
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Active', className: 'status-active' },
      sold: { label: 'Sold', className: 'status-sold' },
      expired: { label: 'Expired', className: 'status-expired' },
      draft: { label: 'Draft', className: 'status-draft' },
      pending_payment: { label: 'Pending Payment', className: 'status-pending' }
    };
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="my-listings-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your listings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-listings-page">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={fetchMyListings} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="container">
        <div className="page-header">
          <h1>{isAdminView ? '🔐 Admin: All Listings' : 'My Listings'}</h1>
          <p className="listings-count">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
            {isAdminView && ' (from all users)'}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="no-listings-state">
            <div className="empty-icon">🚗</div>
            <h2>No listings yet</h2>
            <p>Start selling your vehicle today</p>
            <div className="sell-buttons">
              <button onClick={() => navigate('/sell-your-car')} className="btn-primary">
                Sell Your Car
              </button>
              <button onClick={() => navigate('/bikes/sell-your-bike')} className="btn-secondary">
                Sell Your Bike
              </button>
              <button onClick={() => navigate('/vans/sell-your-van')} className="btn-secondary">
                Sell Your Van
              </button>
            </div>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing._id} className="listing-card">
                <div className="listing-image">
                  <img 
                    src={listing.images?.[0] || '/images/dummy/placeholder-car.jpg'} 
                    alt={`${listing.make} ${listing.model}`}
                  />
                  {getStatusBadge(listing.advertStatus)}
                </div>

                <div className="listing-details">
                  <h3 className="listing-title">
                    {listing.make} {listing.model}
                  </h3>
                  <p className="listing-subtitle">
                    {listing.year} • {listing.registrationNumber || 'N/A'}
                  </p>

                  {isAdminView && listing.ownerEmail && (
                    <div className="listing-owner">
                      <span className="owner-badge">
                        👤 {listing.ownerName || listing.ownerEmail}
                      </span>
                    </div>
                  )}

                  <div className="listing-specs">
                    <span>{listing.mileage?.toLocaleString() || '0'} miles</span>
                    <span>•</span>
                    <span>{listing.transmission || 'Manual'}</span>
                    <span>•</span>
                    <span>{listing.fuelType || 'Petrol'}</span>
                  </div>

                  <div className="listing-price">
                    £{listing.price?.toLocaleString() || '0'}
                  </div>

                  {listing.advertisingPackage && (
                    <div className="listing-package">
                      <span className="package-badge">
                        {listing.advertisingPackage.packageName || listing.advertisingPackage.packageId}
                      </span>
                      {listing.advertisingPackage.expiryDate && (
                        <span className="expiry-date">
                          Expires: {new Date(listing.advertisingPackage.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="listing-stats">
                    <span>👁️ {listing.viewCount || 0} views</span>
                    <span>📅 Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="listing-actions">
                    {listing.advertStatus === 'active' && (
                      <>
                        <button 
                          onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                          className="btn-view"
                          title="View as public"
                        >
                          👁️ View
                        </button>
                        <button 
                          onClick={() => handleEditListing(listing._id, listing.vehicleType)}
                          className="btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleMarkAsSold(listing._id)}
                          className="btn-sold"
                        >
                          ✓ Mark as Sold
                        </button>
                      </>
                    )}
                    {listing.advertStatus === 'draft' && (
                      <>
                        <button 
                          onClick={() => handleEditListing(listing._id, listing.vehicleType)}
                          className="btn-edit"
                        >
                          Continue Editing
                        </button>
                      </>
                    )}
                    {(listing.advertStatus === 'sold' || listing.advertStatus === 'expired') && (
                      <button 
                        onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                        className="btn-view"
                        title="View listing"
                      >
                        👁️ View
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteListing(listing._id)}
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListingsPage;
