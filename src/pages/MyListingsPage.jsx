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
  
  // Modal state for viewing user's vehicles
  const [selectedUser, setSelectedUser] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  
  // Admin filters state - always declare, even if not admin
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [sortBy, setSortBy] = useState('Next Renewal Date');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'active', 'expiring', 'overdue', 'recent'
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'
  const [expandedDealers, setExpandedDealers] = useState({}); // Track which dealers are expanded
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
      
      // Check if user is admin
      const isAdmin = user?.isAdmin || user?.role === 'admin';
      
      if (isAdmin) {
        // Admin: Fetch users list
        console.log('[MyListings] Admin detected - fetching users list');
        const response = await api.get('/admin/users');
        console.log('[MyListings] Admin Response:', response.data);
        console.log('[MyListings] Sample user data:', response.data.users?.[0]);
        setListings(response.data.users || []);
        setIsAdminView(true);
      } else {
        // Normal user: Fetch their listings
        const response = await api.get('/vehicles/my-listings');
        console.log('[MyListings] Response:', response.data);
        setListings(response.data.listings || []);
        setIsAdminView(false);
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
    console.log('[MyListings] Edit clicked:', { listingId, vehicleType });
    const basePath = vehicleType === 'bike' ? '/bikes' : vehicleType === 'van' ? '/vans' : '';
    const editPath = `${basePath}/selling/advert/edit/${listingId}`;
    console.log('[MyListings] Navigating to:', editPath);
    navigate(editPath);
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

  const handleRelistVehicle = async (listingId, vehicleType = 'car') => {
    try {
      // Call relist endpoint to prepare vehicle
      const response = await api.post(`/vehicles/${listingId}/relist`);
      
      if (response.data.success) {
        const advertId = response.data.advertId || listingId;
        
        // Redirect to appropriate advertising prices page
        if (vehicleType === 'bike') {
          navigate(`/bikes/advertising-prices?advertId=${advertId}&resumePayment=true`);
        } else if (vehicleType === 'van') {
          navigate(`/vans/advertising-prices?advertId=${advertId}&resumePayment=true`);
        } else {
          navigate(`/sell-my-car/advertising-prices?advertId=${advertId}&resumePayment=true`);
        }
      }
    } catch (err) {
      console.error('Error relisting vehicle:', err);
      alert(err.response?.data?.error || 'Failed to relist vehicle');
    }
  };

  const getStatusBadge = (listing) => {
    const status = listing.advertStatus;
    const now = new Date();
    const expiryDate = listing.advertisingPackage?.expiryDate ? new Date(listing.advertisingPackage.expiryDate) : null;
    
    // If car is active but expired, treat it as draft
    const isExpired = status === 'active' && expiryDate && expiryDate < now;
    const effectiveStatus = isExpired ? 'draft' : status;
    
    console.log('[MyListings] Status Badge Debug:', {
      carId: listing._id,
      originalStatus: status,
      effectiveStatus: effectiveStatus,
      isExpired: isExpired
    });
    
    // Simple status mapping
    const statusMap = {
      active: { label: 'Active', className: 'status-active' },
      sold: { label: 'Sold', className: 'status-sold' },
      expired: { label: 'Draft', className: 'status-draft' },
      draft: { label: 'Draft', className: 'status-draft' },
      pending_payment: { label: 'Pending', className: 'status-pending' }
    };
    
    const statusInfo = statusMap[effectiveStatus] || { label: effectiveStatus, className: 'status-default' };
    const badgeClass = statusInfo.className;
    const label = statusInfo.label;
    
    console.log('[MyListings] Badge Result:', { badgeClass, label });
    
    return <span className={`status-badge ${badgeClass}`}>{label}</span>;
  };

  const isCarExpired = (listing) => {
    const status = listing.advertStatus;
    const now = new Date();
    const expiryDate = listing.advertisingPackage?.expiryDate ? new Date(listing.advertisingPackage.expiryDate) : null;
    
    // Car is expired if it's active but expiry date has passed
    return status === 'active' && expiryDate && expiryDate < now;
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

  // Admin Table View - Show Users
  if (isAdminView) {
    // Calculate stats for users
    const totalUsers = listings.length;
    const privateUsers = listings.filter(u => u.type === 'private').length;
    const tradeDealers = listings.filter(u => u.type === 'trade').length;
    const usersWithVehicles = listings.filter(u => u.totalVehicles > 0).length;

    // Filter and sort users
    let filteredUsers = listings.filter(user => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // User type filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Private' && user.type !== 'private') return false;
        if (statusFilter === 'Trade' && user.type !== 'trade') return false;
      }

      return true;
    });

    // Sort users
    filteredUsers.sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          return (a.name || '').localeCompare(b.name || '');
        case 'Vehicles':
          return b.totalVehicles - a.totalVehicles;
        case 'Recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handleViewUser = async (userId, userType) => {
      try {
        setLoadingVehicles(true);
        setShowVehiclesModal(true);
        
        // Find user details
        const user = listings.find(u => u._id === userId);
        setSelectedUser(user);
        
        console.log('[Admin] Fetching vehicles for user:', userId, 'type:', userType);
        
        // Fetch user's vehicles
        const endpoint = userType === 'trade' 
          ? `/admin/users/${userId}/vehicles?dealerId=${userId}`
          : `/admin/users/${userId}/vehicles`;
        
        console.log('[Admin] API endpoint:', endpoint);
        
        const response = await api.get(endpoint);
        console.log('[Admin] API response:', response.data);
        
        setUserVehicles(response.data.vehicles || []);
      } catch (error) {
        console.error('[Admin] Error fetching user vehicles:', error);
        console.error('[Admin] Error response:', error.response?.data);
        alert(error.response?.data?.error || 'Failed to load user vehicles');
        setShowVehiclesModal(false);
      } finally {
        setLoadingVehicles(false);
      }
    };

    const closeVehiclesModal = () => {
      setShowVehiclesModal(false);
      setSelectedUser(null);
      setUserVehicles([]);
    };

    return (
      <div className="my-listings-page admin-view">
        <div className="admin-container">
          <div className="admin-header">
            <h1>All Users</h1>
          </div>

          {/* Filters Section */}
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Name, Email, or Phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-row">
              <div className="filter-item">
                <label>User Type:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Users</option>
                  <option value="Private">Private Sellers</option>
                  <option value="Trade">Trade Dealers</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="Name">Name</option>
                  <option value="Vehicles">Total Vehicles</option>
                  <option value="Recent">Recent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-label">Total Users:</span>
              <span className="stat-value">{totalUsers}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Private Sellers:</span>
              <span className="stat-value">{privateUsers}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Trade Dealers:</span>
              <span className="stat-value">{tradeDealers}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Users with Vehicles:</span>
              <span className="stat-value">{usersWithVehicles}</span>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>User Type</th>
                  <th>Total Vehicles</th>
                  <th>Subscription/Package</th>
                  <th>Business Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    console.log('[MyListings] Rendering user:', user.name, 'Type:', user.type);
                    return (
                    <tr key={user._id}>
                      <td className="account-name">{user.name || 'Unknown'}</td>
                      <td className="email">{user.email || 'N/A'}</td>
                      <td className="phone">{user.phone || 'N/A'}</td>
                      <td className="user-type">
                        {user.type ? (
                          <span className={`type-badge ${user.type === 'trade' ? 'badge-trade' : 'badge-private'}`}>
                            {user.type === 'trade' ? 'Trade Dealer' : 'Private Seller'}
                          </span>
                        ) : (
                          <span style={{color: '#999'}}>Unknown</span>
                        )}
                      </td>
                      <td className="vehicle-count">
                        {user.totalVehicles} ({user.cars} cars, {user.bikes} bikes, {user.vans} vans)
                      </td>
                      <td className="subscription-info">
                        {user.type === 'trade' && user.subscription ? (
                          <div className="subscription-details">
                            <div className="sub-plan-badge">
                              {user.subscription.planName}
                              {user.subscription.isTrialing && <span className="trial-badge">Trial</span>}
                            </div>
                            <div className="sub-status">
                              <span className={`status-dot ${user.subscription.status}`}></span>
                              {user.subscription.status}
                            </div>
                            <div className="sub-expiry">
                              Expires: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            {user.subscription.listingsLimit && (
                              <div className="sub-usage">
                                {user.subscription.listingsUsed} / {user.subscription.listingsLimit} listings
                              </div>
                            )}
                          </div>
                        ) : user.type === 'private' ? (
                          <span style={{color: '#999', fontSize: '0.875rem'}}>Individual packages per car</span>
                        ) : (
                          <span style={{color: '#999', fontSize: '0.875rem'}}>No subscription</span>
                        )}
                      </td>
                      <td className="business-info">
                        {user.type === 'trade' ? (
                          <div className="trade-info">
                            {user.businessLogo && (
                              <img src={user.businessLogo} alt="Logo" className="business-logo-small" />
                            )}
                            {user.businessWebsite && (
                              <a href={user.businessWebsite} target="_blank" rel="noopener noreferrer" className="business-link">
                                🌐 Website
                              </a>
                            )}
                            {!user.businessLogo && !user.businessWebsite && 'N/A'}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="actions">
                        <button 
                          className="action-link view"
                          onClick={() => handleViewUser(user._id, user.type)}
                        >
                          View Vehicles
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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
              </div>
            </div>
          )}

          {/* User Vehicles Modal */}
          {showVehiclesModal && (
            <div className="modal-overlay" onClick={closeVehiclesModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-header-content">
                    <h2>{selectedUser?.name}'s Vehicles</h2>
                    {selectedUser?.type === 'trade' && selectedUser?.subscription && (
                      <div className="modal-subscription-info">
                        <div className="modal-sub-badge">
                          <span className="plan-name">{selectedUser.subscription.planName}</span>
                          {selectedUser.subscription.isTrialing && (
                            <span className="trial-badge-modal">Trial</span>
                          )}
                          <span className={`status-badge-modal ${selectedUser.subscription.status}`}>
                            {selectedUser.subscription.status}
                          </span>
                        </div>
                        <div className="modal-sub-details">
                          <span>Expires: {new Date(selectedUser.subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                          {selectedUser.subscription.listingsLimit && (
                            <span className="usage-info">
                              • {selectedUser.subscription.listingsUsed} / {selectedUser.subscription.listingsLimit} listings used
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="modal-close" onClick={closeVehiclesModal}>×</button>
                </div>
                <div className="modal-body">
                  {loadingVehicles ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading vehicles...</p>
                    </div>
                  ) : userVehicles.length === 0 ? (
                    <div className="no-vehicles">
                      <p>No vehicles found for this user</p>
                    </div>
                  ) : (
                    <div className="vehicles-grid">
                      {userVehicles.map((vehicle) => {
                        console.log('[Modal] Vehicle:', vehicle._id, 'Package:', vehicle.advertisingPackage);
                        return (
                        <div key={vehicle._id} className="vehicle-card-mini">
                          <div className="vehicle-image-mini">
                            {vehicle.images?.[0] ? (
                              <img src={vehicle.images[0]} alt={`${vehicle.make} ${vehicle.model}`} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                            <span className={`status-badge-mini ${vehicle.advertStatus}`}>
                              {vehicle.advertStatus}
                            </span>
                          </div>
                          <div className="vehicle-info-mini">
                            <h3>{vehicle.make} {vehicle.model}</h3>
                            <p className="vehicle-year">{vehicle.year} • {vehicle.registrationNumber}</p>
                            <p className="vehicle-price">£{vehicle.price?.toLocaleString()}</p>
                            
                            {/* Subscription Details */}
                            {/* For Trade Dealers - Show dealer subscription */}
                            {vehicle.dealerSubscription && (
                              <div className="subscription-info-mini">
                                <div className="package-badge">
                                  {vehicle.dealerSubscription.planName}
                                  {vehicle.dealerSubscription.isTrialing && ' (Trial)'}
                                </div>
                                {vehicle.dealerSubscription.expiryDate && (
                                  <div className="expiry-info">
                                    <span className="expiry-label">Expires:</span>
                                    <span className="expiry-date">
                                      {new Date(vehicle.dealerSubscription.expiryDate).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* For Private Sellers - Show individual car package */}
                            {!vehicle.dealerSubscription && vehicle.advertisingPackage && vehicle.advertisingPackage.packageName && (
                              <div className="subscription-info-mini">
                                <div className="package-badge">
                                  {vehicle.advertisingPackage.packageName}
                                </div>
                                {vehicle.advertisingPackage.expiryDate && (
                                  <div className="expiry-info">
                                    <span className="expiry-label">Expires:</span>
                                    <span className="expiry-date">
                                      {new Date(vehicle.advertisingPackage.expiryDate).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="vehicle-actions-mini">
                              <button 
                                className="btn-view-mini"
                                onClick={() => handleViewListing(vehicle._id, vehicle.vehicleType || 'car')}
                              >
                                👁️ View
                              </button>
                              <button 
                                className="btn-edit-mini"
                                onClick={() => handleEditListing(vehicle._id, vehicle.vehicleType || 'car')}
                              >
                                ✏️ Edit
                              </button>
                              {vehicle.advertStatus === 'active' && (
                                <button 
                                  className="btn-sold-mini"
                                  onClick={() => handleMarkAsSold(vehicle._id)}
                                >
                                  ✓ Sold
                                </button>
                              )}
                              {(vehicle.advertStatus === 'draft' || vehicle.advertStatus === 'expired') && (
                                <button 
                                  className="btn-relist-mini"
                                  onClick={() => handleRelistVehicle(vehicle._id, vehicle.vehicleType || 'car')}
                                >
                                  🔄 Relist
                                </button>
                              )}
                              <button 
                                className="btn-delete-mini"
                                onClick={() => handleDeleteListing(vehicle._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                  {getStatusBadge(listing)}
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
                    {listing.advertStatus === 'active' && !isCarExpired(listing) && (
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
                    {(listing.advertStatus === 'draft' || listing.advertStatus === 'expired' || isCarExpired(listing)) && (
                      <>
                        <button 
                          onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                          className="btn-view"
                          title="View listing"
                        >
                          👁️ View
                        </button>
                        <button 
                          onClick={() => handleRelistVehicle(listing._id, listing.vehicleType)}
                          className="btn-relist"
                          title="Relist this vehicle"
                        >
                          🔄 Relist
                        </button>
                        <button 
                          onClick={() => handleEditListing(listing._id, listing.vehicleType)}
                          className="btn-edit"
                        >
                          ✏️ Edit
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
                          className="btn-relist"
                          title="Relist this vehicle with a new package"
                        >
                          🔄 Relist
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
                    {(listing.advertStatus === 'sold' || listing.advertStatus === 'expired') && !isCarExpired(listing) && (
                      <>
                        <button 
                          onClick={() => handleViewListing(listing._id, listing.vehicleType)}
                          className="btn-view"
                          title="View listing"
                        >
                          👁️ View
                        </button>
                        {listing.advertStatus === 'expired' && (
                          <button 
                            onClick={() => handleRelistVehicle(listing._id, listing.vehicleType)}
                            className="btn-relist"
                            title="Relist this vehicle"
                          >
                            🔄 Relist
                          </button>
                        )}
                      </>
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
