import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './DonorRegistration.css';

export default function DonorRegistration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodGroup: '',
    dateOfBirth: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
    availableToDonate: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Nagpur', 'Nashik', 'Surat', 'Indore', 'Bhopal'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        location: formData.city,
        address: formData.address,
        availability: formData.availableToDonate ? 'Available' : 'Busy'
      });

      fetch('http://localhost:5000/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          city: formData.city,
          location: formData.city,
          address: formData.address,
          availability: formData.availableToDonate ? 'Available' : 'Busy',
          lastDonationDate: new Date().toISOString().split('T')[0]
        })
      }).catch(err => console.warn('Node API connection warning:', err));

      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-reg-page">
      <div className="donor-reg-card">
        {/* Header */}
        <div className="donor-reg-header">
          <div className="donor-reg-logo-icon">
            <Heart size={20} fill="#b91c1c" color="#b91c1c" />
          </div>
          <h1 className="donor-reg-title">Become a Donor</h1>
          <p className="donor-reg-subtitle">
            Join the BloodLink community and help save lives in your local area.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="donor-reg-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="donor-reg-form">
          {/* Row 1: Full Name + Email */}
          <div className="donor-reg-row">
            <div className="donor-reg-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="donor-reg-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Phone + DOB */}
          <div className="donor-reg-row">
            <div className="donor-reg-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="donor-reg-field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Blood Group + City */}
          <div className="donor-reg-row">
            <div className="donor-reg-field">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Blood Group</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="donor-reg-field">
              <label>City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select City</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Address (full width) */}
          <div className="donor-reg-field full-width">
            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter your full address..."
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Row 5: Password + Confirm Password */}
          <div className="donor-reg-row">
            <div className="donor-reg-field">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="donor-reg-field">
              <label>Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Available to Donate Toggle */}
          <div className="donor-reg-toggle-row">
            <div className="donor-reg-toggle-info">
              <div className="donor-reg-toggle-icon">
                <Heart size={16} fill="#b91c1c" color="#b91c1c" />
              </div>
              <div>
                <span className="toggle-label-text">Available to Donate</span>
                <span className="toggle-desc-text">Allow hospitals to contact you for urgent needs.</span>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={formData.availableToDonate}
                onChange={(e) => setFormData({ ...formData, availableToDonate: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="donor-reg-submit-btn" disabled={loading}>
            {loading ? 'Creating Your Profile...' : (
              <>Register Now <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="donor-reg-footer">
          <p>Already have an account? <Link to="/login" className="donor-reg-login-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
