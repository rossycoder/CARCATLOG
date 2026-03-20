import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import * as tradeInventoryService from '../../services/tradeInventoryService';
import './TradeDashboard.css';

// LIVE ANALYTICS - Version 3.0 with Auto-Refresh
const TradeDashboard = () => {
  const { dealer, subscription } = useTradeDealerContext();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshIntervalRef = useRef(null);

  // Debug: Log subscription data
  useEffect(() => {
    console.log('🔍 Dashboard Subscription Data:', subscription);
    console.log('   isTrialing:', subscription?.isTrialing);
    console.log('   status:', subscription?.status);
    console.log('   daysRemaining:', subscription?.daysRemaining);
  }, [subscription]);

  // Fetch stats on mount and set up auto-refresh
  useEffect(() => {
    console.log('🔵 TradeDashboard mounted - Starting live analytics');
    
    // Initial fetch
    fetchStats();
    
    // Set up auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing stats...');
      fetchStats(true); // Pass true to indicate it's a background refresh
    }, 30000); // 30 seconds
    
    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        console.log('🛑 Stopping auto-refresh');
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []); // Empty dependency array - run once

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]); // Only run when message changes

  const fetchStats = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const data = await tradeInventoryService.getStats();
      if (data.success) {
        console.log('✅ Stats data received:', data.stats);
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStats();
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
            <p className="welcome-text">
              Welcome back, {dealer?.contactPerson}!
              {lastUpdated && (
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6b7280' }}>
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              to="/trade/inventory"
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              My Inventory
            </Link>
            <Link 
              to="/trade/analytics"
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Analytics
            </Link>
            <button 
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: refreshing ? '#9ca3af' : '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}
              >
                <path d="M14 8A6 6 0 1 1 8 2v2a4 4 0 1 0 4 4h2z" fill="currentColor"/>
                <path d="M8 0v4l3-2-3-2z" fill="currentColor"/>
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Show Trial Offer Card for Non-Subscribed Users */}
        {!subscription ? (
          <div className="trial-offer-card">
            <div className="trial-offer-header">
              <div className="trial-offer-icon-large">🎉</div>
              <div className="trial-offer-content">
                <h3>Start Your Subscription - Special First Month Pricing!</h3>
                <p className="trial-offer-subtitle">Pay only £2.50 per car for the first 30 days</p>
                <p className="trial-offer-details">Regular monthly pricing starts after trial period</p>
              </div>
            </div>
            <Link to="/trade/subscription" className="btn-start-trial">
              View Packages →
            </Link>
          </div>
        ) : (
          <div className={`subscription-card ${subscription.isTrialing ? 'active' : 'active'}`}>
            {subscription.isTrialing && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '20px' }}>⏱️</span>
                <span>Trial Period Active - {subscription.daysRemaining} days remaining</span>
              </div>
            )}
            <div className="subscription-header">
              <div className="subscription-icon">
                {subscription.isTrialing ? '⏱️' : '✓'}
              </div>
              <div className="subscription-details">
                <h3>{subscription.plan?.name}</h3>
                <p className="subscription-description">
                  {subscription.listingsUsed} of {subscription.listingsLimit || '∞'} listings used
                  {subscription.daysRemaining > 0 && ` • ${subscription.daysRemaining} days remaining`}
                </p>
                {subscription.isTrialing && subscription.plan?.price && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    💡 After trial: £{(subscription.plan.price / 100).toFixed(0)} + VAT per month
                  </p>
                )}
              </div>
            </div>
            <div className="usage-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${usagePercentage}%`,
                    background: usagePercentage > 90 ? '#dc2626' : usagePercentage > 70 ? '#f59e0b' : 'white'
                  }}
                ></div>
              </div>
              <span className="progress-label">{usagePercentage.toFixed(0)}% used</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '60px',
            background: 'white',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #0066cc',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading analytics...</p>
            </div>
          </div>
        ) : (
          <div className="stats-grid" style={{ opacity: refreshing ? 0.6 : 1, transition: 'opacity 0.3s' }}>
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
        )}

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
              <Link to="/trade/subscription" className="action-card">
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
