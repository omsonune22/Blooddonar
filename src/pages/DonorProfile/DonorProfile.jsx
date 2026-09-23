import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Settings,
  Shield,
  CheckCircle,
  Pencil,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  MapPin,
  Home,
  Clock,
  Droplets,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import './DonorProfile.css';

export default function DonorProfile() {
  const { currentUser } = useAuth();

  const profileData = {
    name: currentUser?.displayName || 'Dr. Minakshi Pawar',
    bloodGroup: currentUser?.bloodGroup || 'O-',
    availability: currentUser?.availability || 'Available',
    bio: 'Dedicated donor committed to helping those in need. Regular apheresis contributor.',
    email: currentUser?.email || 'sarah.j@example.com',
    phone: currentUser?.phone || '+1 555-0123',
    dob: '05/12/1990',
    gender: 'Female',
    city: currentUser?.city || 'Chatrapati Sambhaji Nagar',
    address: currentUser?.address || 'Mahalaxmi nagar cidco',
    totalDonations: currentUser?.totalDonations || 14,
    livesSaved: 42,
    photoUrl: currentUser?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
  };

  const recentHistory = [
    {
      id: 1,
      type: 'Whole Blood Donation',
      location: 'Central City Blood Center',
      date: 'Jan 15, 2025',
      status: 'Completed'
    }
  ];

  return (
    <div className="profile-page">
      {/* Top Bar */}
      <header className="profile-topbar">
        <span className="profile-brand">LifeStream</span>
        <div className="profile-topbar-actions">
          <button className="profile-topbar-btn"><Bell size={20} /></button>
          <button className="profile-topbar-btn"><Settings size={20} /></button>
          <div className="profile-topbar-avatar">
            <img src={profileData.photoUrl} alt={profileData.name} />
          </div>
        </div>
      </header>

      <div className="profile-content">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-left">
            <div className="profile-photo-wrap">
              <img src={profileData.photoUrl} alt={profileData.name} className="profile-photo" />
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{profileData.name}</h1>
              <div className="profile-badges">
                <span className="profile-blood-badge">
                  <Shield size={12} /> {profileData.bloodGroup}
                </span>
                <span className="profile-avail-badge">
                  <CheckCircle size={12} /> Available to Donate
                </span>
              </div>
              <p className="profile-bio">{profileData.bio}</p>
              <Link to="/profile" className="profile-edit-btn">
                <Pencil size={14} />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
          <div className="profile-header-stats">
            <div className="profile-stat-block">
              <span className="profile-stat-label">TOTAL DONATIONS</span>
              <span className="profile-stat-number red">{profileData.totalDonations}</span>
            </div>
            <div className="profile-stat-divider"></div>
            <div className="profile-stat-block">
              <span className="profile-stat-label">LIVES SAVED</span>
              <span className="profile-stat-number red">{profileData.livesSaved}</span>
            </div>
          </div>
        </div>

        {/* Info Grid: Personal + Location */}
        <div className="profile-info-grid">
          {/* Personal Information */}
          <div className="profile-card">
            <h2 className="profile-card-title">
              <UserIcon size={18} /> Personal Information
            </h2>
            <div className="profile-info-rows">
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">
                  <Mail size={14} /> {profileData.email}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">
                  <Phone size={14} /> {profileData.phone}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Date of Birth</span>
                <span className="profile-info-value">
                  <Calendar size={14} /> {profileData.dob}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Gender</span>
                <span className="profile-info-value">
                  <UserIcon size={14} /> {profileData.gender}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="profile-card">
            <h2 className="profile-card-title">
              <MapPin size={18} className="text-red" /> Location
            </h2>
            <div className="profile-info-rows">
              <div className="profile-info-item">
                <span className="profile-info-label">City</span>
                <span className="profile-info-value">{profileData.city}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{profileData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="profile-card profile-history-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">
              <Clock size={18} className="text-red" /> Recent History
            </h2>
            <Link to="/my-requests" className="profile-view-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="profile-history-list">
            {recentHistory.map((item) => (
              <div key={item.id} className="profile-history-item">
                <div className="profile-history-icon">
                  <Droplets size={18} />
                </div>
                <div className="profile-history-info">
                  <span className="profile-history-type">{item.type}</span>
                  <span className="profile-history-loc">{item.location}</span>
                </div>
                <div className="profile-history-meta">
                  <span className="profile-history-date">{item.date}</span>
                  <span className="profile-history-status">
                    <CheckCircle size={12} /> {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
