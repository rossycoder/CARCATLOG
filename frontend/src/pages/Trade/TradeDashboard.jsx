import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import TradeSidebar from '../../components/Trade/TradeSidebar';
import * as tradeInventoryService from '../../services/tradeInventoryService';
import './TradeDashboard.css';

const TradeDashboard = () => {
  const { dealer, subscription } = useTradeDealerContext();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchStats();
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchStats = async () => {
    try {
      const data = await tradeInventoryService.getStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = subscription?.usagePercentage || 0;

  return (
    <div className="trade-dashboard-layout">
      <div className="trade-dashboard-content">
        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '15px 20px',
            marginBottom: '20px',
            background: '#10b981',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="currentColor"/>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="welcome-text">Welcome back, {dealer?.contactPerson}!</p>
          </div>
          <Link to="/find-your-car" className="btn-add-vehicle-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Vehicle
          </Link>
        </div>

        {/* Subscription Status Card */}
        <div className={`subscription-card ${subscription ? 'active' : 'inactive'}`}>
          <div className="subscription-header">
            <div className="subscription-icon">
              {subscription ? '✓' : '⚠'}
            </div>
            <div className="subscription-details">
              <h3>{subscription?.plan?.name || 'No Active Subscription'}</h3>
              <p className="subscription-description">
                {subscription ? (
                  <>
                    {subscription.listingsUsed} of {subscription.listingsLimit || '∞'} listings used
                    {subscription.daysRemaining > 0 && ` • ${subscription.daysRemaining} days remaining`}
                  </>
                ) : (
                  'Subscribe to a plan to start listing vehicles'
                )}
              </p>
            </div>
            {!subscription && (
              <Link to="/sell-my-car/advertising-prices" className="btn-subscribe">
                Subscribe Now
              </Link>
            )}
          </div>
          {subscription && (
            <div className="usage-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${usagePercentage}%`,
                    background: usagePercentage > 90 ? '#dc2626' : usagePercentage > 70 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
              <span className="progress-label">{usagePercentage.toFixed(0)}% used</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card active-stat">
            <div className="stat-header">
              <span className="stat-label">Active Listings</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2"/>
                <path d="M13 16V6h-2v10h2zM5.8 6h12.4L19 11H5l.8-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-value">{stats?.active || 0}</div>
            <div className="stat-footer">
              <Link to="/trade/inventory?filter=active">View all →</Link>
            </div>
          </div>

          <div className="stat-card sold-stat">
            <div className="stat-header">
              <span className="stat-label">Sold This Month</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-value">{stats?.sold || 0}</div>
            <div className="stat-footer">
              <Link to="/trade/inventory?filter=sold">View all →</Link>
            </div>
          </div>

          <div className="stat-card views-stat">
            <div className="stat-header">
              <span className="stat-label">Total Views</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-value">{stats?.totalViews || 0}</div>
            <div className="stat-footer">
              <span className="stat-trend positive">↑ 12% vs last month</span>
            </div>
          </div>

          <div className="stat-card draft-stat">
            <div className="stat-header">
              <span className="stat-label">Draft Listings</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-value">{stats?.draft || 0}</div>
            <div className="stat-footer">
              <Link to="/trade/inventory?filter=draft">Complete drafts →</Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-grid">
            <Link to="/find-your-car" className="action-card primary-action">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 8V24M8 16H24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Add New Vehicle</h3>
              <p>List a new vehicle in your inventory</p>
            </Link>

            <Link to="/trade/inventory" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 12H26M12 6V26" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Manage Inventory</h3>
              <p>View and edit your listings</p>
            </Link>

            {subscription ? (
              <div className="action-card subscription-status">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 10V8a2 2 0 012-2h8a2 2 0 012 2v2M16 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>✓ Subscription Active</h3>
                <p>{subscription.plan?.name} • {subscription.listingsAvailable} listings available</p>
              </div>
            ) : (
              <Link to="/sell-my-car/advertising-prices" className="action-card">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 10V8a2 2 0 012-2h8a2 2 0 012 2v2M16 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Get Subscription</h3>
                <p>Subscribe to start listing vehicles</p>
              </Link>
            )}

            <Link to="/trade/analytics" className="action-card">
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 24V16M16 24V12M24 24V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Analytics</h3>
              <p>View performance insights</p>
            </Link>
          </div>
        </div>

        {/* Most Viewed Vehicles */}
        {stats?.mostViewed && stats.mostViewed.length > 0 && (
          <div className="most-viewed-section">
            <div className="section-header">
              <h2 className="section-title">Top Performing Listings</h2>
              <Link to="/trade/inventory" className="view-all-link">View all →</Link>
            </div>
            <div className="vehicle-grid">
              {stats.mostViewed.map((vehicle) => (
                <Link 
                  key={vehicle._id} 
                  to={`/cars/${vehicle._id}`}
                  className="vehicle-card-mini"
                >
                  <img 
                    src={vehicle.images?.[0] || '/placeholder-car.jpg'} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                  />
                  <div className="vehicle-card-content">
                    <h4>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                    <p className="vehicle-price">£{vehicle.price?.toLocaleString()}</p>
                    <div className="vehicle-metrics">
                      <span className="metric">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 3C4.5 3 1.5 5.5 1 8c.5 2.5 3.5 5 7 5s6.5-2.5 7-5c-.5-2.5-3.5-5-7-5z"/>
                          <circle cx="8" cy="8" r="2"/>
                        </svg>
                        {vehicle.viewCount} views
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDashboard;
