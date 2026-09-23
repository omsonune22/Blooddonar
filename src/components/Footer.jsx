import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="bloodlink-footer">
      <div className="footer-inner-container">
        <div className="footer-left-info">
          <span className="footer-brand-title">BloodLink</span>
          <span className="footer-copyright">
            © 2026 BloodLink. Saving lives through local connection.
          </span>
        </div>

        <div className="footer-right-links">
          <Link to="/about">Privacy Policy</Link>
          <Link to="/about">Terms of Service</Link>
          <Link to="/contact">FAQ</Link>
          <Link to="/contact">Support</Link>
        </div>
      </div>
    </footer>
  );
}
