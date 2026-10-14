import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Heart, Eye, EyeOff, AlertCircle, ArrowRight, Mail, CheckCircle, Send, RefreshCw } from 'lucide-react';
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
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { 
    signup, 
    resendVerificationEmail, 
    getCooldownRemaining, 
    checkEmailVerification,
    confirmEmailVerification 
  } = useAuth();
  
  const [cooldown, setCooldown] = useState(getCooldownRemaining());
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown(getCooldownRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [getCooldownRemaining]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const cities = [
    'Pune',
    'Mumbai',
    'Nagpur',
    'Nashik',
    'Chhatrapati Sambhajinagar',
    'Thane',
    'Kolhapur',
    'Solapur',
    'Amravati',
    'Nanded',
    'Sangli',
    'Jalgaon',
    'Akola',
    'Latur',
    'Dhule'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full Name is required.';
    if (!formData.email.trim()) return 'Email Address is required.';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) return 'Phone Number is required.';
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.dateOfBirth) return 'Date of Birth is required.';
    if (!formData.bloodGroup) return 'Please select your blood group.';
    if (!formData.city) return 'Please select your Maharashtra city.';

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendStatus('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const targetEmail = formData.email.trim().toLowerCase();

      await signup(targetEmail, formData.password, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        location: `${formData.city}, Maharashtra`,
        address: formData.address.trim(),
        availability: formData.availableToDonate ? 'Available' : 'Busy'
      });

      // Synchronize with Node.js backend server
      fetch('http://localhost:5000/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: targetEmail,
          phone: formData.phone.trim(),
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          city: formData.city,
          location: `${formData.city}, Maharashtra`,
          address: formData.address.trim(),
          availability: formData.availableToDonate ? 'Available Now' : 'Away',
          verificationStatus: 'Unverified',
          lastDonationDate: new Date().toISOString().split('T')[0]
        })
      }).catch(err => console.warn('Node API connection warning:', err));

      setRegisteredEmail(targetEmail);
      setVerificationSent(true);
      setCooldown(60);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('already exists')) {
        setError('An account with this email address already exists. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Registration failed: ' + (err.message || 'Please check your information.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    try {
      setIsResending(true);
      const res = await resendVerificationEmail(registeredEmail);
      if (res.success) {
        setResendStatus(`Verification email resent to ${registeredEmail}!`);
        setCooldown(60);
      } else {
        setResendStatus(res.message);
        if (res.cooldownRemaining) {
          setCooldown(res.cooldownRemaining);
        }
      }
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setResendStatus('');
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        navigate('/dashboard');
      } else {
        setResendStatus('Email not verified yet. Please check your inbox or click the verification link.');
      }
    } catch (err) {
      setResendStatus('Error verifying status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-reg-page">
      <div className="donor-reg-card">
        {/* Verification Sent Success View */}
        {verificationSent ? (
          <div className="donor-reg-verif-success">
            <div className="donor-reg-logo-icon verif-sent-icon">
              <Mail size={24} color="#b91c1c" />
            </div>
            
            <h1 className="donor-reg-title">Verification Email Sent</h1>
            
            <div className="donor-reg-verif-banner">
              <CheckCircle size={20} className="verif-check-icon" />
              <span>Verification email sent. Please verify your email before logging in.</span>
            </div>

            <p className="donor-reg-verif-desc">
              We have dispatched a verification link to:
              <br />
              <strong className="verif-email-tag">{registeredEmail}</strong>
            </p>

            <p className="donor-reg-security-note">
              🔒 <strong>Email verification required:</strong> Access to the dashboard, donor searches, and blood requests is protected and requires a verified email address.
            </p>

            {resendStatus && (
              <div className="donor-reg-resend-status">
                {resendStatus}
              </div>
            )}

            <div className="donor-reg-verif-actions">
              <button
                type="button"
                className="donor-reg-submit-btn"
                onClick={handleCheckStatus}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin-icon" /> Checking...
                  </>
                ) : (
                  <>I've Verified My Email <ArrowRight size={18} /></>
                )}
              </button>

              <button
                type="button"
                className="donor-reg-resend-btn"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
              >
                <Send size={16} />
                {cooldown > 0 
                  ? `Resend Verification Email (${cooldown}s)`
                  : 'Resend Verification Email'}
              </button>

              {/* Development simulation button */}
              <button
                type="button"
                className="donor-reg-sim-btn"
                onClick={() => {
                  confirmEmailVerification(registeredEmail);
                  setResendStatus('✓ Email verified via local simulation!');
                  setTimeout(() => navigate('/dashboard'), 1200);
                }}
              >
                ✓ Simulate Email Verification (Test Mode)
              </button>
            </div>

            <div className="donor-reg-footer">
              <p>Already verified? <Link to="/login" className="donor-reg-login-link">Go to Login</Link></p>
            </div>
          </div>
        ) : (
          /* Normal Registration Form */
          <>
            {/* Header */}
            <div className="donor-reg-header">
              <div className="donor-reg-logo-icon">
                <Heart size={20} fill="#b91c1c" color="#b91c1c" />
              </div>
              <h1 className="donor-reg-title">Become a Donor</h1>
              <p className="donor-reg-subtitle">
                Join the BloodLink community and help save lives across Maharashtra, India.
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
                    placeholder="Dr. Minakshi Pawar"
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
                    placeholder="minakshi@example.com"
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
                    placeholder="+91 98765 43210"
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
                    <option value="" disabled>Select Maharashtra City</option>
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
                  placeholder="e.g. Flat 402, Shivajinagar, Pune, Maharashtra"
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
                    <span className="toggle-desc-text">Allow hospitals across Maharashtra to contact you for urgent needs.</span>
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
          </>
        )}
      </div>
    </div>
  );
}
