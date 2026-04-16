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
  const [adminViewMode, setAdminViewMode] = useState('cars'); // 'cars' or 'users'
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
  }, [user, authLoading, adminViewMode]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[MyListings] Fetching listings for user:', user);
      
      // Check if user is admin
      const isAdmin = user?.isAdmin || user?.role === 'admin';
      
      if (isAdmin) {
        // Admin: Fetch based on view mode
        if (adminViewMode === 'cars') {
          console.log('[MyListings] Admin detected - fetching all listings');
          const response = await api.get('/admin/listings', {
            params: {
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }
          });
          console.log('[MyListings] Admin Response:', response.data);
          console.log('[MyListings] Sample listing data:', response.data.listings?.[0]);
          setListings(response.data.listings || []);
        } else {
          console.log('[MyListings] Admin detected - fetching users list');
          const response = await api.get('/admin/users');
          console.log('[MyListings] Admin Response:', response.data);
          console.log('[MyListings] Sample user data:', response.data.users?.[0]);
          setListings(response.data.users || []);
        }
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

  // Admin View - Toggle between Cars and Users
  if (isAdminView) {
    // Render based on adminViewMode
    if (adminViewMode === 'cars') {
      // CARS VIEW
      const totalListings = listings.length;
      const activeListings = listings.filter(l => l.advertStatus === 'active').length;

      // Filter and sort listings
      let filteredListings = listings.filter(listing => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            listing.ownerName?.toLowerCase().includes(query) ||
            listing.ownerEmail?.toLowerCase().includes(query) ||
            listing.make?.toLowerCase().includes(query) ||
            listing.model?.toLowerCase().includes(query) ||
            listing.registrationNumber?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'All') {
          const statusMap = {
            'Active': 'active',
            'Expired': 'expired',
            'Sold': 'sold',
            'Draft': 'draft',
            'Pending': 'pending_payment'
          };
          if (listing.advertStatus !== statusMap[statusFilter]) return false;
        }

        // Plan Type filter
        if (planFilter !== 'All Plans') {
          const packageName = listing.advertisingPackage?.packageName?.toLowerCase() || '';
          if (planFilter === 'Bronze' && !packageName.includes('bronze')) return false;
          if (planFilter === 'Silver' && !packageName.includes('silver')) return false;
          if (planFilter === 'Gold' && !packageName.includes('gold')) return false;
        }

        return true;
      });

      // Sort listings
      filteredListings.sort((a, b) => {
        switch (sortBy) {
          case 'Name':
            return (a.ownerName || '').localeCompare(b.ownerName || '');
          case 'Vehicles':
            return (`${a.make} ${a.model}`).localeCompare(`${b.make} ${b.model}`);
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
              <h1>All Listings</h1>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${adminViewMode === 'cars' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('cars')}
                >
                  🚗 Cars View
                </button>
                <button 
                  className={`toggle-btn ${adminViewMode === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('users')}
                >
                  👥 Users View
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="admin-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by Name, Email, Vehicle, or Reg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>

              <div className="filter-row">
                <div className="filter-item">
                  <label>Status:</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                
                <div className="filter-item">
                  <label>Plan Type:</label>
                  <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                    <option value="All Plans">All Plans</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
                
                <div className="filter-item">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="Recent">Recent</option>
                    <option value="Name">Owner Name</option>
                    <option value="Vehicles">Vehicle</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
              <div className="stat-card">
                <span className="stat-label">Total Listings:</span>
                <span className="stat-value">{totalListings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Listings:</span>
                <span className="stat-value">{activeListings}</span>
              </div>
            </div>

            {/* Listings Grid */}
            {paginatedListings.length === 0 ? (
              <div className="no-listings-state">
                <div className="empty-icon">🚗</div>
                <h2>No listings found</h2>
              </div>
            ) : (
              <div className="listings-grid">
                {paginatedListings.map((listing) => (
                  <div key={listing._id} className="listing-card">
                    <div className="listing-image">
                      <img
                        src={listing.images?.[0] || '/images/dummy/placeholder-car.jpg'}
                        alt={`${listing.make} ${listing.model}`}
                      />
                      {getStatusBadge(listing)}
                    </div>
                    <div className="listing-details">
                      <h3 className="listing-title">{listing.make} {listing.model}</h3>
                      <p className="listing-subtitle">{listing.year} • {listing.registrationNumber || 'N/A'}</p>
                      <div className="listing-owner">
                        <span className="owner-badge">👤 {listing.ownerName || listing.ownerEmail || 'Unknown'}</span>
                      </div>
                      <div className="listing-specs">
                        <span>{listing.mileage?.toLocaleString() || '0'} miles</span>
                        <span>•</span>
                        <span>{listing.transmission || 'Manual'}</span>
                        <span>•</span>
                        <span>{listing.fuelType || 'Petrol'}</span>
                      </div>
                      <div className="listing-price">£{listing.price?.toLocaleString() || '0'}</div>
                      {listing.advertisingPackage && (listing.advertisingPackage.packageName || listing.advertisingPackage.packageId) && (
                        <div className="listing-package">
                          <span className="package-badge">
                            {listing.advertisingPackage.packageName?.replace(/^TRADE\s+/i, '') ||
                              (listing.advertisingPackage.packageId ?
                                listing.advertisingPackage.packageId.charAt(0).toUpperCase() + listing.advertisingPackage.packageId.slice(1)
                                : 'Package')}
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
                            <button className="btn-view" onClick={() => handleViewListing(listing._id, listing.vehicleType)}>👁️ View</button>
                            <button className="btn-edit" onClick={() => handleEditListing(listing._id, listing.vehicleType)}>✏️ Edit</button>
                            <button className="btn-sold" onClick={() => handleMarkAsSold(listing._id)}>✓ Mark as Sold</button>
                          </>
                        )}
                        {(listing.advertStatus === 'draft' || listing.advertStatus === 'expired' || isCarExpired(listing)) && (
                          <>
                            <button className="btn-view" onClick={() => handleViewListing(listing._id, listing.vehicleType)}>👁️ View</button>
                            <button className="btn-relist" onClick={() => handleRelistVehicle(listing._id, listing.vehicleType)}>🔄 Relist</button>
                            <button className="btn-edit" onClick={() => handleEditListing(listing._id, listing.vehicleType)}>✏️ Edit</button>
                          </>
                        )}
                        {listing.advertStatus === 'pending_payment' && (
                          <>
                            <button className="btn-view" onClick={() => handleViewListing(listing._id, listing.vehicleType)}>👁️ Preview</button>
                            <button className="btn-edit" onClick={() => handleEditListing(listing._id, listing.vehicleType)}>✏️ Edit</button>
                          </>
                        )}
                        {listing.advertStatus === 'sold' && !isCarExpired(listing) && (
                          <button className="btn-view" onClick={() => handleViewListing(listing._id, listing.vehicleType)}>👁️ View</button>
                        )}
                        <button className="btn-delete" onClick={() => handleDeleteListing(listing._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // USERS VIEW (existing code)
      const totalUsers = listings.length;
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

        // Subscription Status filter
        if (statusFilter !== 'All') {
          if (user.type === 'trade' && user.subscription) {
            const subStatus = user.subscription.status;
            if (statusFilter === 'Active' && subStatus !== 'active') return false;
            if (statusFilter === 'Trialing' && user.subscription.isTrialing !== true) return false;
            if (statusFilter === 'Expired' && subStatus !== 'expired') return false;
            if (statusFilter === 'Canceled' && subStatus !== 'canceled') return false;
          } else {
            return false;
          }
        }

        // Plan Type filter
        if (planFilter !== 'All Plans') {
          if (planFilter === 'PAYG') {
            if (user.type !== 'private') return false;
          } else if (user.type === 'trade' && user.subscription) {
            const planName = user.subscription.planName?.toLowerCase() || '';
            if (planFilter === 'Bronze' && !planName.includes('bronze')) return false;
            if (planFilter === 'Silver' && !planName.includes('silver')) return false;
            if (planFilter === 'Gold' && !planName.includes('gold')) return false;
          } else {
            return false;
          }
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
            const vehicleDateA = a.mostRecentVehicleDate ? new Date(a.mostRecentVehicleDate) : new Date(a.createdAt || 0);
            const vehicleDateB = b.mostRecentVehicleDate ? new Date(b.mostRecentVehicleDate) : new Date(b.createdAt || 0);
            return vehicleDateB - vehicleDateA;
          default:
            return 0;
        }
      });

      // Pagination
      const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

      return (
        <div className="my-listings-page admin-view">
          <div className="admin-container">
            <div className="admin-header">
              <h1>All Users</h1>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${adminViewMode === 'cars' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('cars')}
                >
                  🚗 Cars View
                </button>
                <button 
                  className={`toggle-btn ${adminViewMode === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('users')}
                >
                  👥 Users View
                </button>
              </div>
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
                  <label>Subscription Status:</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Trialing">Trialing</option>
                    <option value="Expired">Expired</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                
                <div className="filter-item">
                  <label>Plan Type:</label>
                  <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                    <option value="All Plans">All Plans</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="PAYG">PAYG (Private)</option>
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
                    <th>Total Vehicles</th>
                    <th>Subscription/Package</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="account-name">{user.name || 'Unknown'}</td>
                        <td className="email">{user.email || 'N/A'}</td>
                        <td className="phone">{user.phone || 'N/A'}</td>
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
                            </div>
                          ) : user.type === 'private' ? (
                            <span style={{color: '#999', fontSize: '0.875rem'}}>PAYG</span>
                          ) : (
                            <span style={{color: '#999', fontSize: '0.875rem'}}>No subscription</span>
                          )}
                        </td>
                        <td className="actions">
                          <button 
                            className="action-link view"
                            onClick={async () => {
                              setSelectedUser(user);
                              setShowVehiclesModal(true);
                              setLoadingVehicles(true);
                              try {
                                const userId = user._id?.toString() || user._id;
                                const isTradeUser = user.type === 'trade';
                                const queryParams = isTradeUser ? { params: { dealerId: userId } } : {};
                                console.log('[Admin] Fetching vehicles for:', userId, 'type:', user.type, 'params:', queryParams);
                                const res = await api.get(`/admin/users/${userId}/vehicles`, queryParams);
                                setUserVehicles(res.data.vehicles || []);
                              } catch (e) {
                                console.error('Failed to fetch vehicles:', e);
                                console.error('Error status:', e.response?.status, 'Error data:', e.response?.data);
                                setUserVehicles([]);
                              } finally {
                                setLoadingVehicles(false);
                              }
                            }}
                          >
                            View Vehicles
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
          </div>

          {/* Vehicles Modal */}
          {showVehiclesModal && (
            <div className="vehicles-modal-overlay" onClick={() => setShowVehiclesModal(false)}>
              <div className="vehicles-modal" onClick={e => e.stopPropagation()}>
                <div className="vehicles-modal-header">
                  <h2>{selectedUser?.name || selectedUser?.email}'s Vehicles</h2>
                  <button className="modal-close-btn" onClick={() => setShowVehiclesModal(false)}>✕</button>
                </div>
                <div className="vehicles-modal-body">
                  {loadingVehicles ? (
                    <div className="modal-loading"><div className="spinner"></div><p>Loading vehicles...</p></div>
                  ) : userVehicles.length === 0 ? (
                    <p className="modal-empty">No vehicles found for this user.</p>
                  ) : (
                    <div className="modal-listings-grid">
                      {userVehicles.map(v => (
                        <div key={v._id} className="listing-card">
                          <div className="listing-image">
                            <img src={v.images?.[0] || '/images/dummy/placeholder-car.jpg'} alt={`${v.make} ${v.model}`} />
                            {getStatusBadge(v)}
                          </div>
                          <div className="listing-details">
                            <h3 className="listing-title">{v.make} {v.model}</h3>
                            <p className="listing-subtitle">{v.year} • {v.registrationNumber || 'N/A'}</p>
                            <div className="listing-specs">
                              <span>{v.mileage?.toLocaleString() || '0'} miles</span>
                              <span>•</span>
                              <span>{v.transmission || 'Manual'}</span>
                              <span>•</span>
                              <span>{v.fuelType || 'Petrol'}</span>
                            </div>
                            <div className="listing-price">£{v.price?.toLocaleString() || '0'}</div>
                            {v.advertisingPackage && (v.advertisingPackage.packageName || v.advertisingPackage.packageId) && (
                              <div className="listing-package">
                                <span className="package-badge">
                                  {v.advertisingPackage.packageName?.replace(/^TRADE\s+/i, '') ||
                                    (v.advertisingPackage.packageId ?
                                      v.advertisingPackage.packageId.charAt(0).toUpperCase() + v.advertisingPackage.packageId.slice(1)
                                      : 'Package')}
                                </span>
                                {v.advertisingPackage.expiryDate && (
                                  <span className="expiry-date">
                                    Expires: {new Date(v.advertisingPackage.expiryDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="listing-stats">
                              <span>👁️ {v.viewCount || 0} views</span>
                              <span>📅 Listed {new Date(v.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="listing-actions">
                              {v.advertStatus === 'active' && !isCarExpired(v) && (
                                <>
                                  <button className="btn-view" onClick={() => handleViewListing(v._id, v.vehicleType)}>👁️ View</button>
                                  <button className="btn-edit" onClick={() => { setShowVehiclesModal(false); handleEditListing(v._id, v.vehicleType); }}>✏️ Edit</button>
                                  <button className="btn-sold" onClick={() => handleMarkAsSold(v._id)}>✓ Mark as Sold</button>
                                </>
                              )}
                              {(v.advertStatus === 'draft' || v.advertStatus === 'expired' || isCarExpired(v)) && (
                                <>
                                  <button className="btn-view" onClick={() => handleViewListing(v._id, v.vehicleType)}>👁️ View</button>
                                  <button className="btn-relist" onClick={() => { setShowVehiclesModal(false); handleRelistVehicle(v._id, v.vehicleType); }}>🔄 Relist</button>
                                  <button className="btn-edit" onClick={() => { setShowVehiclesModal(false); handleEditListing(v._id, v.vehicleType); }}>✏️ Edit</button>
                                </>
                              )}
                              {v.advertStatus === 'pending_payment' && (
                                <>
                                  <button className="btn-relist" onClick={() => { setShowVehiclesModal(false); handleRelistVehicle(v._id, v.vehicleType); }}>🔄 Relist</button>
                                  <button className="btn-edit" onClick={() => { setShowVehiclesModal(false); handleEditListing(v._id, v.vehicleType); }}>✏️ Edit</button>
                                  <button className="btn-view" onClick={() => handleViewListing(v._id, v.vehicleType)}>👁️ Preview</button>
                                </>
                              )}
                              {v.advertStatus === 'sold' && !isCarExpired(v) && (
                                <button className="btn-view" onClick={() => handleViewListing(v._id, v.vehicleType)}>👁️ View</button>
                              )}
                              <button className="btn-delete" onClick={() => handleDeleteListing(v._id)}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
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

                  {listing.advertisingPackage && (listing.advertisingPackage.packageName || listing.advertisingPackage.packageId) && (
                    <div className="listing-package">
                      <span className="package-badge">
                        {/* Check sellerContact.type first, then fallback to checking packageName for "TRADE" */}
                        {(listing.sellerContact?.type === 'trade' || 
                          listing.advertisingPackage.packageName?.toUpperCase().includes('TRADE')) 
                          ? 'Trade ' : 'Private '}
                        {/* Remove "TRADE" prefix from packageName if it exists */}
                        {listing.advertisingPackage.packageName?.replace(/^TRADE\s+/i, '') || 
                         (listing.advertisingPackage.packageId ? 
                           listing.advertisingPackage.packageId.charAt(0).toUpperCase() + 
                           listing.advertisingPackage.packageId.slice(1) : 
                           'Package')}
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
