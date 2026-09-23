import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/search', label: 'Donors' },
    { path: '/request', label: 'Requests' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header className="bloodlink-navbar">
      <div className="navbar-inner-container">
        {/* Logo */}
        <Link to="/" className="bloodlink-logo">
          <div className="logo-icon-box">
            <Heart size={18} fill="#b91c1c" color="#b91c1c" />
          </div>
          <span className="logo-brand-text">BloodLink</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-center-links">
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
          {currentUser ? (
            <div className="nav-user-logged">
              <Link to="/dashboard" className="nav-dash-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              <button onClick={handleLogout} className="btn-nav-logout" title="Logout">
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
          <button className="btn-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
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
    </header>
  );
}
