import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 12 Separate Pages
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import DonorRegistration from './pages/DonorRegistration/DonorRegistration';
import Dashboard from './pages/Dashboard/Dashboard';
import DonorProfile from './pages/DonorProfile/DonorProfile';
import SearchDonors from './pages/SearchDonors/SearchDonors';
import BloodRequest from './pages/BloodRequest/BloodRequest';
import MyBloodRequests from './pages/MyBloodRequests/MyBloodRequests';
import DonorDetails from './pages/DonorDetails/DonorDetails';
import Messages from './pages/Messages/Messages';
import AboutUs from './pages/AboutUs/AboutUs';
import ContactUs from './pages/ContactUs/ContactUs';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<DonorRegistration />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<DonorProfile />} />
              <Route path="/search" element={<SearchDonors />} />
              <Route path="/request" element={<BloodRequest />} />
              <Route path="/my-requests" element={<MyBloodRequests />} />
              <Route path="/donor/:id" element={<DonorDetails />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
