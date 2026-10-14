import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Send, ArrowRight, LogOut, ShieldAlert } from 'lucide-react';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const { 
    currentUser, 
    resendVerificationEmail, 
    checkEmailVerification, 
    confirmEmailVerification,
    getCooldownRemaining,
    logout 
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tokenParam = queryParams.get('token');
  const emailParam = queryParams.get('email');

  const targetEmail = emailParam || location.state?.email || currentUser?.email || 'your-email@example.com';

  const [cooldown, setCooldown] = useState(getCooldownRemaining());
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(Boolean(currentUser?.emailVerified));

  // Cooldown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getCooldownRemaining();
      setCooldown(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [getCooldownRemaining]);

  // Handle URL token verification if user clicked direct verification link
  useEffect(() => {
    if (tokenParam && emailParam) {
      confirmEmailVerification(emailParam);
      setIsVerified(true);
      setStatusType('success');
      setStatusMessage('Email verified successfully via security token!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [tokenParam, emailParam, confirmEmailVerification, navigate]);

  // If already verified, allow direct redirect
  useEffect(() => {
    if (currentUser?.emailVerified) {
      setIsVerified(true);
    }
  }, [currentUser]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    try {
      setResending(true);
      const res = await resendVerificationEmail(targetEmail);
      if (res.success) {
        setStatusType('success');
        setStatusMessage(res.message || `Verification link resent to ${targetEmail}`);
        setCooldown(60);
      } else {
        setStatusType('error');
        setStatusMessage(res.message);
        if (res.cooldownRemaining) {
          setCooldown(res.cooldownRemaining);
        }
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage('');
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setIsVerified(true);
        setStatusType('success');
        setStatusMessage('Email verification confirmed! Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatusType('error');
        setStatusMessage('Your email has not been verified yet. Please click the link sent to your inbox, then try again.');
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(err.message || 'Error checking verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleSimulateVerification = () => {
    confirmEmailVerification(targetEmail);
    setIsVerified(true);
    setStatusType('success');
    setStatusMessage('Simulation: Verification link confirmed! Access granted.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="verif-page">
      <div className="verif-card">
        {/* Top Icon */}
        <div className={`verif-icon-wrap ${isVerified ? 'verified' : ''}`}>
          {isVerified ? (
            <CheckCircle size={36} color="#16a34a" />
          ) : (
            <Mail size={36} color="#b91c1c" />
          )}
        </div>

        {/* Title */}
        <h1 className="verif-title">
          {isVerified ? 'Email Verified Successfully!' : 'Verify Your Email Address'}
        </h1>

        <p className="verif-desc">
          {isVerified ? (
            'Your email address has been verified. You now have full access to BloodLink Maharashtra.'
          ) : (
            <>
              We have dispatched a verification link to your registered email address:
              <br />
              <strong className="verif-email-highlight">{targetEmail}</strong>
            </>
          )}
        </p>

        {/* Mandatory Security Banner */}
        {!isVerified && (
          <div className="verif-security-badge">
            <ShieldAlert size={18} className="security-badge-icon" />
            <div>
              <strong>Security Requirement:</strong> Access to the <em>Dashboard</em>, <em>Donor Search</em>, <em>Blood Requests</em>, and <em>Profile</em> is restricted until your email is verified.
            </div>
          </div>
        )}

        {/* Status Alert */}
        {statusMessage && (
          <div className={`verif-status-box ${statusType}`}>
            {statusType === 'success' && <CheckCircle size={18} />}
            {statusType === 'error' && <AlertCircle size={18} />}
            {statusType === 'info' && <Mail size={18} />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="verif-actions">
          {isVerified ? (
            <button 
              type="button" 
              className="verif-btn-primary" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              {/* Check Verification Status */}
              <button 
                type="button" 
                className="verif-btn-primary" 
                onClick={handleCheckStatus}
                disabled={checking}
              >
                {checking ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    I Have Verified My Email
                  </>
                )}
              </button>

              {/* Resend Verification Email with Cooldown */}
              <button 
                type="button" 
                className="verif-btn-outline"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
              >
                {resending ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    Resending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Send size={16} />
                    Resend Email ({cooldown}s cooldown)
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Resend Verification Email
                  </>
                )}
              </button>

              {/* Test Mode Simulator button */}
              <button
                type="button"
                className="verif-btn-simulate"
                onClick={handleSimulateVerification}
                title="Simulate clicking the verification email link for rapid local testing"
              >
                ✓ Click here to confirm email verification (Test / Demo)
              </button>
            </>
          )}
        </div>

        {/* Bottom Options */}
        <div className="verif-footer">
          <button type="button" onClick={handleLogout} className="verif-logout-btn">
            <LogOut size={15} />
            <span>Logout and return to Login</span>
          </button>
          <p className="verif-help-text">
            Didn't receive the email? Check your Spam or Junk folder, or ensure <Link to="/register" className="verif-link">re-registering</Link> with the correct email address.
          </p>
        </div>
      </div>
    </div>
  );
}
