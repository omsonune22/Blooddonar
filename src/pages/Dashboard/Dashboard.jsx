import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Search,
  User,
  Droplets,
  Asterisk,
  Mail,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  Users,
  MapPin,
  CheckCircle
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [availability, setAvailability] = useState(
    currentUser?.availability === 'Busy' ? false : true
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleAvailability = () => {
    const next = !availability;
    setAvailability(next);
    updateUserProfile({ availability: next ? 'Available' : 'Busy' });
  };

  const sidebarLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Heart },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/my-requests', label: 'My Donations', icon: Droplets },
    { path: '/request', label: 'Blood Requests', icon: Asterisk },
    { path: '/messages', label: 'Messages', icon: Mail },
    { path: '/profile', label: 'Settings', icon: Settings }
  ];

  const recentRequests = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      bloodGroup: 'O-',
      hospital: 'City General Hospital',
      urgency: 'URGENT'
    },
    {
      id: 2,
      name: 'Michael Chen',
      bloodGroup: 'A+',
      hospital: 'Mercy Medical Center',
      urgency: 'STANDARD'
    },
    {
      id: 3,
      name: 'David Miller',
      bloodGroup: 'O-',
      hospital: 'St. Jude\'s Hospital',
      urgency: 'URGENT'
    }
  ];

  const userName = currentUser?.displayName || 'Om';

  return (
    <div className="dash-layout">
      {/* ===== Left Sidebar ===== */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          {/* Brand */}
          <div className="dash-brand">
            <span className="dash-brand-name">VitalLink</span>
            <span className="dash-brand-sub">Donor Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="dash-nav">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && item.label === 'Dashboard';
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`dash-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="dash-sidebar-bottom">
          <Link to="/request" className="dash-donate-btn">
            <Heart size={18} />
            <span>Donate Now</span>
          </Link>
          <button className="dash-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="dash-main">
        {/* Top Bar */}
        <header className="dash-topbar">
          <div className="dash-search-box">
            <Search size={18} className="dash-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="dash-topbar-actions">
            <button className="dash-topbar-icon-btn">
              <Bell size={20} />
            </button>
            <button className="dash-topbar-icon-btn">
              <HelpCircle size={20} />
            </button>
            <div className="dash-topbar-avatar">
              <img
                src={currentUser?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                alt={userName}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dash-content">
          {/* Welcome */}
          <div className="dash-welcome">
            <h1>Welcome back, {userName} !</h1>
            <p>Your contributions have saved <strong>12 lives</strong>.</p>
          </div>

          {/* Stat Cards */}
          <div className="dash-stats-row">
            <div className="dash-stat-card">
              <div className="dash-stat-icon red">
                <Heart size={20} fill="#b91c1c" color="#b91c1c" />
              </div>
              <span className="dash-stat-label">TOTAL DONATIONS</span>
              <span className="dash-stat-value">{currentUser?.totalDonations || 4}</span>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon green">
                <Droplets size={20} />
              </div>
              <span className="dash-stat-label">REQUESTS HELPED</span>
              <span className="dash-stat-value">7</span>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon gray">
                <RefreshCw size={20} />
              </div>
              <span className="dash-stat-label">TOTAL BLOOD DONATED</span>
              <span className="dash-stat-value">1500<sub>ml</sub></span>
            </div>
          </div>

          {/* Bottom Grid: Requests + Sidebar Cards */}
          <div className="dash-bottom-grid">
            {/* Recent Blood Requests */}
            <div className="dash-card dash-requests-card">
              <div className="dash-card-header">
                <h2>Recent Blood Requests</h2>
                <Link to="/my-requests" className="dash-view-all">View All</Link>
              </div>
              <div className="dash-requests-list">
                {recentRequests.map((req) => (
                  <div key={req.id} className="dash-request-item">
                    <div className="dash-request-left">
                      <div className={`dash-blood-badge ${req.urgency === 'URGENT' ? 'urgent' : ''}`}>
                        {req.bloodGroup}
                      </div>
                      <div className="dash-request-info">
                        <span className="dash-request-name">{req.name}</span>
                        <span className="dash-request-hospital">
                          <MapPin size={12} /> {req.hospital}
                        </span>
                      </div>
                    </div>
                    <div className="dash-request-actions">
                      <span className={`dash-urgency-tag ${req.urgency.toLowerCase()}`}>
                        {req.urgency}
                      </span>
                      <button className={`dash-action-btn ${req.urgency === 'URGENT' ? 'respond' : 'details'}`}>
                        {req.urgency === 'URGENT' ? 'Respond' : 'Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="dash-right-col">
              {/* Availability Status */}
              <div className="dash-card dash-avail-card">
                <h2>Availability Status</h2>
                <div className="dash-avail-content">
                  <div className="dash-avail-info">
                    <span className="dash-avail-title">Available to donate</span>
                    <span className="dash-avail-desc">Last donation: 4 months ago</span>
                  </div>
                  <label className="dash-toggle-switch">
                    <input
                      type="checkbox"
                      checked={availability}
                      onChange={toggleAvailability}
                    />
                    <span className="dash-toggle-slider">
                      {availability && <CheckCircle size={14} className="dash-toggle-check" />}
                    </span>
                  </label>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dash-card dash-quick-card">
                <h2>Quick Actions</h2>
                <div className="dash-quick-list">
                  <Link to="/profile" className="dash-quick-item">
                    <div className="dash-quick-item-left">
                      <RefreshCw size={16} />
                      <span>Update Availability</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/my-requests" className="dash-quick-item">
                    <div className="dash-quick-item-left">
                      <ClipboardList size={16} />
                      <span>View All Requests</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/search" className="dash-quick-item">
                    <div className="dash-quick-item-left">
                      <Users size={16} />
                      <span>Invite Friends</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
