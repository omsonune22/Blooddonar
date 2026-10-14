import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// 12 Separate Pages + VerifyEmail
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import DonorRegistration from './pages/DonorRegistration/DonorRegistration';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
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
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<DonorRegistration />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Protected Routes (Require Authentication and Verified Email) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DonorProfile />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <SearchDonors />
                  </ProtectedRoute>
                } />
                <Route path="/request" element={
                  <ProtectedRoute>
                    <BloodRequest />
                  </ProtectedRoute>
                } />
                <Route path="/my-requests" element={
                  <ProtectedRoute>
                    <MyBloodRequests />
                  </ProtectedRoute>
                } />
                <Route path="/donor/:id" element={
                  <ProtectedRoute>
                    <DonorDetails />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
