import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  RotateCcw,
  Crosshair,
  Search,
  ExternalLink,
  Phone,
  Hospital,
  Droplet,
  Users,
  Compass,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  X
} from 'lucide-react';
import {
  MAHARASHTRA_CENTER,
  MAHARASHTRA_DEFAULT_ZOOM,
  MAHARASHTRA_DISTRICTS
} from '../data/maharashtraDistricts';
import './MaharashtraMap.css';

// Demo registered donors from Maharashtra for optional map overlay
const DEMO_DONORS = [
  {
    id: 'd1',
    name: 'Dr. Minakshi Pawar',
    bloodGroup: 'O+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'CIDCO',
    lat: 19.8762,
    lng: 75.3633,
    availability: 'Available Now'
  },
  {
    id: 'd2',
    name: 'Rahul Deshmukh',
    bloodGroup: 'A+',
    city: 'Chhatrapati Sambhajinagar',
    area: 'Garkheda',
    lat: 19.8580,
    lng: 75.3480,
    availability: 'Away'
  },
  {
    id: 'd3',
    name: 'Priya Patil',
    bloodGroup: 'B+',
    city: 'Pune',
    area: 'Kothrud',
    lat: 18.5074,
    lng: 73.8077,
    availability: 'Available Now'
  },
  {
    id: 'd4',
    name: 'Akash Jadhav',
    bloodGroup: 'AB+',
    city: 'Nashik',
    area: 'College Road',
    lat: 20.0063,
    lng: 73.7634,
    availability: 'Available Now'
  },
  {
    id: 'd5',
    name: 'Sneha Shinde',
    bloodGroup: 'O-',
    city: 'Kolhapur',
    area: 'Rajarampuri',
    lat: 16.6913,
    lng: 74.2433,
    availability: 'Available Now'
  },
  {
    id: 'd6',
    name: 'Aditya Kulkarni',
    bloodGroup: 'B-',
    city: 'Pune',
    area: 'Baner',
    lat: 18.5590,
    lng: 73.7868,
    availability: 'Away'
  }
];

export default function MaharashtraMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const districtMarkersRef = useRef({});
  const donorMarkersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [selectedDistrictId, setSelectedDistrictId] = useState('chhatrapati-sambhajinagar');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [showDonorsOverlay, setShowDonorsOverlay] = useState(true);

  const selectedDistrict = useMemo(() => {
    return (
      MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      MAHARASHTRA_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  // Group districts by Division for clean select options
  const groupedDistricts = useMemo(() => {
    const groups = {};
    MAHARASHTRA_DISTRICTS.forEach((d) => {
      if (!groups[d.division]) groups[d.division] = [];
      groups[d.division].push(d);
    });
    return groups;
  }, []);

  // Filtered districts for search autocomplete
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return MAHARASHTRA_DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.majorHospital.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  // Create custom Leaflet Icons
  const createDistrictIcon = (isSelected) => {
    return L.divIcon({
      className: 'custom-map-marker-wrap',
      html: `
        <div class="custom-district-marker ${isSelected ? 'is-selected' : ''}">
          <div class="marker-pin-outer">
            <div class="marker-pin-inner">
              <span class="marker-drop-symbol">🩸</span>
            </div>
          </div>
          ${isSelected ? '<div class="marker-pulse-ring"></div>' : ''}
        </div>
      `,
      iconSize: isSelected ? [36, 46] : [28, 36],
      iconAnchor: isSelected ? [18, 46] : [14, 36],
      popupAnchor: [0, -38]
    });
  };

  const createDonorIcon = (bloodGroup, isAvailable) => {
    return L.divIcon({
      className: 'custom-donor-marker-wrap',
      html: `
        <div class="custom-donor-pin ${isAvailable ? 'available' : 'away'}">
          <span class="donor-blood-text">${bloodGroup}</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16]
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      className: 'custom-user-marker-wrap',
      html: `
        <div class="custom-user-pin">
          <div class="user-inner-dot"></div>
          <div class="user-sonar-wave"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  };

  // Handle District Selection
  const handleSelectDistrict = (districtId, fly = true) => {
    setSelectedDistrictId(districtId);
    setSearchQuery('');

    const target = MAHARASHTRA_DISTRICTS.find((d) => d.id === districtId);
    if (!target || !mapInstanceRef.current) return;

    // Update marker styling
    Object.entries(districtMarkersRef.current).forEach(([id, marker]) => {
      const isCurrent = id === districtId;
      marker.setIcon(createDistrictIcon(isCurrent));
      if (isCurrent) {
        marker.setZIndexOffset(1000);
      } else {
        marker.setZIndexOffset(0);
      }
    });

    if (fly) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 11, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }

    const currentMarker = districtMarkersRef.current[districtId];
    if (currentMarker) {
      setTimeout(() => {
        currentMarker.openPopup();
      }, 700);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAHARASHTRA_CENTER,
      zoom: MAHARASHTRA_DEFAULT_ZOOM,
      zoomControl: false,
      minZoom: 6,
      maxZoom: 18,
      scrollWheelZoom: true
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | BloodLink Maharashtra',
      maxZoom: 19
    }).addTo(map);

    // Layer group for donors
    donorMarkersGroupRef.current = L.layerGroup().addTo(map);

    // Add district markers
    MAHARASHTRA_DISTRICTS.forEach((district) => {
      const isSelected = district.id === selectedDistrictId;
      const marker = L.marker([district.lat, district.lng], {
        icon: createDistrictIcon(isSelected),
        title: `${district.name} (${district.division})`
      });

      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="popup-header">
            <h4>${district.name}</h4>
            <span class="popup-division-tag">${district.division}</span>
          </div>
          <p class="popup-info-line"><strong>Blood Hub:</strong> ${district.bloodBankHub}</p>
          <p class="popup-info-line"><strong>Main Center:</strong> ${district.majorHospital}</p>
          <div class="popup-footer">
            <span class="popup-donors-badge">${district.activeDonorsCount} Registered Donors</span>
            <span class="popup-status-badge">${district.bloodStockStatus}</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        handleSelectDistrict(district.id, false);
      });

      marker.addTo(map);
      districtMarkersRef.current[district.id] = marker;
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update donor markers overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !donorMarkersGroupRef.current) return;

    donorMarkersGroupRef.current.clearLayers();

    if (showDonorsOverlay) {
      DEMO_DONORS.forEach((donor) => {
        const isAvail = donor.availability === 'Available Now';
        const marker = L.marker([donor.lat, donor.lng], {
          icon: createDonorIcon(donor.bloodGroup, isAvail)
        });

        marker.bindPopup(`
          <div class="map-popup-card donor-popup">
            <div class="popup-header">
              <h4>${donor.name}</h4>
              <span class="popup-blood-badge">${donor.bloodGroup}</span>
            </div>
            <p class="popup-info-line"><strong>Location:</strong> ${donor.area}, ${donor.city}</p>
            <p class="popup-info-line"><strong>Status:</strong> ${donor.availability}</p>
            <div class="popup-demo-disclaimer">Sample Maharashtra Donor</div>
          </div>
        `);

        donorMarkersGroupRef.current.addLayer(marker);
      });
    }
  }, [showDonorsOverlay]);

  // Reset to full Maharashtra View
  const handleShowEntireMaharashtra = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(MAHARASHTRA_CENTER, MAHARASHTRA_DEFAULT_ZOOM, {
      duration: 1.2
    });
    setSearchQuery('');
  };

  // Geolocation API
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setIsLocating(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserCoords(coords);
        setIsLocating(false);
        setGeoStatus({
          type: 'success',
          message: `Location detected (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}). Pin placed on map.`
        });

        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }

          const userMarker = L.marker([coords.lat, coords.lng], {
            icon: createUserIcon(),
            title: 'Your Location'
          }).bindPopup(`
            <div class="map-popup-card user-popup">
              <h4>Your Current Location</h4>
              <p>Lat: ${coords.lat.toFixed(5)}<br/>Lng: ${coords.lng.toFixed(5)}</p>
              <div class="popup-user-tag">GPS Verified</div>
            </div>
          `);

          userMarker.addTo(mapInstanceRef.current);
          userMarkerRef.current = userMarker;

          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 12, {
            duration: 1.2
          });
          userMarker.openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Location permission denied. Please select a Maharashtra city manually.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location coordinates unavailable.';
        if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
        setGeoStatus({ type: 'warning', message: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Directions Link
  const directionsUrl = useMemo(() => {
    if (!selectedDistrict) return '#';
    const dest = `${selectedDistrict.lat},${selectedDistrict.lng}`;
    if (userCoords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${dest}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  }, [selectedDistrict, userCoords]);

  return (
    <section className="explore-maharashtra-section" id="explore-maharashtra">
      <div className="section-head-box">
        <div className="section-badge">
          <Compass size={14} />
          <span>Interactive Statewide Logistics</span>
        </div>
        <h2 className="section-title">Explore Maharashtra</h2>
        <p className="section-subtitle">
          Interactive Blood Logistics & Regional Donor Map across all 36 Districts of Maharashtra, India.
          Select any district, search localities, or trace live route directions.
        </p>
      </div>

      {/* Control Bar */}
      <div className="map-controls-toolbar">
        {/* District Dropdown */}
        <div className="control-field select-field">
          <label htmlFor="maharashtra-city-select">Select City or District</label>
          <div className="custom-select-wrap">
            <select
              id="maharashtra-city-select"
              value={selectedDistrictId}
              onChange={(e) => handleSelectDistrict(e.target.value)}
            >
              {Object.entries(groupedDistricts).map(([division, districts]) => (
                <optgroup key={division} label={division}>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.division})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="control-field search-field">
          <label htmlFor="search-maharashtra-input">Search Location</label>
          <div className="search-box-input-wrap">
            <Search size={16} className="search-input-icon" />
            <input
              id="search-maharashtra-input"
              type="text"
              placeholder="e.g. Pune, Sambhajinagar, Nashik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear"
              >
                <X size={14} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="search-autocomplete-dropdown">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelectDistrict(item.id)}
                  >
                    <MapPin size={14} />
                    <span className="search-res-name">{item.name}</span>
                    <span className="search-res-div">{item.division}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="control-field action-buttons-group">
          <label>&nbsp;</label>
          <div className="btn-toolbar-row">
            <button
              type="button"
              className="btn-map-control btn-overview"
              onClick={handleShowEntireMaharashtra}
              title="Reset to entire Maharashtra view"
            >
              <RotateCcw size={15} />
              <span>Show Entire Maharashtra</span>
            </button>

            <button
              type="button"
              className={`btn-map-control btn-locate ${isLocating ? 'loading' : ''} ${userCoords ? 'active' : ''}`}
              onClick={handleUseMyLocation}
              title="Use GPS current location"
              disabled={isLocating}
            >
              <Crosshair size={15} />
              <span>{isLocating ? 'Detecting...' : userCoords ? 'Location Active' : 'Use My Location'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Feedback Banner */}
      {geoStatus && (
        <div className={`geo-feedback-banner ${geoStatus.type}`}>
          {geoStatus.type === 'success' && <CheckCircle size={16} />}
          {geoStatus.type === 'warning' && <AlertCircle size={16} />}
          {geoStatus.type === 'error' && <AlertCircle size={16} />}
          <span>{geoStatus.message}</span>
          <button
            type="button"
            className="btn-banner-close"
            onClick={() => setGeoStatus(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Map + Info Panel Layout */}
      <div className="map-view-layout">
        {/* Interactive Leaflet Map Container */}
        <div className="map-canvas-container">
          <div ref={mapContainerRef} className="leaflet-map-element" />

          {/* Floating In-Map Zoom Controls */}
          <div className="in-map-floating-controls">
            <button
              type="button"
              className="map-float-btn"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className="map-float-btn"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <Minus size={18} />
            </button>
            <button
              type="button"
              className={`map-float-btn ${showDonorsOverlay ? 'active-layer' : ''}`}
              onClick={() => setShowDonorsOverlay(!showDonorsOverlay)}
              title={showDonorsOverlay ? 'Hide Demo Donor Markers' : 'Show Demo Donor Markers'}
              aria-label="Toggle Donors"
            >
              <Users size={16} />
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="map-legend-pill">
            <span className="legend-item">
              <span className="legend-dot district-dot"></span>
              36 Districts
            </span>
            <span className="legend-item">
              <span className="legend-dot donor-dot"></span>
              Donor Hubs ({showDonorsOverlay ? 'On' : 'Off'})
            </span>
            {userCoords && (
              <span className="legend-item">
                <span className="legend-dot user-dot"></span>
                My GPS
              </span>
            )}
          </div>
        </div>

        {/* Location Information Panel */}
        <div className="location-info-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-division-badge">{selectedDistrict.division} Division</span>
              <h3 className="panel-district-name">{selectedDistrict.name}</h3>
            </div>
            <span className="panel-status-pill">{selectedDistrict.bloodStockStatus}</span>
          </div>

          <div className="panel-body">
            {/* Coordinates Row */}
            <div className="panel-data-item">
              <div className="data-icon-box">
                <Navigation size={16} />
              </div>
              <div className="data-text-group">
                <span className="data-label">Coordinates</span>
                <span className="data-value mono">
                  {selectedDistrict.lat.toFixed(4)}° N, {selectedDistrict.lng.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* Regional Blood Bank Hub */}
            <div className="panel-data-item">
              <div className="data-icon-box red">
                <Droplet size={16} />
              </div>
              <div className="data-text-group">
                <span className="data-label">Regional Blood Centre</span>
                <span className="data-value">{selectedDistrict.bloodBankHub}</span>
              </div>
            </div>

            {/* Major Medical Center */}
            <div className="panel-data-item">
              <div className="data-icon-box">
                <Hospital size={16} />
              </div>
              <div className="data-text-group">
                <span className="data-label">Apex Referral Hospital</span>
                <span className="data-value">{selectedDistrict.majorHospital}</span>
              </div>
            </div>

            {/* Donor Metrics */}
            <div className="panel-data-item">
              <div className="data-icon-box">
                <Users size={16} />
              </div>
              <div className="data-text-group">
                <span className="data-label">Registered Network Donors</span>
                <span className="data-value highlight">
                  {selectedDistrict.activeDonorsCount} Verified Donors Active
                </span>
              </div>
            </div>

            {/* Helpline */}
            <div className="panel-data-item">
              <div className="data-icon-box">
                <Phone size={16} />
              </div>
              <div className="data-text-group">
                <span className="data-label">District Emergency Helpline</span>
                <a href={`tel:${selectedDistrict.emergencyContact}`} className="data-link-phone">
                  {selectedDistrict.emergencyContact}
                </a>
              </div>
            </div>

            {/* Common Blood Groups */}
            <div className="panel-blood-groups-row">
              <span className="blood-groups-label">Key Blood Stock:</span>
              <div className="blood-pills-list">
                {selectedDistrict.keyBloodGroups.map((bg) => (
                  <span key={bg} className="blood-group-tag">
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="panel-footer">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-get-directions"
            >
              <Navigation size={16} />
              <span>Get Directions</span>
              <ExternalLink size={14} className="ext-icon" />
            </a>
          </div>

          {/* Fast-Switch Hub Pills */}
          <div className="quick-switch-strip">
            <span className="quick-switch-label">Major Hubs:</span>
            <div className="quick-pills">
              {['chhatrapati-sambhajinagar', 'pune', 'mumbai', 'nashik', 'nagpur', 'kolhapur'].map(
                (id) => {
                  const d = MAHARASHTRA_DISTRICTS.find((item) => item.id === id);
                  if (!d) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`quick-pill ${selectedDistrictId === id ? 'active' : ''}`}
                      onClick={() => handleSelectDistrict(id)}
                    >
                      {d.name === 'Chhatrapati Sambhajinagar' ? 'Sambhajinagar' : d.name}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
