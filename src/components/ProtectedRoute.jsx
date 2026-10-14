import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-muted)'
      }}>
        <span>Loading BloodLink Maharashtra...</span>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but unverified -> redirect to verify email page
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" state={{ email: currentUser.email, from: location }} replace />;
  }

  return children;
}
