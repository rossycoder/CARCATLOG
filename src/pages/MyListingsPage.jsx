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
  
  // Admin filters state - always declare, even if not admin
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [sortBy, setSortBy] = useState('Next Renewal Date');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'active', 'expiring', 'overdue', 'recent'
  const itemsPerPage = 6;

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

  const getStatusBadge = (listing) => {
    const status = listing.advertStatus;
    const now = new Date();
    const expiryDate = listing.advertisingPackage?.expiryDate ? new Date(listing.advertisingPackage.expiryDate) : null;
    
    // Check if overdue (expired but still active)
    const isOverdue = status === 'active' && expiryDate && expiryDate < now;
    
    // Check if expiring soon (within 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isExpiringSoon = status === 'active' && expiryDate && expiryDate > now && expiryDate <= sevenDaysFromNow;
    
    // Determine badge class and label
    let badgeClass = '';
    let label = '';
    
    if (isOverdue) {
      badgeClass = 'status-overdue';
      label = 'Overdue';
    } else if (isExpiringSoon) {
      badgeClass = 'status-expiring';
      label = 'Expiring Soon';
    } else {
      // Default status mapping
      const statusMap = {
        active: { label: 'Active', className: 'status-active' },
        sold: { label: 'Sold', className: 'status-sold' },
        expired: { label: 'Expired', className: 'status-expired' },
        draft: { label: 'Draft', className: 'status-draft' },
        pending_payment: { label: 'Pending Payment', className: 'status-pending' }
      };
      const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
      badgeClass = statusInfo.className;
      label = statusInfo.label;
    }
    
    return <span className={`status-badge ${badgeClass}`}>{label}</span>;
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

  // Admin Table View
  if (isAdminView) {
    // Calculate stats
    const activeCount = listings.filter(l => l.advertStatus === 'active').length;
    const expiringSoon = listings.filter(l => {
      if (l.advertStatus !== 'active' || !l.advertisingPackage?.expiryDate) return false;
      const expiryDate = new Date(l.advertisingPackage.expiryDate);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
    const overdue = listings.filter(l => {
      if (!l.advertisingPackage?.expiryDate) return false;
      return new Date(l.advertisingPackage.expiryDate) < new Date() && l.advertStatus === 'active';
    }).length;
    const recentSignUps = listings.filter(l => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(l.createdAt) >= sevenDaysAgo;
    }).length;

    // Filter and sort listings
    let filteredListings = listings.filter(listing => {
      const now = new Date();
      const expiryDate = listing.advertisingPackage?.expiryDate ? new Date(listing.advertisingPackage.expiryDate) : null;
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Quick filter (from stat cards)
      if (quickFilter === 'active') {
        if (listing.advertStatus !== 'active') return false;
      } else if (quickFilter === 'expiring') {
        // Show only listings expiring within 30 days
        if (listing.advertStatus !== 'active' || !expiryDate) return false;
        if (expiryDate <= now || expiryDate > thirtyDaysFromNow) return false;
      } else if (quickFilter === 'overdue') {
        // Show only overdue listings
        if (listing.advertStatus !== 'active' || !expiryDate) return false;
        if (expiryDate >= now) return false;
      } else if (quickFilter === 'recent') {
        // Show only recent sign-ups (last 7 days)
        const createdDate = new Date(listing.createdAt);
        if (createdDate < sevenDaysAgo) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          listing.ownerName?.toLowerCase().includes(query) ||
          listing.ownerEmail?.toLowerCase().includes(query) ||
          listing.vin?.toLowerCase().includes(query) ||
          listing.registrationNumber?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        const statusMap = {
          'Active': 'active',
          'Expired': 'expired',
          'Sold': 'sold',
          'Pending': 'pending_payment'
        };
        if (listing.advertStatus !== statusMap[statusFilter]) return false;
      }

      // Plan filter
      if (planFilter !== 'All Plans') {
        const packageName = listing.advertisingPackage?.packageName?.toLowerCase() || '';
        const filterValue = planFilter.toLowerCase();
        if (!packageName.includes(filterValue)) {
          return false;
        }
      }

      return true;
    });

    // Sort listings
    filteredListings.sort((a, b) => {
      switch (sortBy) {
        case 'Next Renewal Date':
          const dateA = a.advertisingPackage?.expiryDate ? new Date(a.advertisingPackage.expiryDate) : new Date(0);
          const dateB = b.advertisingPackage?.expiryDate ? new Date(b.advertisingPackage.expiryDate) : new Date(0);
          return dateA - dateB;
        case 'Name':
          return (a.ownerName || '').localeCompare(b.ownerName || '');
        case 'Recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    // Pagination
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="my-listings-page admin-view">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Live Subscription Accounts</h1>
          </div>

          {/* Filters Section */}
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Name, Email, or VIN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-row">
              <div className="filter-item">
                <label>Subscription Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Sold">Sold</option>
                  <option value="Pending">Pending</option>
                  <option value="All">All</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Plan Type:</label>
                <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                  <option value="All Plans">All Plans</option>
                  <optgroup label="Private Seller Plans">
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </optgroup>
                  <optgroup label="Trade Dealer Plans">
                    <option value="TRADE BRONZE">TRADE BRONZE</option>
                    <option value="TRADE SILVER">TRADE SILVER</option>
                    <option value="TRADE GOLD">TRADE GOLD</option>
                  </optgroup>
                </select>
              </div>

              <div className="filter-item">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="Next Renewal Date">Next Renewal Date</option>
                  <option value="Name">Name</option>
                  <option value="Recent">Recent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats">
            <div 
              className={`stat-card ${quickFilter === 'active' ? 'active-filter' : ''}`}
              onClick={() => {
                setQuickFilter(quickFilter === 'active' ? 'all' : 'active');
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to filter active accounts"
            >
              <span className="stat-label">Total Active Accounts:</span>
              <span className="stat-value">{activeCount}</span>
            </div>
            <div 
              className={`stat-card expiring ${quickFilter === 'expiring' ? 'active-filter' : ''}`}
              onClick={() => {
                setQuickFilter(quickFilter === 'expiring' ? 'all' : 'expiring');
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to filter expiring soon"
            >
              <span className="stat-label">Expiring Soon:</span>
              <span className="stat-value">{expiringSoon}</span>
            </div>
            <div 
              className={`stat-card overdue ${quickFilter === 'overdue' ? 'active-filter' : ''}`}
              onClick={() => {
                setQuickFilter(quickFilter === 'overdue' ? 'all' : 'overdue');
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to filter overdue"
            >
              <span className="stat-label">Overdue:</span>
              <span className="stat-value">{overdue}</span>
            </div>
            <div 
              className={`stat-card recent ${quickFilter === 'recent' ? 'active-filter' : ''}`}
              onClick={() => {
                setQuickFilter(quickFilter === 'recent' ? 'all' : 'recent');
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to filter recent sign-ups"
            >
              <span className="stat-label">Recent Sign-Ups:</span>
              <span className="stat-value">{recentSignUps}</span>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Email</th>
                  <th>Vehicle VIN</th>
                  <th>Plan Type</th>
                  <th>Next Renewal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedListings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No listings found
                    </td>
                  </tr>
                ) : (
                  paginatedListings.map((listing) => (
                    <tr key={listing._id}>
                      <td className="account-name">{listing.ownerName || 'Unknown'}</td>
                      <td className="email">{listing.ownerEmail || 'N/A'}</td>
                      <td className="vin">{listing.vin || listing.registrationNumber || 'N/A'}</td>
                      <td className="plan-type">{listing.advertisingPackage?.packageName || 'N/A'}</td>
                      <td className="renewal-date">
                        {listing.advertisingPackage?.expiryDate 
                          ? new Date(listing.advertisingPackage.expiryDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : 'N/A'}
                      </td>
                      <td className="status">
                        {getStatusBadge(listing)}
                      </td>
                      <td className="actions">
                        <button 
                          className="action-link view"
                          onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                        >
                          View
                        </button>
                        <span className="separator">|</span>
                        <button 
                          className="action-link manage"
                          onClick={() => handleEditListing(listing._id, listing.vehicleType)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length} entries
              </div>
              <div className="pagination-controls">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={currentPage === pageNum ? 'active' : ''}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span>...</span>}
                {totalPages > 5 && (
                  <button onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </button>
                )}
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular User View
  return (
    <div className="my-listings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Listings</h1>
          <p className="listings-count">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
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
                    {listing.color && (
                      <>
                        <span>•</span>
                        <span>{listing.color}</span>
                      </>
                    )}
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
                    {listing.advertStatus === 'pending_payment' && (
                      <>
                        <button 
                          onClick={() => {
                            // Redirect to appropriate advertising prices page based on vehicle type
                            const vehicleType = listing.vehicleType || 'car';
                            const advertId = listing.advertId || listing._id;
                            
                            if (vehicleType === 'bike') {
                              navigate(`/bikes/advertising-prices?advertId=${advertId}&resumePayment=true`);
                            } else if (vehicleType === 'van') {
                              navigate(`/vans/advertising-prices?advertId=${advertId}&resumePayment=true`);
                            } else {
                              navigate(`/sell-my-car/advertising-prices?advertId=${advertId}&resumePayment=true`);
                            }
                          }}
                          className="btn-payment"
                          title="Complete payment to activate listing"
                        >
                          💳 Complete Payment
                        </button>
                        <button 
                          onClick={() => handleEditListing(listing._id, listing.vehicleType)}
                          className="btn-edit"
                          title="Edit listing before payment"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                          className="btn-view"
                          title="Preview listing"
                        >
                          👁️ Preview
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
