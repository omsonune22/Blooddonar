import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Heart, Eye, EyeOff, AlertCircle, KeyRound, Mail, Send, CheckCircle, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedNotice, setUnverifiedNotice] = useState(null);
  const [resendStatus, setResendStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { 
    login, 
    loginWithGoogle, 
    resendVerificationEmail, 
    getCooldownRemaining 
  } = useAuth();

  const [cooldown, setCooldown] = useState(getCooldownRemaining());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown(getCooldownRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [getCooldownRemaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedNotice(null);
    setResendStatus('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(trimmedEmail, password);

      if (res && res.unverified) {
        // Block protected dashboard access for unverified account
        setUnverifiedNotice({
          email: res.email || trimmedEmail,
          message: 'Email Verification Required: Please verify your email before logging in.'
        });
        return;
      }

      // Success verified login
      const targetDestination = location.state?.from?.pathname || '/dashboard';
      navigate(targetDestination);
    } catch (err) {
      console.warn('Login failure:', err);
      if (err.code === 'auth/user-not-found' || err.message?.includes('No registered account')) {
        setError('No account found with this email. Please check your spelling or register.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please verify your password or use "Forgot Password".');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Invalid credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    const target = unverifiedNotice?.email || email.trim();
    if (!target) return;

    try {
      const res = await resendVerificationEmail(target);
      if (res.success) {
        setResendStatus(`Verification email resent to ${target}.`);
        setCooldown(60);
      } else {
        setResendStatus(res.message);
        if (res.cooldownRemaining) setCooldown(res.cooldownRemaining);
      }
    } catch (err) {
      setResendStatus(err.message || 'Could not resend email.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.warn('Google sign in error:', err);
      setError('Google Sign-in failed. Try logging in with email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setForgotModal(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Heart size={18} fill="#ffffff" color="#ffffff" />
            </div>
            <div className="login-logo-text">
              <span className="logo-text-top">LOCAL</span>
              <span className="logo-text-mid">BLOOD</span>
              <span className="logo-text-bot">DONOR</span>
            </div>
          </div>
          <h1 className="login-title">Welcome Back!</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Unverified Email Warning Alert */}
        {unverifiedNotice && (
          <div className="login-unverified-alert">
            <div className="unverified-alert-top">
              <Mail size={18} className="unverified-icon" />
              <strong>{unverifiedNotice.message}</strong>
            </div>
            <p className="unverified-alert-desc">
              A verification link was sent to <strong>{unverifiedNotice.email}</strong>. 
              Protected access (Dashboard, Donor Search, Requests) is blocked until verified.
            </p>
            {resendStatus && (
              <div className="unverified-resend-status">
                <CheckCircle size={14} />
                <span>{resendStatus}</span>
              </div>
            )}
            <div className="unverified-actions-row">
              <button
                type="button"
                className="btn-unverified-resend"
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                <Send size={14} />
                {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Link'}
              </button>
              <button
                type="button"
                className="btn-unverified-goto"
                onClick={() => navigate('/verify-email', { state: { email: unverifiedNotice.email } })}
              >
                Verify Page <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="donor@bloodlink.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label>Password</label>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="login-forgot-row">
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => setForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        {/* OR Divider */}
        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Google Login */}
        <button onClick={handleGoogleLogin} className="login-google-btn" disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="login-register-link">Register</Link></p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <KeyRound size={24} color="#b91c1c" />
              <h3>Reset Your Password</h3>
            </div>
            {resetSuccess ? (
              <div className="login-modal-success">
                Password reset link has been sent to your email!
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p className="login-modal-desc">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
                <div className="login-field" style={{ marginTop: '16px' }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="login-modal-actions">
                  <button type="button" onClick={() => setForgotModal(false)} className="login-modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="login-modal-send">
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
