import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Phone,
  Users,
  Crosshair,
  ChevronDown
} from 'lucide-react';
import './SearchDonors.css';

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [donors, setDonors] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const allDonors = [
    {
      id: 'd1',
      name: 'Dr. Minakshi Pawar',
      bloodGroup: 'O-',
      distance: '2.5 miles away',
      availability: 'Available',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'd2',
      name: 'Michael Chen',
      bloodGroup: 'A+',
      distance: '3.1 miles away',
      availability: 'Busy',
      photoUrl: ''
    },
    {
      id: 'd3',
      name: 'Sarah Jenkins',
      bloodGroup: 'B+',
      distance: '4.2 miles away',
      availability: 'Available',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'd4',
      name: 'David Miller',
      bloodGroup: 'O-',
      distance: '5.0 miles away',
      availability: 'Available',
      photoUrl: ''
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/donors')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.donors && data.donors.length > 0) {
          setDonors(data.donors.map(d => ({
            id: d.id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            distance: `${(Math.random() * 8 + 1).toFixed(1)} miles away`,
            availability: d.availability || 'Available',
            photoUrl: d.photoUrl || ''
          })));
        } else {
          setDonors(allDonors);
        }
      })
      .catch(() => setDonors(allDonors));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter logic
    let filtered = [...(donors.length > 0 ? donors : allDonors)];
    if (bloodGroup) {
      filtered = filtered.filter(d => d.bloodGroup === bloodGroup);
    }
    if (onlyAvailable) {
      filtered = filtered.filter(d => d.availability === 'Available');
    }
    setDonors(filtered);
    setVisibleCount(4);
  };

  const displayDonors = donors.length > 0 ? donors : allDonors;
  const filteredDonors = onlyAvailable
    ? displayDonors.filter(d => d.availability === 'Available')
    : displayDonors;
  const visibleDonors = filteredDonors.slice(0, visibleCount);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Search Header */}
        <div className="search-header">
          <h1>Find Nearby Donors</h1>
          <p>Search our network of generous blood donors to find a match.</p>
        </div>

        {/* Search Filters */}
        <form className="search-filters" onSubmit={handleSearch}>
          <div className="search-filter-group">
            <label>Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Any Type</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="search-filter-group search-location-group">
            <label>City / Location</label>
            <div className="search-location-input">
              <input
                type="text"
                placeholder="e.g., cigma hospital"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button type="button" className="search-locate-btn">
                <Crosshair size={18} />
              </button>
            </div>
          </div>

          <button type="submit" className="search-submit-btn">
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>

        {/* Results */}
        <div className="search-results-section">
          <div className="search-results-header">
            <h2><Users size={20} /> Nearby Donors</h2>
            <div className="search-results-controls">
              <label className="search-checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                <span>Only Available Now</span>
              </label>
              <div className="search-sort-wrap">
                <span>Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="distance">Distance</option>
                  <option value="name">Name</option>
                  <option value="bloodGroup">Blood Group</option>
                </select>
              </div>
            </div>
          </div>

          {/* Donor Cards Grid */}
          <div className="search-donors-grid">
            {visibleDonors.map((donor) => (
              <div key={donor.id} className="search-donor-card">
                <div className="search-donor-top">
                  <div className="search-donor-avatar">
                    {donor.photoUrl ? (
                      <img src={donor.photoUrl} alt={donor.name} />
                    ) : (
                      <div className="search-donor-initials">{getInitials(donor.name)}</div>
                    )}
                  </div>
                  <div className="search-donor-info">
                    <span className="search-donor-name">{donor.name}</span>
                    <span className="search-donor-distance">
                      <MapPin size={12} /> {donor.distance}
                    </span>
                  </div>
                  <span className="search-donor-blood-badge">{donor.bloodGroup}</span>
                </div>

                <div className={`search-donor-status ${donor.availability === 'Available' ? 'available' : 'away'}`}>
                  <span className="search-status-dot"></span>
                  {donor.availability === 'Available' ? 'Available Now' : 'Away'}
                </div>

                <div className="search-donor-actions">
                  <button className="search-btn-call">
                    <Phone size={14} /> Call
                  </button>
                  <Link to={`/donor/${donor.id}`} className="search-btn-profile">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < filteredDonors.length && (
            <button
              className="search-load-more"
              onClick={() => setVisibleCount(prev => prev + 4)}
            >
              Load More <ChevronDown size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
