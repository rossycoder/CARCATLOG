import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import TradeSidebar from '../../components/Trade/TradeSidebar';
import * as tradeInventoryService from '../../services/tradeInventoryService';
import './TradeInventoryPage.css';

const TradeInventoryPage = () => {
  const { dealer } = useTradeDealerContext();
  const [vehicles, setVehicles] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [vehicleType, setVehicleType] = useState('all'); // 'all', 'cars', 'bikes', 'vans'
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [subscription, setSubscription] = useState(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  useEffect(() => {
    fetchAllInventory();
    fetchSubscription();
  }, [filter]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/trade/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tradeToken')}`
        }
      });
      const data = await response.json();
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        // Show warning if at 80% or more of limit
        if (data.subscription.usagePercentage >= 80) {
          setShowLimitWarning(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchAllInventory = async () => {
    setLoading(true);
    try {
      // Fetch cars, bikes, and vans
      const [carsData, bikesData, vansData] = await Promise.all([
        tradeInventoryService.getInventory({ status: filter === 'all' ? undefined : filter }),
        tradeInventoryService.getBikeInventory({ status: filter === 'all' ? undefined : filter }),
        tradeInventoryService.getVanInventory({ status: filter === 'all' ? undefined : filter })
      ]);
      
      if (carsData.success) {
        setVehicles(carsData.vehicles.map(v => ({ ...v, vehicleType: 'car' })));
      }
      if (bikesData.success) {
        setBikes((bikesData.data?.bikes || bikesData.bikes || []).map(b => ({ ...b, vehicleType: 'bike' })));
      }
      if (vansData.success) {
        setVans((vansData.data?.vans || vansData.vans || []).map(v => ({ ...v, vehicleType: 'van' })));
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      if (type === 'bike') {
        await tradeInventoryService.deleteBike(id);
      } else if (type === 'van') {
        await tradeInventoryService.deleteVan(id);
      } else {
        await tradeInventoryService.deleteVehicle(id);
      }
      fetchAllInventory();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  // Combine cars, bikes, and vans based on filter
  const getAllVehicles = () => {
    if (vehicleType === 'cars') return vehicles;
    if (vehicleType === 'bikes') return bikes;
    if (vehicleType === 'vans') return vans;
    return [...vehicles, ...bikes, ...vans];
  };

  const allVehicles = getAllVehicles();
  
  const filteredVehicles = allVehicles
    .filter(v => {
      const searchLower = searchTerm.toLowerCase();
      return `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'views': return (b.viewCount || 0) - (a.viewCount || 0);
        default: return 0;
      }
    });

  const stats = {
    all: allVehicles.length,
    active: allVehicles.filter(v => (v.advertStatus || v.status) === 'active').length,
    sold: allVehicles.filter(v => (v.advertStatus || v.status) === 'sold').length,
    draft: allVehicles.filter(v => (v.advertStatus || v.status) === 'draft').length,
    cars: vehicles.length,
    bikes: bikes.length,
    vans: vans.length,
  };

  return (
    <div className="trade-dashboard-layout">
      <div className="trade-dashboard-content">
        {/* Header Section */}
        <div className="inventory-header">
          <div className="header-left">
            <h1>My Inventory</h1>
            <p className="subtitle">{allVehicles.length} vehicle{allVehicles.length !== 1 ? 's' : ''} in total ({stats.cars} cars, {stats.bikes} bikes, {stats.vans} vans)</p>
            {subscription && subscription.listingsLimit && (
              <div className="subscription-usage">
                <div className="usage-bar-container">
                  <div 
                    className={`usage-bar ${subscription.usagePercentage >= 100 ? 'full' : subscription.usagePercentage >= 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(subscription.usagePercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="usage-text">
                  {subscription.listingsUsed} of {subscription.listingsLimit} listings used
                  {subscription.usagePercentage >= 100 && (
                    <span className="limit-reached"> - Limit reached!</span>
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="header-actions">
            <Link to="/find-your-car" className="btn-add-vehicle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Car
            </Link>
            <Link to="/bikes/find-your-bike" className="btn-add-vehicle btn-add-bike">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Bike
            </Link>
            <Link to="/vans/find-your-van" className="btn-add-vehicle btn-add-van">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Van
            </Link>
          </div>
        </div>

        {/* Limit Warning */}
        {showLimitWarning && subscription && subscription.listingsLimit && (
          <div className={`limit-warning ${subscription.usagePercentage >= 100 ? 'error' : 'warning'}`}>
            <div className="warning-icon">
              {subscription.usagePercentage >= 100 ? '🚫' : '⚠️'}
            </div>
            <div className="warning-content">
              <h3>
                {subscription.usagePercentage >= 100 
                  ? 'Listing Limit Reached' 
                  : 'Approaching Listing Limit'}
              </h3>
              <p>
                {subscription.usagePercentage >= 100 
                  ? `Your ${subscription.plan?.name || 'current'} plan allows ${subscription.listingsLimit} listings. You have reached your limit. Please upgrade your plan to add more vehicles.`
                  : `You're using ${subscription.listingsUsed} of ${subscription.listingsLimit} listings (${subscription.usagePercentage}%). Consider upgrading to add more vehicles.`}
              </p>
              <Link to="/trade/subscription" className="btn-upgrade">
                {subscription.usagePercentage >= 100 ? 'Upgrade Plan' : 'View Plans'}
              </Link>
            </div>
            <button className="close-warning" onClick={() => setShowLimitWarning(false)}>×</button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="inventory-controls">
          <div className="inventory-filters">
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All <span className="count">{stats.all}</span>
              </button>
              <button 
                className={filter === 'active' ? 'active' : ''} 
                onClick={() => setFilter('active')}
              >
                Active <span className="count">{stats.active}</span>
              </button>
              <button 
                className={filter === 'sold' ? 'active' : ''} 
                onClick={() => setFilter('sold')}
              >
                Sold <span className="count">{stats.sold}</span>
              </button>
              <button 
                className={filter === 'draft' ? 'active' : ''} 
                onClick={() => setFilter('draft')}
              >
                Drafts <span className="count">{stats.draft}</span>
              </button>
            </div>
            <div className="filter-group vehicle-type-filter">
              <span className="filter-label">Type:</span>
              <button 
                className={vehicleType === 'all' ? 'active' : ''} 
                onClick={() => setVehicleType('all')}
              >
                All
              </button>
              <button 
                className={vehicleType === 'cars' ? 'active' : ''} 
                onClick={() => setVehicleType('cars')}
              >
                🚗 Cars <span className="count">{stats.cars}</span>
              </button>
              <button 
                className={vehicleType === 'bikes' ? 'active' : ''} 
                onClick={() => setVehicleType('bikes')}
              >
                🏍️ Bikes <span className="count">{stats.bikes}</span>
              </button>
              <button 
                className={vehicleType === 'vans' ? 'active' : ''} 
                onClick={() => setVehicleType('vans')}
              >
                🚐 Vans <span className="count">{stats.vans}</span>
              </button>
            </div>
          </div>

          <div className="inventory-tools">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#666" strokeWidth="2"/>
                <path d="M12.5 12.5L16 16" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search vehicles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="views">Most Viewed</option>
            </select>

            <div className="view-toggle">
              <button 
                className={viewMode === 'grid' ? 'active' : ''} 
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2" width="7" height="7" rx="1"/>
                  <rect x="11" y="2" width="7" height="7" rx="1"/>
                  <rect x="2" y="11" width="7" height="7" rx="1"/>
                  <rect x="11" y="11" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="3" width="16" height="3" rx="1"/>
                  <rect x="2" y="8" width="16" height="3" rx="1"/>
                  <rect x="2" y="13" width="16" height="3" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your inventory...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>{searchTerm ? 'No vehicles match your search' : 'No vehicles found'}</h3>
            <p>{searchTerm ? 'Try adjusting your search terms' : 'Start building your inventory by adding your first vehicle'}</p>
            {!searchTerm && (
              <Link to="/find-your-car" className="btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Your First Vehicle
              </Link>
            )}
          </div>
        ) : (
          <div className={`vehicles-container ${viewMode}`}>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-image-container">
                  <img 
                    src={vehicle.images?.[0] || '/placeholder-car.jpg'} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                  />
                  <span className={`type-badge ${vehicle.vehicleType}`}>
                    {vehicle.vehicleType === 'bike' ? '🏍️' : vehicle.vehicleType === 'van' ? '🚐' : '🚗'}
                  </span>
                  <span className={`status-badge ${vehicle.advertStatus || vehicle.status}`}>
                    {(vehicle.advertStatus || vehicle.status) === 'active' && '✓ Active'}
                    {(vehicle.advertStatus || vehicle.status) === 'sold' && '✓ Sold'}
                    {(vehicle.advertStatus || vehicle.status) === 'draft' && '📝 Draft'}
                  </span>
                  {vehicle.images && vehicle.images.length > 1 && (
                    <span className="image-count">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v6.5l2.5-2.5a1 1 0 011.414 0L10 11.086l1.793-1.793a1 1 0 011.414 0L14 10.086V4a1 1 0 00-1-1H4z"/>
                        <circle cx="6" cy="6" r="1"/>
                      </svg>
                      {vehicle.images.length}
                    </span>
                  )}
                </div>
                
                <div className="vehicle-details">
                  <div className="vehicle-title-row">
                    <h3 className="vehicle-title">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="vehicle-price">£{vehicle.price?.toLocaleString()}</p>
                  </div>
                  
                  <p className="vehicle-specs">
                    {vehicle.mileage?.toLocaleString()} miles • {vehicle.fuelType} • {vehicle.transmission}
                  </p>
                  
                  <div className="vehicle-meta">
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 1a5 5 0 110 10A5 5 0 018 3zm-.5 2v3.5h3v1h-4V5h1z"/>
                      </svg>
                      <span>Listed {new Date(vehicle.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2C4.5 2 1.5 4.5 1.5 7.5c0 1.8.9 3.4 2.3 4.5L2 15l3.5-1.8c.8.3 1.6.5 2.5.5 3.5 0 6.5-2.5 6.5-5.5S11.5 2 8 2zm0 1c2.9 0 5.5 2.1 5.5 4.5S10.9 12 8 12c-.7 0-1.4-.1-2-.4l-.3-.1-2.2 1.1.8-2.3-.2-.3C3.4 9.2 2.5 8.4 2.5 7.5 2.5 5.1 5.1 3 8 3z"/>
                      </svg>
                      <span>{vehicle.viewCount || 0} views</span>
                    </div>
                  </div>

                  <div className="vehicle-actions">
                    <Link to={
                      vehicle.vehicleType === 'bike' ? `/trade/inventory/edit-bike/${vehicle._id}` : 
                      vehicle.vehicleType === 'van' ? `/trade/inventory/edit-van/${vehicle._id}` :
                      `/trade/inventory/edit/${vehicle._id}`
                    } className="btn-action btn-edit">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 2.793L10.5 3 4 9.5 3.1 11.9l2.4-.9 6.5-6.5z"/>
                      </svg>
                      Edit
                    </Link>
                    <Link to={
                      vehicle.vehicleType === 'bike' ? `/bikes/${vehicle._id}` :
                      vehicle.vehicleType === 'van' ? `/vans/${vehicle._id}` :
                      `/cars/${vehicle._id}`
                    } className="btn-action btn-view" target="_blank">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3C4.5 3 1.5 5.5 1 8c.5 2.5 3.5 5 7 5s6.5-2.5 7-5c-.5-2.5-3.5-5-7-5zm0 8.5c-2 0-3.5-1.5-3.5-3.5S6 4.5 8 4.5s3.5 1.5 3.5 3.5-1.5 3.5-3.5 3.5zm0-6C6.9 5.5 6 6.4 6 7.5S6.9 9.5 8 9.5s2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      View
                    </Link>
                    <button onClick={() => handleDelete(vehicle._id, vehicle.vehicleType)} className="btn-action btn-delete">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                      Delete
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
};

export default TradeInventoryPage;
