import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTradeDealerContext } from '../context/TradeDealerContext';
import { 
  FaBars, 
  FaTimes, 
  FaHeart, 
  FaUser, 
  FaBuilding
} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { dealer, logout: tradeLogout, isAuthenticated: isTradeAuthenticated } = useTradeDealerContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => {
    setMenuOpen(false);
    setShowAccountDropdown(false);
    setShowTradeDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowAccountDropdown(false);
    navigate('/');
    closeMenu();
  };

  const handleTradeLogout = () => {
    tradeLogout();
    setShowTradeDropdown(false);
    navigate('/');
    closeMenu();
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.account-dropdown-container')) {
      setShowAccountDropdown(false);
    }
    if (!e.target.closest('.trade-dropdown-container')) {
      setShowTradeDropdown(false);
    }
  };

  // Add click outside listener
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }

  const categories = [
    { name: 'Cars', path: '/' },
    { name: 'Bikes', path: '/bikes' },
    { name: 'Vans', path: '/vans' },
  ];

  // Check if current page is a bikes page or vans page
  const isBikesPage = location.pathname.startsWith('/bikes');
  const isVansPage = location.pathname.startsWith('/vans');

  // Determine logo link based on current page
  const logoLink = isBikesPage ? '/bikes' : isVansPage ? '/vans' : '/';

  return (
    <header className="header">
      {/* TOP NAVIGATION - Desktop Only */}
      <div className="top-nav">
        <nav className="top-nav-links">
          <Link to="/" className={`top-nav-link ${!isBikesPage && !isVansPage ? 'active' : ''}`}>Cars</Link>
          <Link to="/bikes" className={`top-nav-link ${isBikesPage ? 'active' : ''}`}>Bikes</Link>
          <Link to="/vans" className={`top-nav-link ${isVansPage ? 'active' : ''}`}>Vans</Link>
        </nav>
      </div>

      {/* MAIN HEADER */}
      <div className="main-header">
        {/* LEFT - Menu (Mobile Only) */}
        <div className="header-left">
          <button 
            className="menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            title="Menu"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* CENTER - LOGO */}
        <Link to={logoLink} className="logo" onClick={closeMenu}>
          <img 
            src="/images/brands/logo.jpeg" 
            alt="CarCatALog" 
            className="logo-img"
          />
        </Link>

        {/* DESKTOP MAIN NAV */}
        <nav className="main-nav">
          {isBikesPage ? (
            <>
              <Link to="/bikes/used-bikes" className="main-nav-link">Used bikes</Link>
              <Link to="/bikes/new-bikes" className="main-nav-link">New bikes</Link>
              <Link to="/bikes/sell-your-bike" className="main-nav-link">Sell your bike</Link>
           
            </>
          ) : isVansPage ? (
            <>
              <Link to="/vans/used-vans" className="main-nav-link">Used vans</Link>
              <Link to="/vans/new-vans" className="main-nav-link">New vans</Link>
              <Link to="/vans/sell-your-van" className="main-nav-link">Sell your van</Link>
             
            </>
          ) : (
            <>
              <Link to="/used-cars" className="main-nav-link">Used cars</Link>
              <Link to="/new-cars" className="main-nav-link">New cars</Link>
              <Link to="/sell-your-car" className="main-nav-link">Sell your car</Link>
              <Link to="/valuation" className="main-nav-link">Value your car</Link>
         
            </>
          )}
        </nav>

        {/* RIGHT - Icons (Saved + Account) */}
        <div className="header-right">
          <Link 
            to="/saved-cars" 
            className="icon-btn saved-btn"
            onClick={closeMenu}
            title="Saved cars"
          >
            <FaHeart size={18} />
            <span className="icon-label">Saved</span>
          </Link>

          {user ? (
            <div className="account-dropdown-container">
              <button 
                className="icon-btn account-btn"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                title="Account"
              >
                <FaUser size={18} />
                <span className="icon-label">{user.name || 'Account'}</span>
              </button>
              {showAccountDropdown && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <span className="account-name">{user.name || user.email}</span>
                    <span className="account-email">{user.email}</span>
                  </div>
                  <div className="account-dropdown-divider" />
                  <Link to="/saved-cars" className="account-dropdown-link" onClick={() => setShowAccountDropdown(false)}>
                    <FaHeart size={14} /> Saved Cars
                  </Link>
                  <button className="account-dropdown-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/signin" 
              className="icon-btn account-btn signin-btn"
              onClick={closeMenu}
              title="Sign in"
            >
              <FaUser size={18} />
              <span className="icon-label">Sign in</span>
            </Link>
          )}

          {isTradeAuthenticated && dealer ? (
            <div className="trade-dropdown-container">
              <button 
                className="icon-btn trade-btn"
                onClick={() => setShowTradeDropdown(!showTradeDropdown)}
                title="Trade Account"
              >
                <FaBuilding size={18} />
                <span className="icon-label">{dealer.businessName || dealer.email}</span>
              </button>
              {showTradeDropdown && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <span className="account-name">{dealer.businessName || dealer.email}</span>
                    <span className="account-email">{dealer.email}</span>
                  </div>
                  <div className="account-dropdown-divider" />
                  <Link to="/trade/dashboard" className="account-dropdown-link" onClick={() => setShowTradeDropdown(false)}>
                    <FaBuilding size={14} /> Dashboard
                  </Link>
                  <button className="account-dropdown-logout" onClick={handleTradeLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/trade/login" 
              className="icon-btn trade-login-btn"
              onClick={closeMenu}
              title="Trade login"
            >
              <FaBuilding size={18} />
              <span className="icon-label">Trade</span>
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div 
          className="mobile-menu-overlay active"
          onClick={closeMenu}
        />
      )}

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <button 
            className="close-menu-btn"
            onClick={closeMenu}
            title="Close menu"
          >
            <FaTimes size={20} />
          </button>
          <span className="mobile-menu-title">Menu</span>
          <div style={{ width: '32px' }} />
        </div>

        {/* CHANNEL SWITCHER - Inside Mobile Menu */}
        <ul className="channel-switcher" role="menu">
          {categories.map((category) => {
            const isActive = category.path === '/bikes' 
              ? isBikesPage 
              : category.path === '/vans' 
                ? isVansPage
                : !isBikesPage && !isVansPage;
            return (
              <li key={category.path} role="none">
                <a
                  href={category.path}
                  role="menuitem"
                  aria-current={isActive ? "true" : "false"}
                  className={isActive ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(category.path);
                    closeMenu();
                  }}
                >
                  {category.name}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mobile-menu-divider" />

        <div className="mobile-menu-section">
          {isBikesPage ? (
            <>
              <Link to="/bikes/used-bikes" className="mobile-menu-link" onClick={closeMenu}>Used bikes</Link>
              <Link to="/bikes/new-bikes" className="mobile-menu-link" onClick={closeMenu}>New bikes</Link>
              <Link to="/bikes/sell-your-bike" className="mobile-menu-link" onClick={closeMenu}>Sell your bike</Link>
              <Link to="/valuation" className="mobile-menu-link" onClick={closeMenu}>Value your bike</Link>
            </>
          ) : isVansPage ? (
            <>
              <Link to="/vans/used-vans" className="mobile-menu-link" onClick={closeMenu}>Used vans</Link>
              <Link to="/vans/new-vans" className="mobile-menu-link" onClick={closeMenu}>New vans</Link>
              <Link to="/vans/sell-your-van" className="mobile-menu-link" onClick={closeMenu}>Sell your van</Link>
              <Link to="/valuation" className="mobile-menu-link" onClick={closeMenu}>Value your van</Link>
            </>
          ) : (
            <>
              <Link to="/used-cars" className="mobile-menu-link" onClick={closeMenu}>Used cars</Link>
              <Link to="/new-cars" className="mobile-menu-link" onClick={closeMenu}>New cars</Link>
              <Link to="/sell-your-car" className="mobile-menu-link" onClick={closeMenu}>Sell your car</Link>
              <Link to="/valuation" className="mobile-menu-link" onClick={closeMenu}>Value your car</Link>
            </>
          )}
        </div>

        <div className="mobile-menu-divider" />

        <div className="mobile-menu-section">
          {isTradeAuthenticated && dealer ? (
            <>
              <Link to="/trade/dashboard" className="mobile-menu-link" onClick={closeMenu}>
                <FaBuilding style={{ marginRight: '8px' }} size={14} />
                {dealer.businessName || dealer.email}
              </Link>
              <button 
                className="mobile-menu-logout"
                onClick={handleTradeLogout}
                style={{ marginTop: '8px' }}
              >
                Logout Trade Account
              </button>
            </>
          ) : (
            <Link to="/trade/login" className="mobile-menu-link" onClick={closeMenu}>
              <FaBuilding style={{ marginRight: '8px' }} size={14} />
              Trade login
            </Link>
          )}
        </div>

        {user && (
          <>
            <div className="mobile-menu-divider" />
            <button 
              className="mobile-menu-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
