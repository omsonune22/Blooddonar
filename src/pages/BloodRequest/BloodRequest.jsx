import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, AlertCircle } from 'lucide-react';
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

    if (!formData.patientName || !formData.bloodGroup || !formData.hospitalName || !formData.hospitalLocation || !formData.unitsRequired || !formData.neededByDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const requestPayload = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        hospitalName: formData.hospitalName,
        location: formData.hospitalLocation,
        unitsRequired: parseInt(formData.unitsRequired),
        neededByDate: formData.neededByDate,
        urgency: formData.isEmergency ? 'Critical' : 'Standard',
        message: formData.additionalMessage,
        requesterEmail: currentUser?.email || 'anonymous',
        requesterName: currentUser?.displayName || 'Anonymous'
      };

      await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      navigate('/my-requests');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
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
                placeholder="e.g. Memorial Hospital, New York"
                value={formData.hospitalLocation}
                onChange={handleChange}
                required
              />
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
              <span className="breq-toggle-desc">Mark as critical priority for immediate broadcast</span>
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
