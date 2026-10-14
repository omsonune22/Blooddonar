import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Phone,
  Users,
  Crosshair,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  User as UserIcon
} from 'lucide-react';
import './SearchDonors.css';

// Realistic Maharashtra Demo Donors dataset
const MAHARASHTRA_DEMO_DONORS = [
  {
    id: 'd1',
    name: 'Dr. Minakshi Pawar',
    bloodGroup: 'O+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'CIDCO',
    location: 'CIDCO, Chhatrapati Sambhajinagar',
    hospital: 'Cigma Hospital',
    sampleDistanceKm: 2.5,
    availability: 'Available Now',
    phone: '+91 98230 12345',
    lat: 19.8762,
    lon: 75.3633,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
    bio: 'Emergency medicine practitioner and universal donor. Available for urgent calls in Chhatrapati Sambhajinagar.'
  },
  {
    id: 'd2',
    name: 'Rahul Deshmukh',
    bloodGroup: 'A+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'Garkheda',
    location: 'Garkheda, Chhatrapati Sambhajinagar',
    hospital: 'MGM Medical Center',
    sampleDistanceKm: 3.1,
    availability: 'Away',
    phone: '+91 98220 54321',
    lat: 19.8580,
    lon: 75.3480,
    photoUrl: '', // Uses circle silhouette avatar as shown in screenshot
    bio: 'Software engineer and dedicated blood donor in Chhatrapati Sambhajinagar.'
  },
  {
    id: 'd3',
    name: 'Priya Patil',
    bloodGroup: 'B+',
    city: 'Pune',
    area: 'Kothrud',
    location: 'Kothrud, Pune',
    hospital: 'Deenanath Mangeshkar Hospital',
    sampleDistanceKm: 4.2,
    availability: 'Available Now',
    phone: '+91 98190 11223',
    lat: 18.5074,
    lon: 73.8077,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    bio: 'Healthcare researcher and voluntary donor in Pune.'
  },
  {
    id: 'd4',
    name: 'Akash Jadhav',
    bloodGroup: 'AB+',
    city: 'Nashik',
    area: 'College Road',
    location: 'College Road, Nashik',
    hospital: 'Apollo Hospitals Nashik',
    sampleDistanceKm: 1.8,
    availability: 'Available Now',
    phone: '+91 98900 33445',
    lat: 20.0063,
    lon: 73.7634,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    bio: 'Active voluntary blood donor and social worker in Nashik.'
  },
  {
    id: 'd5',
    name: 'Sneha Shinde',
    bloodGroup: 'O-',
    city: 'Kolhapur',
    area: 'Rajarampuri',
    location: 'Rajarampuri, Kolhapur',
    hospital: 'Aster Aadhar Hospital',
    sampleDistanceKm: 3.7,
    availability: 'Available Now',
    phone: '+91 98234 56789',
    lat: 16.6913,
    lon: 74.2433,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    bio: 'Universal O- negative donor. Available for emergency surgeries in Kolhapur.'
  },
  {
    id: 'd6',
    name: 'Aditya Kulkarni',
    bloodGroup: 'B-',
    city: 'Pune',
    area: 'Baner',
    location: 'Baner, Pune',
    hospital: 'Jupiter Hospital',
    sampleDistanceKm: 5.0,
    availability: 'Away',
    phone: '+91 98500 12345',
    lat: 18.5590,
    lon: 73.7868,
    photoUrl: '', // Silhouette avatar
    bio: 'Rare B- donor based in Baner, Pune.'
  }
];

// Maharashtra location suggestions for quick typing / datalist
const MAHARASHTRA_LOCATIONS = [
  'Chhatrapati Sambhajinagar',
  'CIDCO, Chhatrapati Sambhajinagar',
  'Garkheda, Chhatrapati Sambhajinagar',
  'Pune',
  'Kothrud, Pune',
  'Baner, Pune',
  'Mumbai',
  'Nashik',
  'College Road, Nashik',
  'Nagpur',
  'Kolhapur',
  'Rajarampuri, Kolhapur',
  'Solapur',
  'Amravati',
  'Nanded',
  'Latur',
  'Jalgaon',
  'Ahilyanagar'
];

// Haversine distance formula (in km)
const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState({ bloodGroup: '', location: '' });
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [rawDonors, setRawDonors] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotification, setGpsNotification] = useState(null);

  // Call Modal state
  const [callModalDonor, setCallModalDonor] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Load from backend if available, otherwise use Maharashtra demo donors
  useEffect(() => {
    fetch('http://localhost:5000/api/donors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.donors && data.donors.length > 0) {
          setRawDonors(data.donors);
        } else {
          setRawDonors(MAHARASHTRA_DEMO_DONORS);
        }
      })
      .catch(() => {
        setRawDonors(MAHARASHTRA_DEMO_DONORS);
      });
  }, []);

  // Request browser location and calculate live distance
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotification({
        type: 'error',
        message: 'Geolocation is not supported by your browser. Please search by city or area.'
      });
      return;
    }

    setIsLocating(true);
    setGpsNotification(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserCoords(coords);
        setIsLocating(false);
        setLocationInput('Current Location (GPS Active)');
        setSubmittedQuery((prev) => ({ ...prev, location: '' }));
        setSortBy('distance');
        setGpsNotification({
          type: 'success',
          message: 'GPS location captured! Distances calculated via Haversine formula.'
        });
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Location permission denied. Please enter your Maharashtra city or area manually.';
        if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location unavailable. Please enter your city or area manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please enter your city or area manually.';
        }
        setGpsNotification({
          type: 'warning',
          message: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedQuery({
      bloodGroup: bloodGroup,
      location: locationInput.trim().toLowerCase()
    });
    setVisibleCount(4);
  };

  // Reset filters
  const handleResetFilters = () => {
    setBloodGroup('');
    setLocationInput('');
    setSubmittedQuery({ bloodGroup: '', location: '' });
    setOnlyAvailable(false);
    setUserCoords(null);
    setGpsNotification(null);
    setVisibleCount(4);
  };

  // Process donors with calculated or sample distance
  const processedDonors = useMemo(() => {
    const sourceList = rawDonors.length > 0 ? rawDonors : MAHARASHTRA_DEMO_DONORS;

    return sourceList.map((donor) => {
      let finalDistance = donor.sampleDistanceKm || donor.distanceKm || 2.5;
      let isGpsCalculated = false;

      if (userCoords && donor.lat && donor.lon) {
        finalDistance = calculateHaversineKm(userCoords.lat, userCoords.lon, donor.lat, donor.lon);
        isGpsCalculated = true;
      }

      return {
        ...donor,
        currentDistanceKm: finalDistance,
        isGpsCalculated
      };
    });
  }, [rawDonors, userCoords]);

  // Filter and sort donors
  const filteredDonors = useMemo(() => {
    let result = [...processedDonors];

    // Filter by Blood Group
    if (submittedQuery.bloodGroup) {
      result = result.filter(
        (d) => d.bloodGroup.toLowerCase() === submittedQuery.bloodGroup.toLowerCase()
      );
    }

    // Filter by City / Area / Location
    if (submittedQuery.location && !submittedQuery.location.includes('current location')) {
      const q = submittedQuery.location;
      result = result.filter((d) => {
        const cityMatch = d.city && d.city.toLowerCase().includes(q);
        const areaMatch = d.area && d.area.toLowerCase().includes(q);
        const locationMatch = d.location && d.location.toLowerCase().includes(q);
        const hospitalMatch = d.hospital && d.hospital.toLowerCase().includes(q);
        const nameMatch = d.name && d.name.toLowerCase().includes(q);
        return cityMatch || areaMatch || locationMatch || hospitalMatch || nameMatch;
      });
    }

    // Filter by Availability (Only Available Now)
    if (onlyAvailable) {
      result = result.filter(
        (d) => d.availability === 'Available Now' || d.availability === 'Available'
      );
    }

    // Sort donors
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.currentDistanceKm - b.currentDistanceKm;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'availability') {
        const aAvail = a.availability === 'Available Now' || a.availability === 'Available';
        const bAvail = b.availability === 'Available Now' || b.availability === 'Available';
        if (aAvail === bAvail) return 0;
        return aAvail ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [processedDonors, submittedQuery, onlyAvailable, sortBy]);

  const visibleDonors = filteredDonors.slice(0, visibleCount);

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Search Card Container */}
        <div className="search-card-box">
          <div className="search-header">
            <h1>Find Nearby Donors</h1>
            <p>Search our network of generous blood donors to find a match.</p>
          </div>

          {/* Search Filters Form */}
          <form className="search-filters-form" onSubmit={handleSearchSubmit}>
            <div className="search-filter-col blood-group-col">
              <label htmlFor="blood-group-select">Blood Group</label>
              <div className="search-select-wrapper">
                <select
                  id="blood-group-select"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="">Any Type</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-chevron-icon" />
              </div>
            </div>

            <div className="search-filter-col location-col">
              <label htmlFor="location-input">City / Location</label>
              <div className="search-input-wrapper">
                <input
                  id="location-input"
                  type="text"
                  placeholder="e.g., cigma hospital"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  list="maharashtra-locations"
                />
                <datalist id="maharashtra-locations">
                  {MAHARASHTRA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>

                <button
                  type="button"
                  className={`search-locate-btn ${isLocating ? 'locating' : ''} ${userCoords ? 'gps-active' : ''}`}
                  title={userCoords ? 'GPS Active (Click to refresh)' : 'Use Current Location'}
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 size={18} className="spin-icon" />
                  ) : (
                    <Crosshair size={18} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="search-submit-btn">
              <Search size={18} />
              <span>Search</span>
            </button>
          </form>

          {/* GPS Status Banner */}
          {gpsNotification && (
            <div className={`gps-alert-banner ${gpsNotification.type}`}>
              {gpsNotification.type === 'success' && <CheckCircle size={16} />}
              {gpsNotification.type === 'warning' && <AlertCircle size={16} />}
              {gpsNotification.type === 'error' && <AlertCircle size={16} />}
              <span>{gpsNotification.message}</span>
              <button
                type="button"
                className="gps-alert-close"
                onClick={() => setGpsNotification(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="search-results-section">
          {/* Section Header */}
          <div className="search-results-header">
            <h2 className="nearby-donors-title">
              <Users size={22} className="nearby-users-icon" />
              <span>Nearby Donors</span>
            </h2>

            <div className="search-results-controls">
              <label className="search-checkbox-pill">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                <span>Only Available Now</span>
              </label>

              <div className="search-sort-group">
                <span className="sort-label">Sort:</span>
                <div className="sort-select-wrapper">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort donors"
                  >
                    <option value="distance">Distance</option>
                    <option value="name">Name</option>
                    <option value="availability">Availability</option>
                  </select>
                  <ChevronDown size={14} className="sort-chevron-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Donors Grid */}
          {filteredDonors.length > 0 ? (
            <div className="search-donors-grid">
              {visibleDonors.map((donor) => {
                const isAvailable =
                  donor.availability === 'Available Now' || donor.availability === 'Available';

                return (
                  <div key={donor.id} className="search-donor-card">
                    {/* Top Row: Avatar, Name & Distance, Blood Badge */}
                    <div className="donor-card-top">
                      <div className="donor-avatar-box">
                        {donor.photoUrl ? (
                          <img
                            src={donor.photoUrl}
                            alt={donor.name}
                            className="donor-avatar-img"
                          />
                        ) : (
                          <div className="donor-avatar-placeholder">
                            <UserIcon size={26} className="avatar-silhouette-icon" />
                          </div>
                        )}
                      </div>

                      <div className="donor-identity-box">
                        <h3 className="donor-name">{donor.name}</h3>
                        <div className="donor-distance-row">
                          <MapPin size={13} className="distance-pin-icon" />
                          <span>
                            {donor.currentDistanceKm} km away
                            {donor.isGpsCalculated ? ' (GPS)' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="donor-blood-badge">
                        <span>{donor.bloodGroup}</span>
                      </div>
                    </div>

                    {/* Middle Row: Status Dot & Area */}
                    <div className="donor-card-middle">
                      <div className={`donor-status-pill ${isAvailable ? 'available' : 'away'}`}>
                        <span className="status-indicator-dot"></span>
                        <span className="status-indicator-text">
                          {isAvailable ? 'Available Now' : 'Away'}
                        </span>
                      </div>
                      {donor.area && (
                        <span className="donor-locality-text">
                          {donor.area}, {donor.city}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Call and View Profile Buttons */}
                    <div className="donor-card-actions">
                      <button
                        type="button"
                        className="donor-btn-call"
                        onClick={() => setCallModalDonor(donor)}
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </button>

                      <Link to={`/donor/${donor.id}`} className="donor-btn-profile">
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Friendly Empty State */
            <div className="search-empty-state">
              <div className="empty-icon-wrap">
                <Users size={36} />
              </div>
              <h3>No matching donors found</h3>
              <p>
                No registered Maharashtra donors match your current search criteria. Try selecting
                "Any Type" or searching for locations like Chhatrapati Sambhajinagar, Pune, or Nashik.
              </p>
              <button
                type="button"
                className="btn-reset-search"
                onClick={handleResetFilters}
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filteredDonors.length && (
            <div className="search-load-more-wrap">
              <button
                type="button"
                className="search-load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 4)}
              >
                <span>Load More</span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Donor Demo Modal */}
      {callModalDonor && (
        <div className="donor-modal-overlay" onClick={() => setCallModalDonor(null)}>
          <div
            className="donor-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="donor-modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Phone size={18} />
                </div>
                <div>
                  <h3>Contact Donor</h3>
                  <p>{callModalDonor.name} • {callModalDonor.bloodGroup}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCallModalDonor(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="donor-modal-body">
              <div className="demo-notice-box">
                <AlertCircle size={18} className="demo-notice-icon" />
                <div className="demo-notice-text">
                  <strong>Maharashtra Demo Record</strong>
                  <p>
                    This is a simulated demo profile for demonstration purposes. Direct phone
                    connection is disabled to protect user privacy.
                  </p>
                </div>
              </div>

              <div className="donor-contact-details">
                <div className="contact-row">
                  <span className="contact-label">Location:</span>
                  <span className="contact-value">
                    {callModalDonor.area ? `${callModalDonor.area}, ` : ''}
                    {callModalDonor.city}
                  </span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Hospital / Center:</span>
                  <span className="contact-value">{callModalDonor.hospital || 'District Hospital'}</span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Demo Phone Number:</span>
                  <span className="contact-value phone-number">{callModalDonor.phone}</span>
                </div>
                <div className="contact-row">
                  <span className="contact-label">Distance:</span>
                  <span className="contact-value">
                    {callModalDonor.currentDistanceKm} km away
                  </span>
                </div>
              </div>
            </div>

            <div className="donor-modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setCallModalDonor(null)}
              >
                Close
              </button>
              <a
                href={`tel:${callModalDonor.phone}`}
                className="modal-btn-dial"
                onClick={() => setCallModalDonor(null)}
              >
                <Phone size={14} />
                <span>Test Call ({callModalDonor.phone})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
