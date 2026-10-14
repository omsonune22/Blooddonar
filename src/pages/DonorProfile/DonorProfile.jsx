import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle,
  Pencil,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  MapPin,
  Clock,
  Droplets,
  ArrowRight,
  X,
  AlertCircle,
  PauseCircle
} from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtraDistricts';
import './DonorProfile.css';

export default function DonorProfile() {
  const { currentUser, updateUserProfile, loading } = useAuth();

  // Quick photo presets for easy choice
  const photoPresets = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  ];

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    phone: '',
    dob: '',
    gender: 'Female',
    bloodGroup: 'B+',
    availability: 'Available to Donate',
    city: 'Chhatrapati Sambhajinagar',
    area: 'CIDCO',
    address: 'Pune',
    bio: ''
  });

  // Notifications / feedback
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditModal = () => {
    setFormData({
      name: currentUser?.displayName || 'om sonune',
      photoUrl:
        currentUser?.photoUrl ||
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      phone: currentUser?.phone || '+91 98220 12345',
      dob: currentUser?.dob || '05/12/1990',
      gender: currentUser?.gender || 'Female',
      bloodGroup: currentUser?.bloodGroup || 'B+',
      availability: currentUser?.availability || 'Available to Donate',
      city: currentUser?.city || 'Chhatrapati Sambhajinagar',
      area: currentUser?.area || 'CIDCO',
      address: currentUser?.address || 'Pune',
      bio:
        currentUser?.bio ||
        'Dedicated donor committed to helping those in need. Regular apheresis contributor in Maharashtra.'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Handle unauthenticated state
  if (!loading && !currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-unauth-container">
          <div className="profile-card profile-unauth-card">
            <AlertCircle size={48} className="unauth-icon" />
            <h2>Authentication Required</h2>
            <p>Please log in to your BloodLink account to view and manage your profile.</p>
            <Link to="/login?redirect=/profile" className="profile-btn-login">
              Log In to BloodLink
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Profile data values with fallbacks
  const displayName = currentUser?.displayName || 'om sonune';
  const email = currentUser?.email || 'omsonune1122@gmail.com';
  const phone = currentUser?.phone || '+91 98220 12345';
  const dob = currentUser?.dob || '05/12/1990';
  const gender = currentUser?.gender || 'Female';
  const bloodGroup = currentUser?.bloodGroup || 'B+';
  const availability = currentUser?.availability || 'Available to Donate';
  const isAvailable = availability === 'Available to Donate' || availability === 'Available';
  const city = currentUser?.city || 'Chhatrapati Sambhajinagar';
  const address = currentUser?.address || 'Pune';
  const bio =
    currentUser?.bio ||
    'Dedicated donor committed to helping those in need. Regular apheresis contributor in Maharashtra.';
  const totalDonations =
    currentUser?.totalDonations !== undefined ? currentUser.totalDonations : 14;
  const livesSaved =
    currentUser?.livesSaved !== undefined
      ? currentUser.livesSaved
      : totalDonations > 0
      ? totalDonations * 3
      : 0;
  const photoUrl =
    currentUser?.photoUrl ||
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80';

  // Seeded recent history records for the authenticated user
  const recentHistory = [
    {
      id: 'h1',
      type: 'Whole Blood Donation',
      location: 'Cigma Hospital, Chhatrapati Sambhajinagar',
      date: 'Feb 12, 2026',
      status: 'Completed',
      bloodGroup: bloodGroup
    },
    {
      id: 'h2',
      type: 'Platelet Apheresis',
      location: 'MGM Medical Centre, Chhatrapati Sambhajinagar',
      date: 'Nov 08, 2025',
      status: 'Completed',
      bloodGroup: bloodGroup
    },
    {
      id: 'h3',
      type: 'Whole Blood Donation',
      location: 'Ruby Hall Clinic, Pune, Maharashtra',
      date: 'Aug 15, 2025',
      status: 'Completed',
      bloodGroup: bloodGroup
    }
  ];

  // Quick Toggle Availability
  const handleToggleAvailability = () => {
    const newStatus = isAvailable ? 'Currently Unavailable' : 'Available to Donate';
    updateUserProfile({ availability: newStatus });
    setNotification({
      type: 'success',
      message: `Donor availability updated to "${newStatus}".`
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Edit Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    try {
      setIsSaving(true);
      updateUserProfile({
        displayName: formData.name.trim(),
        photoUrl: formData.photoUrl.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob.trim(),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        availability: formData.availability,
        city: formData.city,
        area: formData.area.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim()
      });

      setIsSaving(false);
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Your profile has been updated successfully.'
      });
      setTimeout(() => setNotification(null), 3500);
    } catch {
      setIsSaving(false);
      setFormError('Failed to save profile changes. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-content">
        {/* Toast / Notification Banner */}
        {notification && (
          <div className={`profile-toast-banner ${notification.type}`}>
            <CheckCircle size={16} />
            <span>{notification.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setNotification(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-left">
            <div className="profile-photo-wrap">
              <img src={photoUrl} alt={displayName} className="profile-photo" />
            </div>

            <div className="profile-header-info">
              <h1 className="profile-name">{displayName}</h1>

              <div className="profile-badges">
                {/* Blood Group Badge */}
                <span className="profile-blood-badge">
                  <span className="badge-drop-icon">🩸</span> {bloodGroup}
                </span>

                {/* Interactive Availability Badge */}
                <button
                  type="button"
                  className={`profile-avail-badge-btn ${isAvailable ? 'available' : 'unavailable'}`}
                  onClick={handleToggleAvailability}
                  title="Click to toggle availability status"
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle size={13} />
                      <span>Available to Donate</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle size={13} />
                      <span>Currently Unavailable</span>
                    </>
                  )}
                </button>
              </div>

              <p className="profile-bio">{bio}</p>

              <button
                type="button"
                className="profile-edit-btn"
                onClick={handleOpenEditModal}
              >
                <Pencil size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Stats on Right (exact design from screenshot) */}
          <div className="profile-header-stats">
            <div className="profile-stat-block">
              <span className="profile-stat-label">TOTAL DONATIONS</span>
              <span className="profile-stat-number red">{totalDonations}</span>
            </div>
            <div className="profile-stat-divider"></div>
            <div className="profile-stat-block">
              <span className="profile-stat-label">LIVES SAVED</span>
              <span className="profile-stat-number red">{livesSaved}</span>
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
                  <Mail size={14} className="info-icon" /> {email}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">
                  <Phone size={14} className="info-icon" /> {phone}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Date Of Birth</span>
                <span className="profile-info-value">
                  <Calendar size={14} className="info-icon" /> {dob}
                </span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Gender</span>
                <span className="profile-info-value">
                  <UserIcon size={14} className="info-icon" /> {gender}
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
                <span className="profile-info-value">{city}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{address}</span>
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

          {recentHistory.length > 0 ? (
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
          ) : (
            <div className="profile-history-empty">
              <Droplets size={32} className="empty-history-icon" />
              <p>No recent donation records found for this account.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="profile-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="profile-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="profile-modal-header">
              <div className="modal-title-wrap">
                <Pencil size={18} className="modal-title-icon" />
                <h3>Edit Profile Information</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="modal-error-banner">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="profile-edit-form">
              <div className="modal-scroll-body">
                {/* Avatar Preview & URL */}
                <div className="form-avatar-section">
                  <div className="form-avatar-preview">
                    <img src={formData.photoUrl || photoPresets[0]} alt="Avatar preview" />
                  </div>
                  <div className="form-avatar-input-col">
                    <label>Profile Picture URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    />
                    <div className="avatar-quick-presets">
                      <span className="presets-label">Preset Avatars:</span>
                      {photoPresets.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          className="avatar-preset-btn"
                          onClick={() => setFormData({ ...formData, photoUrl: url })}
                        >
                          <img src={url} alt={`Preset ${i + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row: Name & Phone */}
                <div className="form-two-col-row">
                  <div className="form-field-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. om sonune"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98220 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row: Date of Birth & Gender */}
                <div className="form-two-col-row">
                  <div className="form-field-group">
                    <label>Date Of Birth</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                  <div className="form-field-group">
                    <label>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Row: Blood Group & Availability */}
                <div className="form-two-col-row">
                  <div className="form-field-group">
                    <label>Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Donor Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({ ...formData, availability: e.target.value })
                      }
                    >
                      <option value="Available to Donate">Available to Donate</option>
                      <option value="Currently Unavailable">Currently Unavailable</option>
                    </select>
                  </div>
                </div>

                {/* Row: Maharashtra City & Area */}
                <div className="form-two-col-row">
                  <div className="form-field-group">
                    <label>Maharashtra City / District</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.division})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field-group">
                    <label>Area / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. CIDCO, Kothrud, Bandra"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="form-field-group">
                  <label>Address / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune or Shivajinagar FC Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Bio */}
                <div className="form-field-group">
                  <label>Profile Bio / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your voluntary donor experience and availability..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="profile-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
