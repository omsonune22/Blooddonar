import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import './ContactUs.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send to backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ fullName: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>
          We're here to help. Reach out with any questions, support requests, or partnership inquiries regarding life-saving blood logistics.
        </p>
      </div>

      {/* Content Grid */}
      <div className="contact-container">
        <div className="contact-grid">
          {/* Left: Get in Touch */}
          <div className="contact-info-card">
            <h2>Get in Touch</h2>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="contact-info-label">Phone</span>
                  <span className="contact-info-value">+1 800-BLOOD-LINK</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon email">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="contact-info-label">Email</span>
                  <span className="contact-info-value">support@bloodlink.org</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon location">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="contact-info-label">Address</span>
                  <span className="contact-info-value">123 Health Ave, Medical District, NY</span>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="contact-map">
              <iframe
                title="BloodLink Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.006%2C40.712%2C-73.97%2C40.730&layer=mapnik&marker=40.721%2C-73.988"
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Right: Send a Message */}
          <div className="contact-form-card">
            <h2>Send us a Message</h2>

            {submitted && (
              <div className="contact-success">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-row">
                <div className="contact-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-field">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-field">
                <label>Message</label>
                <textarea
                  name="message"
                  placeholder="Please describe your inquiry in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
