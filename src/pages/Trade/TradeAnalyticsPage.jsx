import { useState, useEffect } from 'react';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import * as tradeAnalyticsService from '../../services/tradeAnalyticsService';
import './TradeAnalyticsPage.css';

const TradeAnalyticsPage = () => {
  const { dealerId } = useTradeDealerContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeAnalyticsService.getAnalytics(timeRange);
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchAnalytics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="empty-state">
          <p>No analytics data available yet. Start listing vehicles to see performance metrics.</p>
        </div>
      </div>
    );
  }

  const overview = analytics.overview || {};
  const topPerformers = analytics.topPerformers || [];
  const viewsByDay = analytics.viewsByDay || [];
  const inquiriesBySource = analytics.inquiriesBySource || [];
  const priceRangePerformance = analytics.priceRangePerformance || [];

  return (
    <div className="analytics-container">
      {/* Header with Time Range Selector */}
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="subtitle">Track your listing performance and insights</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === '7days' ? 'active' : ''} 
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </button>
          <button 
            className={timeRange === '30days' ? 'active' : ''} 
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </button>
          <button 
            className={timeRange === '90days' ? 'active' : ''} 
            onClick={() => setTimeRange('90days')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="analytics-overview-grid">
        <div className="analytics-stat-card">
          <div className="stat-icon views-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Views</p>
            <p className="stat-value">{overview.totalViews || 0}</p>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon inquiries-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Inquiries</p>
            <p className="stat-value">{overview.totalInquiries || 0}</p>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon conversion-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Conversion Rate</p>
            <p className="stat-value">{overview.conversionRate || 0}%</p>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon time-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Avg Time to Sell</p>
            <p className="stat-value">{overview.avgTimeToSell || 0} days</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="analytics-two-column">
        {/* Top Performers */}
        <div className="analytics-card">
          <div className="card-header">
            <h2>Top Performing Listings</h2>
            <p className="card-subtitle">Your best performing vehicles</p>
          </div>
          {topPerformers.length > 0 ? (
            <div className="top-performers-list">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="performer-item">
                  <div className="performer-rank">{index + 1}</div>
                  <div className="performer-details">
                    <h4>{performer.year} {performer.make} {performer.model}</h4>
                    <p className="performer-price">£{performer.price?.toLocaleString()}</p>
                  </div>
                  <div className="performer-stats">
                    <span className="performer-stat">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3C4.5 3 1.5 5.5 1 8c.5 2.5 3.5 5 7 5s6.5-2.5 7-5c-.5-2.5-3.5-5-7-5z"/>
                        <circle cx="8" cy="8" r="2"/>
                      </svg>
                      {performer.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
              No listings yet
            </p>
          )}
        </div>

        {/* Inquiry Sources */}
        <div className="analytics-card">
          <div className="card-header">
            <h2>Inquiry Sources</h2>
            <p className="card-subtitle">Where your inquiries come from</p>
          </div>
          {inquiriesBySource.length > 0 ? (
            <div className="sources-list">
              {inquiriesBySource.map((source) => (
                <div key={source.source} className="source-item">
                  <div className="source-info">
                    <span className="source-name">{source.source}</span>
                    <span className="source-count">{source.count} inquiries</span>
                  </div>
                  <div className="source-bar-container">
                    <div 
                      className="source-bar" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="source-percentage">{source.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
              No inquiry data yet
            </p>
          )}
        </div>
      </div>

      {/* Price Range Performance */}
      {priceRangePerformance.length > 0 && (
        <div className="analytics-card">
          <div className="card-header">
            <h2>Price Range Performance</h2>
            <p className="card-subtitle">How different price ranges perform</p>
          </div>
          <div className="price-range-table">
            <table>
              <thead>
                <tr>
                  <th>Price Range</th>
                  <th>Listings</th>
                  <th>Total Views</th>
                  <th>Inquiries</th>
                </tr>
              </thead>
              <tbody>
                {priceRangePerformance.map((range) => (
                  <tr key={range.range}>
                    <td className="range-cell">{range.range}</td>
                    <td>{range.listings}</td>
                    <td>{range.views}</td>
                    <td>{range.inquiries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active and Sold Stats */}
      <div className="analytics-grid" style={{ marginTop: '24px' }}>
        <div className="analytics-card">
          <h3>Active Listings</h3>
          <p className="analytics-value">{overview.activeListings || 0}</p>
        </div>
        
        <div className="analytics-card">
          <h3>Sold This Month</h3>
          <p className="analytics-value">{overview.soldThisMonth || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default TradeAnalyticsPage;