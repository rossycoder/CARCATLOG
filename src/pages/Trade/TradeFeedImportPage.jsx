import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TradeFeedImportPage.css';

// Professional icons for better UX
const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  ),
  TestTube: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 2a1 1 0 011-1h4a1 1 0 011 1v2h3a1 1 0 110 2v.5a1 1 0 11-2 0V6H6v.5a1 1 0 11-2 0V6a1 1 0 110-2h3V2zM6 8h8l-.5 8H6.5L6 8z"/>
    </svg>
  ),
  Sync: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4v1.076l.812-.812a.5.5 0 01.707.707L8.5 6l-1.019-1.029a.5.5 0 01.707-.707L8.5 4.586V3z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  XCircle: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  Database: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" />
    </svg>
  ),
  Activity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,13H5L8.5,7L12.5,17L16,11H21V13H17L13.5,19L9.5,9L6,15H3V13Z" />
    </svg>
  )
};

function TradeFeedImportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('feeds');

  // Test Feed Form
  const [feedUrl, setFeedUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Import settings
  const [removeSoldVehicles, setRemoveSoldVehicles] = useState(true);
  const [importImages, setImportImages] = useState(true);
  const [useUnsplashFallback, setUseUnsplashFallback] = useState(true);
  const [limitVehicles, setLimitVehicles] = useState(true);
  const [selectionMode, setSelectionMode] = useState('first');

  useEffect(() => {
    fetchFeeds();
    fetchLogs();
  }, []);

  const fetchFeeds = async () => {
    try {
      const token = localStorage.getItem('tradeToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFeeds(response.data.feeds);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('tradeToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/logs`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleTestFeed = async () => {
    if (!feedUrl.trim()) {
      alert('Please enter a feed URL');
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('tradeToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/test`,
        { feedUrl },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTestResult(response.data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleImportFeed = async () => {
    if (!feedUrl.trim()) {
      alert('Please enter a feed URL');
      return;
    }

    if (!window.confirm('Import stock from this feed? This will create/update vehicle listings.')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('tradeToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/import`,
        { 
          feedUrl, 
          removeSoldVehicles,
          importImages,
          useUnsplashFallback,
          limitVehicles,
          selectionMode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        let message = response.data.message;
        
        // Add additional info about the import
        if (response.data.limitApplied) {
          message += `\nSubscription limit was applied.`;
        }
        if (response.data.unsplashImagesUsed > 0) {
          message += `\n${response.data.unsplashImagesUsed} high-quality images were added automatically.`;
        }
        
        alert(message);
        setTestResult(null);
        setFeedUrl('');
        fetchFeeds();
        fetchLogs();
        setActiveTab('logs');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to import feed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoImport = async (feedId, currentStatus) => {
    try {
      const token = localStorage.getItem('tradeToken');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/${feedId}`,
        { auto_import_enabled: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchFeeds();
    } catch (error) {
      alert('Failed to update feed settings');
    }
  };

  const handleSyncFeed = async (feedId) => {
    if (!window.confirm('Manually sync this feed now?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('tradeToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/${feedId}/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Feed synced successfully!');
        fetchLogs();
      }
    } catch (error) {
      alert('Failed to sync feed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeed = async (feedId) => {
    if (!window.confirm('Delete this feed? Vehicles will remain but will no longer sync.')) {
      return;
    }

    try {
      const token = localStorage.getItem('tradeToken');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/trade/feed/${feedId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchFeeds();
    } catch (error) {
      alert('Failed to delete feed');
    }
  };

  return (
    <div className="trade-feed-import-page">
      <div className="trade-feed-container">
        {/* Enhanced Header with gradient background */}
        <div className="trade-feed-header">
          <button className="back-button" onClick={() => navigate('/trade/dashboard')}>
            <Icons.ArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="header-content">
            <div className="header-icon">
              <Icons.Database />
            </div>
            <div className="header-text">
              <h1>Stock Feed Import</h1>
              <p>Automatically synchronize your inventory from your dealer management system</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Icons.Upload />
              </div>
              <div className="stat-text">
                <div className="stat-number">{feeds.length}</div>
                <div className="stat-label">Active Feeds</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Icons.Activity />
              </div>
              <div className="stat-text">
                <div className="stat-number">{logs.slice(0,5).reduce((sum, log) => sum + (log.vehiclesImported || 0), 0)}</div>
                <div className="stat-label">Recent Imports</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Icons.CheckCircle />
              </div>
              <div className="stat-text">
                <div className="stat-number">{logs.filter(log => log.status === 'success').length}</div>
                <div className="stat-label">Successful Syncs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'feeds' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('feeds')}
          >
            <Icons.Upload />
            <span>Import Feed</span>
          </button>
          <button 
            className={activeTab === 'active' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('active')}
          >
            <Icons.Database />
            <span>Active Feeds ({feeds.length})</span>
          </button>
          <button 
            className={activeTab === 'logs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('logs')}
          >
            <Icons.Activity />
            <span>Sync History</span>
          </button>
        </div>

        {activeTab === 'feeds' && (
          <div className="import-section">
            <div className="feed-form-card">
              <div className="card-header">
                <h2>Add Stock Feed</h2>
                <div className="card-subtitle">
                  Connect your dealer management system for automatic inventory updates
                </div>
              </div>

              <div className="form-container">
                <div className="form-group">
                  <label>Feed URL</label>
                  <div className="input-group">
                    <input
                      type="url"
                      value={feedUrl}
                      onChange={(e) => setFeedUrl(e.target.value)}
                      placeholder="https://yourdealership.com/feed.xml"
                      className="feed-url-input"
                    />
                    <div className="input-icon">
                      <Icons.Database />
                    </div>
                  </div>
                  <div className="help-text">
                    Supports XML, CSV, and JSON formats from all major UK dealer management systems
                  </div>
                </div>

                <div className="form-options">
                  <div className="options-header">
                    <h3>Import Options</h3>
                  </div>
                  
                  <label className="checkbox-label enhanced">
                    <input
                      type="checkbox"
                      checked={removeSoldVehicles}
                      onChange={(e) => setRemoveSoldVehicles(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-content">
                      <div className="checkbox-title">Auto-manage sold vehicles</div>
                      <div className="checkbox-description">Automatically mark vehicles as sold when removed from your feed</div>
                    </div>
                  </label>

                  <label className="checkbox-label enhanced">
                    <input
                      type="checkbox"
                      checked={importImages}
                      onChange={(e) => setImportImages(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-content">
                      <div className="checkbox-title">Import vehicle images</div>
                      <div className="checkbox-description">Download and store images from your feed for better listings</div>
                    </div>
                  </label>

                  <label className="checkbox-label enhanced">
                    <input
                      type="checkbox"
                      checked={useUnsplashFallback}
                      onChange={(e) => setUseUnsplashFallback(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-content">
                      <div className="checkbox-title">Smart image enhancement</div>
                      <div className="checkbox-description">Add high-quality professional car photos when feed images are missing or broken</div>
                    </div>
                  </label>

                  <label className="checkbox-label enhanced">
                    <input
                      type="checkbox"
                      checked={limitVehicles}
                      onChange={(e) => setLimitVehicles(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <div className="checkbox-content">
                      <div className="checkbox-title">Respect subscription limits</div>
                      <div className="checkbox-description">Only import vehicles up to your subscription allowance</div>
                    </div>
                  </label>

                  {limitVehicles && (
                    <div className="sub-options">
                      <div className="sub-option-label">Vehicle Selection Priority:</div>
                      <select 
                        value={selectionMode} 
                        onChange={(e) => setSelectionMode(e.target.value)}
                        className="selection-dropdown"
                      >
                        <option value="first">First vehicles in feed (default order)</option>
                        <option value="highest-price">Highest priced vehicles first</option>
                        <option value="newest">Newest vehicles first</option>
                        <option value="lowest-mileage">Lowest mileage vehicles first</option>
                      </select>
                      <div className="sub-option-help">
                        Choose which vehicles to prioritize if your feed has more cars than your subscription allows
                      </div>
                    </div>
                  )}
                </div>

                <div className="button-group">
                  <button 
                    onClick={handleTestFeed} 
                    disabled={testLoading || !feedUrl.trim()}
                    className="btn-secondary"
                  >
                    <Icons.TestTube />
                    <span>{testLoading ? 'Testing Connection...' : 'Test Connection'}</span>
                  </button>
                  <button 
                    onClick={handleImportFeed} 
                    disabled={loading || !feedUrl.trim()}
                    className="btn-primary"
                  >
                    <Icons.Upload />
                    <span>{loading ? 'Importing Stock...' : 'Import Stock'}</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  <div className="result-header">
                    {testResult.success ? (
                      <>
                        <Icons.CheckCircle />
                        <h3>Connection Successful!</h3>
                      </>
                    ) : (
                      <>
                        <Icons.XCircle />
                        <h3>Connection Failed</h3>
                      </>
                    )}
                  </div>
                  
                  {testResult.success ? (
                    <div className="success-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Provider</label>
                          <value>{testResult.provider}</value>
                        </div>
                        <div className="detail-item">
                          <label>Format</label>
                          <value>{testResult.format.toUpperCase()}</value>
                        </div>
                        <div className="detail-item">
                          <label>Vehicles Found</label>
                          <value>{testResult.vehicleCount}</value>
                        </div>
                        <div className="detail-item">
                          <label>Images Available</label>
                          <value>{testResult.hasImages ? 'Yes' : 'No'}</value>
                        </div>
                      </div>
                      
                      {testResult.preview && testResult.preview.length > 0 && (
                        <div className="preview-section">
                          <h4>Vehicle Preview</h4>
                          <div className="preview-grid">
                            {testResult.preview.map((vehicle, index) => (
                              <div key={index} className="preview-vehicle">
                                <div className="vehicle-header">
                                  <strong>{vehicle.make} {vehicle.model}</strong>
                                </div>
                                <div className="vehicle-details">
                                  <span>{vehicle.year}</span>
                                  <span>{vehicle.fuel_type}</span>
                                  <span>{vehicle.transmission}</span>
                                </div>
                                {vehicle.price && (
                                  <div className="vehicle-price">£{parseFloat(vehicle.price).toLocaleString()}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="error-details">
                      <p>{testResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="info-card">
              <div className="card-header">
                <h3>Supported Providers</h3>
                <div className="card-subtitle">We work with all major UK dealer management systems</div>
              </div>
              
              <div className="provider-grid">
                <div className="provider-category">
                  <h4>Popular Systems</h4>
                  <div className="provider-list">
                    <div className="provider-item featured">MotorDesk</div>
                    <div className="provider-item featured">Dragon2000</div>
                    <div className="provider-item featured">Click Dealer</div>
                    <div className="provider-item featured">DealerWeb</div>
                  </div>
                </div>
                
                <div className="provider-category">
                  <h4>Also Supported</h4>
                  <div className="provider-list">
                    <div className="provider-item">Codeweavers</div>
                    <div className="provider-item">GForces</div>
                    <div className="provider-item">Spidersnet</div>
                    <div className="provider-item">67 Degrees</div>
                    <div className="provider-item">Bluesky Interactive</div>
                    <div className="provider-item">AutoManager</div>
                    <div className="provider-item">Car Dealer 5</div>
                    <div className="provider-item">AutoEdit</div>
                  </div>
                </div>
                
                <div className="provider-category">
                  <h4>Universal Support</h4>
                  <div className="universal-note">
                    <p>Don't see your system? No problem! We support any system that can provide XML, CSV, or JSON feeds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="active-feeds-section">
            {feeds.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icons.Database />
                </div>
                <h3>No Active Feeds</h3>
                <p>Connect your first dealer management system to start automatically importing your inventory.</p>
                <button onClick={() => setActiveTab('feeds')} className="btn-primary">
                  <Icons.Upload />
                  <span>Add Your First Feed</span>
                </button>
              </div>
            ) : (
              <div className="feeds-grid">
                {feeds.map(feed => (
                  <div key={feed._id || feed.id} className="feed-card enhanced">
                    <div className="feed-header">
                      <div className="feed-title">
                        <h3>{feed.provider || 'Generic Feed'}</h3>
                        <span className={`status-badge ${feed.status}`}>
                          {feed.status === 'active' && <Icons.CheckCircle />}
                          {feed.status === 'error' && <Icons.XCircle />}
                          <span>{feed.status}</span>
                        </span>
                      </div>
                      <div className="feed-type">
                        {feed.feedType ? feed.feedType.toUpperCase() : 'Unknown'} Feed
                      </div>
                    </div>

                    <div className="feed-url">
                      <div className="url-label">Feed URL</div>
                      <div className="url-value">{feed.feedUrl || 'Feed URL not configured'}</div>
                    </div>

                    <div className="feed-stats">
                      <div className="stat">
                        <div className="stat-label">Last Sync</div>
                        <div className="stat-value">
                          {feed.lastSync ? new Date(feed.lastSync).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">Auto Import</div>
                        <div className="stat-value">
                          {feed.autoImportEnabled ? (
                            <span className="auto-enabled">
                              <Icons.CheckCircle />
                              Every 15 min
                            </span>
                          ) : (
                            <span className="auto-disabled">Disabled</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="feed-actions">
                      <button 
                        onClick={() => handleSyncFeed(feed._id || feed.id)}
                        className="btn-small btn-primary"
                        disabled={loading}
                      >
                        <Icons.Sync />
                        <span>Sync Now</span>
                      </button>
                      <button 
                        onClick={() => handleToggleAutoImport(feed._id || feed.id, feed.autoImportEnabled)}
                        className="btn-small btn-secondary"
                      >
                        {feed.autoImportEnabled ? 'Disable Auto-Sync' : 'Enable Auto-Sync'}
                      </button>
                      <button 
                        onClick={() => handleDeleteFeed(feed._id || feed.id)}
                        className="btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-section">
            <div className="logs-header">
              <h2>Sync History</h2>
              <p>Track your feed import performance and troubleshoot any issues</p>
            </div>
            
            {logs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icons.Activity />
                </div>
                <h3>No Sync History</h3>
                <p>Your feed sync history will appear here once you start importing.</p>
              </div>
            ) : (
              <div className="logs-container">
                <div className="logs-table-wrapper">
                  <table className="logs-table enhanced">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Found</th>
                        <th>Imported</th>
                        <th>Updated</th>
                        <th>Archived</th>
                        <th>Duration</th>
                        <th>Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr key={log._id || log.id || index} className="log-row">
                          <td className="log-date">
                            <div className="date-time">
                              <div className="date">{log.syncTime ? new Date(log.syncTime).toLocaleDateString() : 'N/A'}</div>
                              <div className="time">{log.syncTime ? new Date(log.syncTime).toLocaleTimeString() : ''}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge enhanced ${log.status}`}>
                              {log.status === 'success' && <Icons.CheckCircle />}
                              {log.status === 'failed' && <Icons.XCircle />}
                              <span>{log.status}</span>
                            </span>
                          </td>
                          <td className="numeric">{log.vehiclesFound || 0}</td>
                          <td className="numeric success">{log.vehiclesImported || 0}</td>
                          <td className="numeric warning">{log.vehiclesUpdated || 0}</td>
                          <td className="numeric muted">{log.vehiclesArchived || 0}</td>
                          <td className="duration">
                            {log.durationMs ? (log.durationMs / 1000).toFixed(1) + 's' : '0.0s'}
                          </td>
                          <td>
                            {log.feedErrors && log.feedErrors.length > 0 ? (
                              <span className="error-badge">{log.feedErrors.length} issues</span>
                            ) : (
                              <span className="no-errors">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeFeedImportPage;
