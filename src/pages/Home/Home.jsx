import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, MapPin, BriefcaseMedical, Heart } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [stats, setStats] = useState({
    donors: '5,000+',
    requests: '12,000+',
    livesSaved: '8,500+'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats({
            donors: `${(data.stats.registeredDonors + 3754).toLocaleString()}+`,
            requests: '12,000+',
            livesSaved: `${(data.stats.livesSaved + 4680).toLocaleString()}+`
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bloodlink-home-wrapper">
      {/* Hero Section */}
      <section className="bloodlink-hero-section">
        <div className="bloodlink-hero-container">
          {/* Left Hero Content */}
          <div className="hero-text-content">
            <h1 className="hero-main-title">Donate Blood, Save Lives</h1>
            <p className="hero-description">
              Join our community of heroes. We connect blood donors with those in urgent need, making the gift of life accessible to everyone in our local community.
            </p>

            <div className="hero-cta-group">
              <Link to="/search" className="btn-find-donors">
                <Search size={18} />
                <span>Find Donors</span>
              </Link>

              <Link to="/register" className="btn-register-donor">
                <UserPlus size={18} />
                <span>Register as Donor</span>
              </Link>
            </div>
          </div>

          {/* Right Hero 3D Card Graphic */}
          <div className="hero-graphic-card">
            <div className="graphic-inner-container">
              <img 
                src="/bloodlink_hero.png" 
                alt="Give Life. Donate Blood." 
                className="hero-3d-image" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards Section */}
      <section className="bloodlink-features-section">
        <div className="features-container">
          {/* Card 1 */}
          <div className="feature-item-card">
            <div className="feature-icon-circle">
              <MapPin size={22} className="feature-icon-red" />
            </div>
            <h3>Find Local Donors</h3>
            <p>Quickly search and connect with donors in your area to ensure timely help.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-item-card">
            <div className="feature-icon-circle">
              <BriefcaseMedical size={22} className="feature-icon-red" />
            </div>
            <h3>Request Blood</h3>
            <p>Post an urgent request to our verified donor network and receive immediate support.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-item-card">
            <div className="feature-icon-circle">
              <Heart size={22} className="feature-icon-red" fill="#b91c1c" />
            </div>
            <h3>Save Lives</h3>
            <p>Become a regular donor and make a lasting impact on your local community.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bloodlink-stats-section">
        <div className="stats-container">
          <div className="stat-column">
            <div className="stat-number">{stats.donors}</div>
            <div className="stat-label">Donors</div>
          </div>

          <div className="stat-column">
            <div className="stat-number">{stats.requests}</div>
            <div className="stat-label">Blood Requests</div>
          </div>

          <div className="stat-column">
            <div className="stat-number">{stats.livesSaved}</div>
            <div className="stat-label">Lives Saved</div>
          </div>
        </div>
      </section>
    </div>
  );
}
