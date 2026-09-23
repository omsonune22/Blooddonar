import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Bell, User } from 'lucide-react';
import './MyBloodRequests.css';

export default function MyBloodRequests() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const requests = [
    {
      id: 1,
      bloodGroup: 'O-',
      status: 'active',
      hospital: 'Metro General Hospital',
      location: '123 Health Ave, Downtown',
      neededBy: 'Oct 24',
      unitsRequired: 4,
      donorsFound: 1,
      donorsLabel: 'confirmed'
    },
    {
      id: 2,
      bloodGroup: 'A+',
      status: 'active',
      hospital: "St. Jude's Medical Center",
      location: '456 Healing Way, Westside',
      neededBy: 'Oct 26',
      unitsRequired: 2,
      donorsFound: 0,
      donorsLabel: 'confirmed'
    },
    {
      id: 3,
      bloodGroup: 'B+',
      status: 'completed',
      hospital: 'City Clinic',
      location: '789 Care Blvd, North End',
      completedDate: 'Oct 15',
      unitsRequired: 3,
      donorsFound: 3,
      donorsLabel: 'fulfilled'
    },
    {
      id: 4,
      bloodGroup: 'AB-',
      status: 'cancelled',
      hospital: 'Regional Blood Center',
      location: '321 Donor Rd, Eastside',
      cancelledDate: 'Oct 10',
      unitsRequired: 1,
      donorsFound: 0,
      donorsLabel: '-'
    }
  ];

  const filteredRequests = activeTab === 'all'
    ? requests
    : requests.filter(r => r.status === activeTab);

  return (
    <div className="myreq-page">
      <div className="myreq-container">
        {/* Header */}
        <div className="myreq-header">
          <div>
            <h1>My Requests</h1>
            <p>Manage and track your blood donation requests.</p>
          </div>
          <Link to="/request" className="myreq-new-btn">
            <Plus size={18} />
            <span>New Request</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="myreq-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`myreq-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Request Cards Grid */}
        <div className="myreq-grid">
          {filteredRequests.map(req => (
            <div key={req.id} className={`myreq-card ${req.status}`}>
              {/* Card Top */}
              <div className="myreq-card-top">
                <div className={`myreq-blood-badge ${req.status === 'active' ? 'urgent' : ''}`}>
                  {req.bloodGroup}
                </div>
                <div className="myreq-card-info">
                  <div className="myreq-card-meta">
                    <span className={`myreq-status-tag ${req.status}`}>
                      {req.status.toUpperCase()}
                    </span>
                    <span className="myreq-date-text">
                      <Calendar size={12} />
                      {req.status === 'active' && `Needed by ${req.neededBy}`}
                      {req.status === 'completed' && `Completed ${req.completedDate}`}
                      {req.status === 'cancelled' && `Cancelled ${req.cancelledDate}`}
                    </span>
                  </div>
                  <h3 className="myreq-hospital-name">{req.hospital}</h3>
                  <span className="myreq-location">
                    <MapPin size={12} /> {req.location}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="myreq-stats-row">
                <div className="myreq-stat">
                  <span className="myreq-stat-label">UNITS REQUIRED</span>
                  <span className="myreq-stat-value">
                    <strong>{req.unitsRequired}</strong> {req.unitsRequired === 1 ? 'unit' : 'units'}
                  </span>
                </div>
                <div className="myreq-stat">
                  <span className="myreq-stat-label">DONORS FOUND</span>
                  <span className="myreq-stat-value">
                    <strong>{req.donorsFound}</strong> {req.donorsLabel}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="myreq-card-actions">
                {req.status === 'active' ? (
                  <>
                    <button className="myreq-btn-primary">View Details</button>
                    <button className="myreq-btn-outline">Cancel Request</button>
                  </>
                ) : req.status === 'completed' ? (
                  <button className="myreq-btn-outline full-width">View Summary</button>
                ) : (
                  <button className="myreq-btn-outline full-width">View Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
