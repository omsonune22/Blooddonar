import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, Calendar, Clock } from 'lucide-react';
import './DonorDetails.css';

export default function DonorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock donor data - would fetch from API using id
  const donor = {
    id: id,
    name: 'Sarah Jenkins',
    bloodGroup: 'O-',
    age: 34,
    gender: 'Female',
    phone: '+1 555-0123',
    lastDonation: 'Jan 15, 2024',
    distance: '2.5 miles away',
    city: 'New York',
    availability: 'Available',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    verified: true
  };

  return (
    <div className="ddetail-page">
      <div className="ddetail-container">
        {/* Back Link */}
        <button className="ddetail-back" onClick={() => navigate('/search')}>
          <ArrowLeft size={16} />
          <span>Back to Donors</span>
        </button>

        {/* Main Card */}
        <div className="ddetail-card">
          {/* Left: Photo + Name + Badges */}
          <div className="ddetail-left">
            <div className="ddetail-photo-wrap">
              <img src={donor.photoUrl} alt={donor.name} className="ddetail-photo" />
              {donor.verified && (
                <div className="ddetail-verified-badge">
                  <CheckCircle size={14} fill="#ffffff" color="#b91c1c" />
                </div>
              )}
            </div>
            <h2 className="ddetail-name">{donor.name}</h2>
            <span className="ddetail-blood-pill">
              <span className="ddetail-blood-icon">●</span> {donor.bloodGroup} Blood
            </span>
            <span className="ddetail-avail-text">
              <CheckCircle size={14} /> Available to Donate
            </span>
          </div>

          {/* Right: Info */}
          <div className="ddetail-right">
            <h3 className="ddetail-info-title">Donor Information</h3>
            <p className="ddetail-location-text">
              <Clock size={14} /> {donor.distance} • {donor.city}
            </p>

            <div className="ddetail-info-grid">
              <div className="ddetail-info-item">
                <span className="ddetail-info-label">AGE</span>
                <span className="ddetail-info-value">{donor.age} years</span>
              </div>
              <div className="ddetail-info-item">
                <span className="ddetail-info-label">GENDER</span>
                <span className="ddetail-info-value">{donor.gender}</span>
              </div>
              <div className="ddetail-info-item">
                <span className="ddetail-info-label">PHONE NUMBER</span>
                <span className="ddetail-info-value">{donor.phone}</span>
              </div>
              <div className="ddetail-info-item">
                <span className="ddetail-info-label">LAST DONATION</span>
                <span className="ddetail-info-value">
                  <Calendar size={13} /> {donor.lastDonation}
                </span>
              </div>
            </div>

            <div className="ddetail-action-btns">
              <a href={`tel:${donor.phone}`} className="ddetail-btn-call">
                <Phone size={16} /> Call Donor
              </a>
              <Link to="/messages" className="ddetail-btn-message">
                <Mail size={16} /> Send Message
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
