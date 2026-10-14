import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Droplet, Menu, X, LogOut, LayoutDashboard, Sun, Moon, Bell, User, Mail } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { unreadCount, togglePanel } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/search', label: 'Donors' },
    { path: '/my-requests', label: 'Requests' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className="bloodlink-navbar">
      <div className="navbar-inner-container">
        {/* Logo with Red Blood-Drop Icon */}
        <Link to="/" className="bloodlink-logo" aria-label="BloodLink Home">
          <div className="logo-icon-box">
            <Droplet size={19} fill="#b91c1c" color="#b91c1c" className="logo-droplet-icon" />
          </div>
          <span className="logo-brand-text">BloodLink</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-center-links" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`bloodlink-nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="nav-right-actions">
          {/* Notification Button with Reactive Badge */}
          <button
            type="button"
            className={`btn-nav-icon-link nav-notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={togglePanel}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notification Center"}
            aria-label="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="nav-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Profile Icon */}
          <Link to="/profile" className="btn-nav-icon-link" title="My Profile" aria-label="My Profile">
            <User size={18} />
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun size={19} className="theme-toggle-icon sun-icon" />
            ) : (
              <Moon size={19} className="theme-toggle-icon moon-icon" />
            )}
          </button>

          {currentUser ? (
            <div className="nav-user-logged">
              {currentUser.emailVerified ? (
                <Link to="/dashboard" className="nav-dash-link">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link to="/verify-email" className="nav-unverified-pill" title="Click to verify your email">
                  <Mail size={15} />
                  <span>Verify Email</span>
                </Link>
              )}

              <button onClick={handleLogout} className="btn-nav-logout" title="Logout" aria-label="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-link-login">
                Login
              </Link>
              <Link to="/register" className="btn-pill-register">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="btn-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-item ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Theme Switch Button */}
          <button
            type="button"
            className="mobile-theme-toggle-item"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="mobile-theme-toggle-content">
              {isDark ? <Sun size={18} className="sun-icon" /> : <Moon size={18} className="moon-icon" />}
              <span>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </div>
            <span className="mobile-theme-badge">
              {isDark ? 'Dark active' : 'Light active'}
            </span>
          </button>

          {currentUser ? (
            <div className="mobile-user-box">
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-nav-item">
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn-mobile-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-box">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-link-login text-center">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-pill-register text-center">
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Reactive Notification Panel */}
      <NotificationPanel />
    </header>
  );
}
