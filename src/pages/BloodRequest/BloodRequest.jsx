import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import './BloodRequest.css';

export default function BloodRequest() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    hospitalName: '',
    hospitalLocation: '',
    unitsRequired: '',
    neededByDate: '',
    isEmergency: false,
    additionalMessage: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.emailVerified) {
      navigate('/verify-email', { state: { email: currentUser.email } });
      return;
    }

    if (!formData.patientName || !formData.bloodGroup || !formData.hospitalName || !formData.hospitalLocation || !formData.unitsRequired || !formData.neededByDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const neededDateObj = new Date(formData.neededByDate);
      const neededMonth = isNaN(neededDateObj.getTime()) ? 'Oct 28' : neededDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const neededFull = isNaN(neededDateObj.getTime()) ? formData.neededByDate : neededDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const reqId = 'req-' + Date.now();
      const unitsNum = parseInt(formData.unitsRequired, 10) || 1;

      const newRequestRecord = {
        id: reqId,
        userId: currentUser.uid,
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        hospital: formData.hospitalName.trim(),
        hospitalName: formData.hospitalName.trim(),
        location: formData.hospitalLocation.trim(),
        unitsRequired: unitsNum,
        donorsFound: 0,
        donorsLabel: 'confirmed',
        neededBy: neededMonth,
        neededByFull: neededFull,
        requiredDate: formData.neededByDate,
        urgency: formData.isEmergency ? 'Critical' : 'Standard',
        emergencyStatus: formData.isEmergency ? 'Critical' : 'Standard',
        additionalMessage: formData.additionalMessage.trim(),
        status: 'Active',
        isSample: false,
        requesterEmail: currentUser.email,
        requesterName: currentUser.displayName || 'BloodLink User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Persist to Cloud Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'requests', reqId), newRequestRecord);
        } catch (dbErr) {
          console.warn('Firestore request save warning:', dbErr);
        }
      }

      // 2. Persist to Express Backend API
      try {
        const response = await fetch('http://localhost:5000/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequestRecord)
        });
        if (!response.ok) {
          console.warn('API returned non-200 code for request creation');
        }
      } catch (apiErr) {
        console.warn('Backend server connection fallback:', apiErr);
      }

      // 3. Persist in user-scoped localStorage for instant offline synchronization
      try {
        const storageKey = `bloodlink_requests_${currentUser.uid}`;
        const stored = localStorage.getItem(storageKey);
        const existingList = stored ? JSON.parse(stored) : [];
        localStorage.setItem(storageKey, JSON.stringify([newRequestRecord, ...existingList]));
      } catch (storageErr) {
        console.warn('Could not save to localStorage', storageErr);
      }

      navigate('/my-requests', {
        state: { 
          toastMsg: `Blood request for ${formData.hospitalName} (${formData.bloodGroup}) submitted successfully!`
        }
      });
    } catch (err) {
      setError('Failed to submit request: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="breq-page">
      <div className="breq-card">
        {/* Header */}
        <div className="breq-header">
          <h1>Request Blood</h1>
          <p>Submit a verified request for blood components. For critical emergencies, please use the urgent toggle.</p>
        </div>

        {/* Unverified Email Warning if accessed somehow */}
        {currentUser && !currentUser.emailVerified && (
          <div className="breq-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={18} />
            <span>
              Your email is unverified. Please verify your email before submitting requests.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="breq-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="breq-form">
          {/* Patient Information */}
          <h2 className="breq-section-title">Patient Information</h2>
          <div className="breq-row">
            <div className="breq-field">
              <label>Patient Name *</label>
              <input
                type="text"
                name="patientName"
                placeholder="e.g. Rahul Sharma"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="breq-field">
              <label>Required Blood Group *</label>
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
          </div>

          {/* Hospital Information */}
          <h2 className="breq-section-title">Hospital Information</h2>
          <div className="breq-field">
            <label>Hospital Name *</label>
            <input
              type="text"
              name="hospitalName"
              placeholder="e.g. Cigma Hospital"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="breq-field">
            <label>Hospital Location / City *</label>
            <div className="breq-location-input">
              <MapPin size={16} className="breq-location-icon" />
              <input
                type="text"
                name="hospitalLocation"
                list="maharashtra-cities-list"
                placeholder="e.g. Ghati Road, Chhatrapati Sambhajinagar, Maharashtra"
                value={formData.hospitalLocation}
                onChange={handleChange}
                required
              />
              <datalist id="maharashtra-cities-list">
                <option value="Chhatrapati Sambhajinagar, Maharashtra" />
                <option value="Pune, Maharashtra" />
                <option value="Mumbai, Maharashtra" />
                <option value="Nashik, Maharashtra" />
                <option value="Nagpur, Maharashtra" />
                <option value="Kolhapur, Maharashtra" />
                <option value="Solapur, Maharashtra" />
                <option value="Amravati, Maharashtra" />
                <option value="Nanded, Maharashtra" />
                <option value="Latur, Maharashtra" />
              </datalist>
            </div>
          </div>

          {/* Request Details */}
          <h2 className="breq-section-title">Request Details</h2>
          <div className="breq-row">
            <div className="breq-field">
              <label>Units Required *</label>
              <input
                type="number"
                name="unitsRequired"
                min="1"
                value={formData.unitsRequired}
                onChange={handleChange}
                required
              />
            </div>
            <div className="breq-field">
              <label>Needed By Date *</label>
              <input
                type="date"
                name="neededByDate"
                value={formData.neededByDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Emergency Toggle */}
          <div className="breq-toggle-row">
            <div className="breq-toggle-info">
              <span className="breq-toggle-label">Emergency / Urgent Request</span>
              <span className="breq-toggle-desc">Mark as critical priority for immediate broadcast across Maharashtra</span>
            </div>
            <label className="breq-toggle-switch">
              <input
                type="checkbox"
                checked={formData.isEmergency}
                onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
              />
              <span className="breq-toggle-slider"></span>
            </label>
          </div>

          {/* Additional Message */}
          <div className="breq-field">
            <label>Additional Message / Instructions</label>
            <textarea
              name="additionalMessage"
              placeholder="Any specific requirements or instructions for donors..."
              value={formData.additionalMessage}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="breq-actions">
            <button type="button" className="breq-cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="breq-submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
