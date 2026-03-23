import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planTypeFilter, setPlanTypeFilter] = useState('All Plans');
  const [sortBy, setSortBy] = useState('Next Renewal Date');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'active', 'expiring', 'overdue', 'recent'
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'
  const [expandedDealers, setExpandedDealers] = useState({}); // Track which dealers are expanded
  
  // Stats
  const [stats, setStats] = useState({
    totalActive: 0,
    expiringSoon: 0,
    overdue: 0,
    recentSignUps: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/signin', { state: { from: '/admin/dashboard' } });
      return;
    }
    
    // Check if user is admin
    if (!user.isAdmin && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchAdminListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, searchQuery, statusFilter, planTypeFilter, sortBy, quickFilter]);

  const fetchAdminListings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/listings');
      const allListings = response.data.listings || [];
      setListings(allListings);
      calculateStats(allListings);
    } catch (err) {
      console.error('[AdminDashboard] Error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Admin access required');
        navigate('/');
      } else {
        setError(err.response?.data?.error || 'Failed to load listings');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allListings) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalActive = allListings.filter(l => l.advertStatus === 'active').length;
    
    const expiringSoon = allListings.filter(l => {
      if (l.advertStatus !== 'active' || !l.advertisingPackage?.expiryDate) return false;
      const expiryDate = new Date(l.advertisingPackage.expiryDate);
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    }).length;
    
    const overdue = allListings.filter(l => {
      if (!l.advertisingPackage?.expiryDate) return false;
      const expiryDate = new Date(l.advertisingPackage.expiryDate);
      return expiryDate < now && l.advertStatus === 'active';
    }).length;
    
    const recentSignUps = allListings.filter(l => {
      const createdDate = new Date(l.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;

    setStats({ totalActive, expiringSoon, overdue, recentSignUps });
  };

  const applyFilters = () => {
    let filtered = [...listings];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Quick filter (from stat cards)
    if (quickFilter === 'active') {
      filtered = filtered.filter(l => l.advertStatus === 'active');
    } else if (quickFilter === 'expiring') {
      filtered = filtered.filter(l => {
        if (l.advertStatus !== 'active' || !l.advertisingPackage?.expiryDate) return false;
        const expiryDate = new Date(l.advertisingPackage.expiryDate);
        return expiryDate > now && expiryDate <= thirtyDaysFromNow;
      });
    } else if (quickFilter === 'overdue') {
      filtered = filtered.filter(l => {
        if (l.advertStatus !== 'active' || !l.advertisingPackage?.expiryDate) return false;
        const expiryDate = new Date(l.advertisingPackage.expiryDate);
        return expiryDate < now;
      });
    } else if (quickFilter === 'recent') {
      filtered = filtered.filter(l => {
        const createdDate = new Date(l.createdAt);
        return createdDate >= sevenDaysAgo;
      });
    }

    // Search filter (Name, Email, VIN)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.ownerName?.toLowerCase().includes(query) ||
        l.ownerEmail?.toLowerCase().includes(query) ||
        l.vin?.toLowerCase().includes(query) ||
        l.registrationNumber?.toLowerCase().includes(query)
      );
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
      filtered = filtered.filter(l => l.advertStatus === statusMap[statusFilter]);
    }

    // Plan type filter
    if (planTypeFilter !== 'All Plans') {
      filtered = filtered.filter(l => 
        l.advertisingPackage?.packageName?.toLowerCase().includes(planTypeFilter.toLowerCase())
      );
    }

    // Sorting
    filtered.sort((a, b) => {
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

    setFilteredListings(filtered);
    setCurrentPage(1);
  };

  // Group listings by dealer/user
  const groupListingsByDealer = (listings) => {
    const grouped = {};
    
    listings.forEach(listing => {
      const dealerKey = listing.ownerEmail || 'unknown';
      if (!grouped[dealerKey]) {
        grouped[dealerKey] = {
          dealerName: listing.ownerName || 'Unknown User',
          dealerEmail: listing.ownerEmail || 'No Email',
          listings: []
        };
      }
      grouped[dealerKey].listings.push(listing);
    });
    
    return grouped;
  };

  const toggleDealer = (dealerEmail) => {
    setExpandedDealers(prev => ({
      ...prev,
      [dealerEmail]: !prev[dealerEmail]
    }));
  };

  const toggleAllDealers = (expand) => {
    const newExpanded = {};
    Object.keys(groupedListings).forEach(key => {
      newExpanded[key] = expand;
    });
    setExpandedDealers(newExpanded);
  };

  const handleApplyFilters = () => {
    applyFilters();
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
      badgeClass = 'badge-overdue';
      label = 'Overdue';
    } else if (isExpiringSoon) {
      badgeClass = 'badge-expiring';
      label = 'Expiring Soon';
    } else {
      // Default status mapping
      const statusMap = {
        active: { label: 'Active', className: 'badge-active' },
        sold: { label: 'Sold', className: 'badge-sold' },
        expired: { label: 'Expired', className: 'badge-expired' },
        draft: { label: 'Draft', className: 'badge-draft' },
        pending_payment: { label: 'Pending', className: 'badge-pending' }
      };
      const statusInfo = statusMap[status] || { label: status, className: 'badge-default' };
      badgeClass = statusInfo.className;
      label = statusInfo.label;
    }
    
    return <span className={`status-badge ${badgeClass}`}>{label}</span>;
  };

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, endIndex);
  
  // Grouped listings
  const groupedListings = groupListingsByDealer(viewMode === 'grouped' ? filteredListings : currentListings);

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="container">
          <div className="error-state">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>🔐 Live Subscription Accounts</h1>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Name, Email, or VIN"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-icon">🔍</button>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Subscription Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Active</option>
                <option>Expired</option>
                <option>Sold</option>
                <option>Pending</option>
                <option>All</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Plan Type:</label>
              <select value={planTypeFilter} onChange={(e) => setPlanTypeFilter(e.target.value)}>
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

            <div className="filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Next Renewal Date</option>
                <option>Name</option>
                <option>Recent</option>
              </select>
            </div>

            <button className="apply-filters-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div 
            className={`stat-card ${quickFilter === 'active' ? 'active-filter' : ''}`}
            onClick={() => {
              setQuickFilter(quickFilter === 'active' ? 'all' : 'active');
            }}
            style={{ cursor: 'pointer' }}
            title="Click to filter active accounts"
          >
            <div className="stat-label">Total Active Accounts:</div>
            <div className="stat-value">{stats.totalActive}</div>
          </div>
          <div 
            className={`stat-card expiring ${quickFilter === 'expiring' ? 'active-filter' : ''}`}
            onClick={() => {
              setQuickFilter(quickFilter === 'expiring' ? 'all' : 'expiring');
            }}
            style={{ cursor: 'pointer' }}
            title="Click to filter expiring soon"
          >
            <div className="stat-label">Expiring Soon:</div>
            <div className="stat-value">{stats.expiringSoon}</div>
          </div>
          <div 
            className={`stat-card overdue ${quickFilter === 'overdue' ? 'active-filter' : ''}`}
            onClick={() => {
              setQuickFilter(quickFilter === 'overdue' ? 'all' : 'overdue');
            }}
            style={{ cursor: 'pointer' }}
            title="Click to filter overdue"
          >
            <div className="stat-label">Overdue:</div>
            <div className="stat-value">{stats.overdue}</div>
          </div>
          <div 
            className={`stat-card recent ${quickFilter === 'recent' ? 'active-filter' : ''}`}
            onClick={() => {
              setQuickFilter(quickFilter === 'recent' ? 'all' : 'recent');
            }}
            style={{ cursor: 'pointer' }}
            title="Click to filter recent sign-ups"
          >
            <div className="stat-label">Recent Sign-Ups:</div>
            <div className="stat-value">{stats.recentSignUps}</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-section">
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
            >
              📁 Grouped by Dealer
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
          </div>
          {viewMode === 'grouped' && (
            <div className="expand-controls">
              <button className="expand-btn" onClick={() => toggleAllDealers(true)}>
                Expand All
              </button>
              <button className="expand-btn" onClick={() => toggleAllDealers(false)}>
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Grouped View */}
        {viewMode === 'grouped' ? (
          <div className="grouped-listings-container">
            {Object.keys(groupedListings).length === 0 ? (
              <div className="no-data">No listings found</div>
            ) : (
              Object.entries(groupedListings).map(([dealerEmail, dealerData]) => (
                <div key={dealerEmail} className="dealer-group">
                  <div 
                    className="dealer-header"
                    onClick={() => toggleDealer(dealerEmail)}
                  >
                    <div className="dealer-info">
                      <span className="expand-icon">
                        {expandedDealers[dealerEmail] ? '▼' : '▶'}
                      </span>
                      <div className="dealer-details">
                        <h3>{dealerData.dealerName}</h3>
                        <p className="dealer-email">{dealerData.dealerEmail}</p>
                      </div>
                    </div>
                    <div className="dealer-stats">
                      <span className="car-count">{dealerData.listings.length} {dealerData.listings.length === 1 ? 'car' : 'cars'}</span>
                    </div>
                  </div>
                  
                  {expandedDealers[dealerEmail] && (
                    <div className="dealer-listings">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Vehicle VIN</th>
                            <th>Plan Type</th>
                            <th>Next Renewal</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dealerData.listings.map((listing) => (
                            <tr key={listing._id}>
                              <td className="vin-column">
                                {listing.vin || listing.registrationNumber || 'N/A'}
                              </td>
                              <td>
                                {listing.advertisingPackage?.packageName || 'N/A'}
                              </td>
                              <td>
                                {listing.advertisingPackage?.expiryDate 
                                  ? new Date(listing.advertisingPackage.expiryDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })
                                  : 'N/A'}
                              </td>
                              <td>{getStatusBadge(listing)}</td>
                              <td className="actions-column">
                                <button 
                                  className="action-btn view-btn"
                                  onClick={() => {
                                    const vehicleType = listing.vehicleType || 'car';
                                    if (vehicleType === 'bike') {
                                      navigate(`/bikes/${listing._id}`);
                                    } else if (vehicleType === 'van') {
                                      navigate(`/vans/${listing._id}`);
                                    } else {
                                      navigate(`/cars/${listing._id}`);
                                    }
                                  }}
                                >
                                  View
                                </button>
                                <button 
                                  className="action-btn manage-btn"
                                  onClick={() => {
                                    navigate(`/admin/listings/${listing._id}`);
                                  }}
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* List View - Original Table */
          <>
        {/* Table Section */}
        <div className="table-container">
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
              {currentListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No listings found</td>
                </tr>
              ) : (
                currentListings.map((listing) => (
                  <tr key={listing._id}>
                    <td className="account-name">
                      {listing.ownerName || 'N/A'}
                    </td>
                    <td>{listing.ownerEmail || 'N/A'}</td>
                    <td className="vin-column">
                      {listing.vin || listing.registrationNumber || 'N/A'}
                    </td>
                    <td>
                      {listing.advertisingPackage?.packageName || 'N/A'}
                    </td>
                    <td>
                      {listing.advertisingPackage?.expiryDate 
                        ? new Date(listing.advertisingPackage.expiryDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : 'N/A'}
                    </td>
                    <td>{getStatusBadge(listing)}</td>
                    <td className="actions-column">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => {
                          const vehicleType = listing.vehicleType || 'car';
                          if (vehicleType === 'bike') {
                            navigate(`/bikes/${listing._id}`);
                          } else if (vehicleType === 'van') {
                            navigate(`/vans/${listing._id}`);
                          } else {
                            navigate(`/cars/${listing._id}`);
                          }
                        }}
                      >
                        View
                      </button>
                      <button 
                        className="action-btn manage-btn"
                        onClick={() => {
                          navigate(`/admin/listings/${listing._id}`);
                        }}
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
          <div className="pagination">
            <span className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredListings.length)} of {filteredListings.length} entries
            </span>
            <div className="pagination-controls">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-ellipsis">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="pagination-btn"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                ▶
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
