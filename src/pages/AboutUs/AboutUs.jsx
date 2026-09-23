import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, ShieldCheck, Lock, Zap } from 'lucide-react';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-hero-text">
            <h1>About Local Blood Donor</h1>
            <p>
              BloodLink bridges the gap between those in urgent need and the generous hearts willing to give. We leverage technology to create a seamless, secure, and rapid connection network, ensuring that life-saving blood reaches hospitals and patients with medical precision and true community care.
            </p>
            <Link to="/search" className="about-hero-btn">Learn How We Work</Link>
          </div>
          <div className="about-hero-image">
            <img src="/bloodlink_hero.png" alt="Give Life. Donate Blood." />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mv-section">
        <div className="about-mv-container">
          <div className="about-mv-card">
            <div className="about-mv-icon">
              <Target size={22} />
            </div>
            <h2>Our Mission</h2>
            <p>
              To save lives by creating the most efficient, transparent, and responsive blood donation network. We empower individuals to become everyday heroes while streamlining the logistics for healthcare providers.
            </p>
          </div>
          <div className="about-mv-card">
            <div className="about-mv-icon">
              <Eye size={22} />
            </div>
            <h2>Our Vision</h2>
            <p>
              A world where no life is ever lost due to a shortage of blood. We envision a universally connected community where the act of giving is celebrated and access to critical resources is immediate.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose BloodLink */}
      <section className="about-why-section">
        <div className="about-why-header">
          <h2>Why Choose BloodLink</h2>
          <p>Our platform is built on trust, security, and speed to ensure the best outcomes for everyone.</p>
        </div>
        <div className="about-why-grid">
          <div className="about-why-card">
            <div className="about-why-icon blue">
              <ShieldCheck size={22} />
            </div>
            <h3>Trusted Donors</h3>
            <p>A verified and reliable community of donors committed to making a difference. Every profile is authenticated.</p>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon gray">
              <Lock size={22} />
            </div>
            <h3>Secure Platform</h3>
            <p>Strict adherence to data privacy and medical standards. Your health information is always protected and confidential.</p>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon red">
              <Zap size={22} />
            </div>
            <h3>Quick Response</h3>
            <p>Real-time alerts for urgent needs in your area. Connect with nearby hospitals instantly when seconds count.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="about-cta">
        <h2>Join our life-saving community today.</h2>
        <p>Every drop counts. Register now to be notified when your blood type is needed nearby.</p>
        <Link to="/register" className="about-cta-btn">Join as a Donor</Link>
      </section>
    </div>
  );
}
