import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  X,
  ShieldCheck,
  Droplet,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import './MyBloodRequests.css';

export default function MyBloodRequests() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [summaryRequest, setSummaryRequest] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Show toast notification
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  }, []);

  // Handle toast from location.state if redirected after creating a request
  useEffect(() => {
    if (location.state?.toastMsg) {
      triggerToast(location.state.toastMsg);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, triggerToast]);

  // Load user's private requests
  const loadUserRequests = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const combinedMap = new Map();

      // 1. Fetch from Express Backend API for this user
      try {
        const res = await fetch(`http://localhost:5000/api/requests?userId=${encodeURIComponent(currentUser.uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.requests)) {
            data.requests.forEach(r => {
              combinedMap.set(r.id, r);
            });
          }
        }
      } catch (apiErr) {
        console.warn('Backend requests API connection fallback:', apiErr);
      }

      // 2. Fetch from Cloud Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'requests'), where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            combinedMap.set(docSnap.id, { id: docSnap.id, ...data });
          });
        } catch (dbErr) {
          console.warn('Firestore user requests fetch fallback:', dbErr);
        }
      }

      // 3. Merge user-scoped local storage cache
      try {
        const storageKey = `bloodlink_requests_${currentUser.uid}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach(r => {
              // Ensure request belongs to current user
              if (r.userId === currentUser.uid && !combinedMap.has(r.id)) {
                combinedMap.set(r.id, r);
              }
            });
          }
        }
      } catch (storageErr) {
        console.warn('LocalStorage requests cache read warning:', storageErr);
      }

      // Convert map to sorted list (newest first)
      const sortedList = Array.from(combinedMap.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setRequests(sortedList);

      // Keep user-scoped localStorage updated
      try {
        localStorage.setItem(`bloodlink_requests_${currentUser.uid}`, JSON.stringify(sortedList));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Unable to load blood requests. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadUserRequests();
  }, [loadUserRequests]);

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const filteredRequests = activeTab === 'all'
    ? requests
    : requests.filter(r => r.status && r.status.toLowerCase() === activeTab.toLowerCase());

  // Confirm Request Cancellation
  const handleConfirmCancel = async () => {
    if (!requestToCancel || !currentUser) return;

    // Security check: Verify request belongs to the authenticated user
    if (requestToCancel.userId && requestToCancel.userId !== currentUser.uid) {
      triggerToast('Error: You can only cancel requests created by your account.');
      setRequestToCancel(null);
      return;
    }

    try {
      setIsCancelling(true);

      const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const todayFull = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      // 1. Backend update
      try {
        await fetch(`http://localhost:5000/api/requests/${requestToCancel.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Cancelled',
            userId: currentUser.uid
          })
        });
      } catch (apiErr) {
        console.warn('Backend update fallback:', apiErr);
      }

      // 2. Firestore update if configured
      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'requests', requestToCancel.id), {
            status: 'Cancelled',
            cancelledDate: todayFormatted,
            cancelledDateFull: todayFull,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore cancel request fallback:', dbErr);
        }
      }

      // 3. Update local state and user-scoped storage
      const updatedList = requests.map(req => {
        if (req.id === requestToCancel.id) {
          return {
            ...req,
            status: 'Cancelled',
            cancelledDate: todayFormatted,
            cancelledDateFull: todayFull,
            donorsLabel: '-',
            updatedAt: new Date().toISOString()
          };
        }
        return req;
      });

      setRequests(updatedList);
      try {
        localStorage.setItem(`bloodlink_requests_${currentUser.uid}`, JSON.stringify(updatedList));
      } catch {
        // ignore
      }

      triggerToast(`Request for ${requestToCancel.hospital || requestToCancel.hospitalName} has been cancelled.`);
      setRequestToCancel(null);
      if (selectedRequest && selectedRequest.id === requestToCancel.id) {
        setSelectedRequest(null);
      }
    } catch (err) {
      triggerToast('Failed to cancel request: ' + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="myreq-page">
      <div className="myreq-container">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="myreq-toast" role="alert">
            <CheckCircle size={18} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="myreq-header">
          <div className="myreq-header-left">
            <h1 className="myreq-main-title">My Requests</h1>
            <p className="myreq-subtitle">
              Manage and track your private blood donation requests in Maharashtra.
            </p>
          </div>
          <Link to="/request" className="myreq-new-btn">
            <Plus size={18} />
            <span>New Request</span>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="myreq-tabs-wrapper">
          <div className="myreq-tabs">
            {tabs.map(tab => {
              const count = tab.id === 'all'
                ? requests.length
                : requests.filter(r => r.status && r.status.toLowerCase() === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`myreq-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="myreq-tab-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="myreq-loading-box">
            <RefreshCw size={28} className="spinner" />
            <p>Loading your blood request history...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="myreq-error-box">
            <AlertCircle size={24} color="#b91c1c" />
            <p>{error}</p>
            <button type="button" className="myreq-btn-primary" onClick={loadUserRequests}>
              Retry Loading
            </button>
          </div>
        )}

        {/* Request Cards Grid */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="myreq-grid">
            {filteredRequests.map(req => {
              const statusStr = (req.status || 'Active').toLowerCase();
              const isActive = statusStr === 'active';
              const isCompleted = statusStr === 'completed';
              const isCancelled = statusStr === 'cancelled';

              return (
                <div 
                  key={req.id} 
                  className={`myreq-card ${isActive ? 'active' : isCompleted ? 'completed' : 'cancelled'}`}
                >
                  {/* Card Top */}
                  <div className="myreq-card-top">
                    {/* Blood Group Circle Badge */}
                    <div className={`myreq-blood-badge ${isActive ? 'active' : 'neutral'}`}>
                      {req.bloodGroup}
                    </div>

                    <div className="myreq-card-info">
                      {/* Status Tag & Date */}
                      <div className="myreq-card-meta">
                        <span className={`myreq-status-tag ${statusStr}`}>
                          {statusStr.toUpperCase()}
                        </span>
                        
                        <span className="myreq-date-text">
                          {isActive && (
                            <>
                              <Clock size={12} className="meta-icon" />
                              <span>Needed by {req.neededBy || req.neededByDate || 'Soon'}</span>
                            </>
                          )}
                          {isCompleted && (
                            <>
                              <Calendar size={12} className="meta-icon" />
                              <span>Completed {req.completedDate || 'Recently'}</span>
                            </>
                          )}
                          {isCancelled && (
                            <>
                              <XCircle size={12} className="meta-icon" />
                              <span>Cancelled {req.cancelledDate || 'Recently'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Hospital Name */}
                      <h3 className="myreq-hospital-name">{req.hospital || req.hospitalName}</h3>

                      {/* Location */}
                      <span className="myreq-location">
                        <MapPin size={13} className="loc-pin-icon" /> 
                        <span>{req.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats Container */}
                  <div className="myreq-stats-row">
                    <div className="myreq-stat">
                      <span className="myreq-stat-label">UNITS REQUIRED</span>
                      <div className="myreq-stat-val-wrap">
                        <span className="stat-big-num">{req.unitsRequired}</span>
                        <span className="stat-unit-text">{req.unitsRequired === 1 ? 'unit' : 'units'}</span>
                      </div>
                    </div>

                    <div className="myreq-stat">
                      <span className="myreq-stat-label">DONORS FOUND</span>
                      <div className="myreq-stat-val-wrap">
                        <span className={`stat-big-num ${isActive && req.donorsFound > 0 ? 'highlight-red' : ''}`}>
                          {req.donorsFound || 0}
                        </span>
                        <span className="stat-unit-text">{req.donorsLabel || 'confirmed'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="myreq-card-actions">
                    {isActive ? (
                      <>
                        <button 
                          type="button"
                          className="myreq-btn-primary"
                          onClick={() => setSelectedRequest(req)}
                        >
                          View Details
                        </button>
                        <button 
                          type="button"
                          className="myreq-btn-outline"
                          onClick={() => setRequestToCancel(req)}
                        >
                          Cancel Request
                        </button>
                      </>
                    ) : isCompleted ? (
                      <button 
                        type="button"
                        className="myreq-btn-outline full-width"
                        onClick={() => setSummaryRequest(req)}
                      >
                        View Summary
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="myreq-btn-outline full-width"
                        onClick={() => setSelectedRequest(req)}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="myreq-empty-state">
            <Droplet size={48} className="empty-state-icon" />
            <h3>No {activeTab !== 'all' ? activeTab : ''} requests found</h3>
            <p>
              {activeTab === 'all'
                ? "You haven't submitted any blood requests yet. Click below to create your first request."
                : `You currently do not have any ${activeTab} blood donation requests in Maharashtra.`}
            </p>
            {activeTab !== 'all' ? (
              <button 
                type="button" 
                className="myreq-btn-primary" 
                onClick={() => setActiveTab('all')}
              >
                View All Requests
              </button>
            ) : (
              <button 
                type="button" 
                className="myreq-btn-primary" 
                onClick={() => navigate('/request')}
              >
                <Plus size={18} />
                Create New Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================================
          MODAL 1: VIEW DETAILS MODAL
         ====================================================================== */}
      {selectedRequest && (
        <div className="myreq-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="myreq-modal" onClick={e => e.stopPropagation()}>
            <div className="myreq-modal-header">
              <div className="modal-title-row">
                <span className={`modal-blood-badge ${selectedRequest.status?.toLowerCase() === 'active' ? 'active' : ''}`}>
                  {selectedRequest.bloodGroup}
                </span>
                <div>
                  <h2>Request Details</h2>
                  <span className="modal-sub-hospital">{selectedRequest.hospital || selectedRequest.hospitalName}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setSelectedRequest(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="myreq-modal-body">
              {/* Authenticated Verification Tag */}
              <div className="modal-notice-tag">
                <ShieldCheck size={14} />
                <span>Verified BloodLink Maharashtra Request (ID: {selectedRequest.id})</span>
              </div>

              {/* Info Grid */}
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="detail-item-label">Status</span>
                  <span className={`myreq-status-tag ${selectedRequest.status?.toLowerCase()}`}>
                    {selectedRequest.status?.toUpperCase()}
                  </span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-item-label">Required Units</span>
                  <span className="detail-item-val"><strong>{selectedRequest.unitsRequired}</strong> Units</span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-item-label">Urgency Priority</span>
                  <span className={`detail-item-val ${selectedRequest.urgency === 'Critical' ? 'highlight-red' : ''}`}>
                    <strong>{selectedRequest.urgency || 'Standard'}</strong>
                  </span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-item-label">Needed By</span>
                  <span className="detail-item-val">
                    {selectedRequest.neededByFull || selectedRequest.neededBy || selectedRequest.requiredDate || 'Not specified'}
                  </span>
                </div>

                <div className="modal-detail-item full-span">
                  <span className="detail-item-label">Hospital & Location</span>
                  <span className="detail-item-val location">
                    <MapPin size={14} className="loc-pin-icon" />
                    {selectedRequest.location}
                  </span>
                </div>

                {selectedRequest.patientName && (
                  <div className="modal-detail-item full-span">
                    <span className="detail-item-label">Patient Name</span>
                    <span className="detail-item-val">{selectedRequest.patientName}</span>
                  </div>
                )}

                {selectedRequest.additionalMessage && (
                  <div className="modal-detail-item full-span">
                    <span className="detail-item-label">Clinical / Requirement Notes</span>
                    <p className="detail-notes-box">{selectedRequest.additionalMessage}</p>
                  </div>
                )}

                <div className="modal-detail-item full-span">
                  <span className="detail-item-label">Created On</span>
                  <span className="detail-item-val">
                    {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="myreq-modal-footer">
              {selectedRequest.status?.toLowerCase() === 'active' && (
                <button 
                  type="button" 
                  className="modal-btn-cancel-req"
                  onClick={() => {
                    setRequestToCancel(selectedRequest);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel Request
                </button>
              )}
              <button 
                type="button" 
                className="modal-btn-close"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 2: CANCEL REQUEST CONFIRMATION
         ====================================================================== */}
      {requestToCancel && (
        <div className="myreq-modal-overlay" onClick={() => setRequestToCancel(null)}>
          <div className="myreq-modal cancel-dialog" onClick={e => e.stopPropagation()}>
            <div className="cancel-dialog-icon">
              <AlertTriangle size={32} />
            </div>

            <h3 className="cancel-dialog-title">Cancel Blood Request?</h3>
            <p className="cancel-dialog-text">
              Are you sure you want to cancel the blood request for <strong>{requestToCancel.hospital || requestToCancel.hospitalName}</strong> ({requestToCancel.bloodGroup})? 
              Donors across Maharashtra will no longer be contacted for this request.
            </p>

            <div className="cancel-dialog-actions">
              <button 
                type="button" 
                className="btn-dialog-keep"
                onClick={() => setRequestToCancel(null)}
                disabled={isCancelling}
              >
                Keep Request
              </button>
              <button 
                type="button" 
                className="btn-dialog-confirm"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 3: VIEW SUMMARY (COMPLETED REQUESTS)
         ====================================================================== */}
      {summaryRequest && (
        <div className="myreq-modal-overlay" onClick={() => setSummaryRequest(null)}>
          <div className="myreq-modal" onClick={e => e.stopPropagation()}>
            <div className="myreq-modal-header">
              <div className="modal-title-row">
                <CheckCircle size={28} className="summary-check-icon" />
                <div>
                  <h2>Donation Request Summary</h2>
                  <span className="modal-sub-hospital">{summaryRequest.hospital || summaryRequest.hospitalName}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setSummaryRequest(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="myreq-modal-body">
              <div className="summary-success-banner">
                <h4>Request Successfully Fulfilled</h4>
                <p>All required units were donated by registered Maharashtra volunteer donors.</p>
              </div>

              <div className="summary-stats-grid">
                <div className="summary-stat-box">
                  <span className="summary-stat-label">Blood Group</span>
                  <span className="summary-stat-val red">{summaryRequest.bloodGroup}</span>
                </div>
                <div className="summary-stat-box">
                  <span className="summary-stat-label">Units Fulfilled</span>
                  <span className="summary-stat-val">{summaryRequest.unitsRequired} / {summaryRequest.unitsRequired} Units</span>
                </div>
                <div className="summary-stat-box">
                  <span className="summary-stat-label">Donors Attended</span>
                  <span className="summary-stat-val">{summaryRequest.donorsFound || summaryRequest.unitsRequired} Verified Donors</span>
                </div>
                <div className="summary-stat-box">
                  <span className="summary-stat-label">Completed Date</span>
                  <span className="summary-stat-val">{summaryRequest.completedDateFull || summaryRequest.completedDate || 'Recently'}</span>
                </div>
              </div>

              <div className="summary-hospital-info">
                <MapPin size={16} className="loc-pin-icon" />
                <div>
                  <strong>{summaryRequest.hospital || summaryRequest.hospitalName}</strong>
                  <p>{summaryRequest.location}</p>
                </div>
              </div>
            </div>

            <div className="myreq-modal-footer">
              <button 
                type="button" 
                className="modal-btn-close full-width"
                onClick={() => setSummaryRequest(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
