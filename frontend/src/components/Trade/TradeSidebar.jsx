import { NavLink } from 'react-router-dom';
import { useTradeDealerContext } from '../../context/TradeDealerContext';
import './TradeSidebar.css';

const TradeSidebar = () => {
  const { dealer, logout } = useTradeDealerContext();

  return (
    <div className="trade-sidebar">
      <div className="trade-sidebar-header">
        <h2>{dealer?.businessName}</h2>
        <p className="dealer-email">{dealer?.email}</p>
      </div>

      <nav className="trade-sidebar-nav">
        <NavLink to="/trade/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/trade/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">🚗</span>
          My Inventory
        </NavLink>
        <NavLink to="/trade/inventory/add" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">➕</span>
          Add Vehicle
        </NavLink>
        <NavLink to="/trade/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="icon">👤</span>
          Profile
        </NavLink>
      </nav>

      <div className="trade-sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <span className="icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default TradeSidebar;
