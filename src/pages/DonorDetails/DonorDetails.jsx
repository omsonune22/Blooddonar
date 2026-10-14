import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, CheckCircle, Calendar, Clock } from 'lucide-react';
import './DonorDetails.css';

export default function DonorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock donors data - resolves according to id, defaulting to Dr. Minakshi Pawar
  const donorsDatabase = {
    d1: {
      id: 'd1',
      name: 'Dr. Minakshi Pawar',
      bloodGroup: 'O+',
      age: 34,
      gender: 'Female',
      phone: '+91 98230 12345',
      lastDonation: 'Apr 12, 2026',
      distance: '2.5 km away',
      city: 'CIDCO, Chhatrapati Sambhajinagar, Maharashtra',
      hospital: 'Cigma Hospital',
      availability: 'Available Now',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Emergency medicine practitioner and regular donor. Ready to respond for urgent cases in Chhatrapati Sambhajinagar.'
    },
    d2: {
      id: 'd2',
      name: 'Rahul Deshmukh',
      bloodGroup: 'A+',
      age: 29,
      gender: 'Male',
      phone: '+91 98220 54321',
      lastDonation: 'Feb 10, 2026',
      distance: '3.1 km away',
      city: 'Garkheda, Chhatrapati Sambhajinagar, Maharashtra',
      hospital: 'MGM Medical Center',
      availability: 'Away',
      photoUrl: '',
      verified: true,
      bio: 'Software engineer and dedicated A+ donor in Chhatrapati Sambhajinagar.'
    },
    d3: {
      id: 'd3',
      name: 'Priya Patil',
      bloodGroup: 'B+',
      age: 26,
      gender: 'Female',
      phone: '+91 98190 11223',
      lastDonation: 'Mar 18, 2026',
      distance: '4.2 km away',
      city: 'Kothrud, Pune, Maharashtra',
      hospital: 'Deenanath Mangeshkar Hospital',
      availability: 'Available Now',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Healthcare researcher and regular voluntary donor in Pune.'
    },
    d4: {
      id: 'd4',
      name: 'Akash Jadhav',
      bloodGroup: 'AB+',
      age: 31,
      gender: 'Male',
      phone: '+91 98900 33445',
      lastDonation: 'Jan 28, 2026',
      distance: '1.8 km away',
      city: 'College Road, Nashik, Maharashtra',
      hospital: 'Apollo Hospitals Nashik',
      availability: 'Available Now',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Active voluntary blood donor and social worker in Nashik.'
    },
    d5: {
      id: 'd5',
      name: 'Sneha Shinde',
      bloodGroup: 'O-',
      age: 28,
      gender: 'Female',
      phone: '+91 98234 56789',
      lastDonation: 'Dec 05, 2025',
      distance: '3.7 km away',
      city: 'Rajarampuri, Kolhapur, Maharashtra',
      hospital: 'Aster Aadhar Hospital',
      availability: 'Available Now',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Universal O- negative donor in Kolhapur.'
    },
    d6: {
      id: 'd6',
      name: 'Aditya Kulkarni',
      bloodGroup: 'B-',
      age: 35,
      gender: 'Male',
      phone: '+91 98500 12345',
      lastDonation: 'Nov 14, 2025',
      distance: '5.0 km away',
      city: 'Baner, Pune, Maharashtra',
      hospital: 'Jupiter Hospital',
      availability: 'Away',
      photoUrl: '',
      verified: true,
      bio: 'Rare B- donor based in Baner, Pune.'
    }
  };

  const donor = donorsDatabase[id] || donorsDatabase['d1'];

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
              {donor.photoUrl ? (
                <img src={donor.photoUrl} alt={donor.name} className="ddetail-photo" />
              ) : (
                <div className="ddetail-photo-placeholder">
                  {donor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              {donor.verified && (
                <div className="ddetail-verified-badge">
                  <CheckCircle size={14} fill="#ffffff" color="#b91c1c" />
                </div>
              )}
            </div>
            <h2 className="ddetail-name">{donor.name}</h2>
            <span className="ddetail-blood-pill">
              <span className="ddetail-blood-icon">🩸</span> {donor.bloodGroup} Blood
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
