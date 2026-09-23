import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lbd_user');
    return saved ? JSON.parse(saved) : {
      uid: 'user-demo-1',
      displayName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      bloodGroup: 'O+',
      city: 'Central City',
      location: 'Central City, NY',
      availability: 'Available',
      totalDonations: 4,
      lastDonationDate: '2026-05-10',
      phone: '+1 (555) 123-9876',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isDonor: true
    };
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName || 'Alex Morgan',
          email: user.email,
          photoUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          bloodGroup: currentUser?.bloodGroup || 'O+',
          city: currentUser?.city || 'Central City',
          location: currentUser?.location || 'Central City, NY',
          availability: currentUser?.availability || 'Available',
          totalDonations: currentUser?.totalDonations || 4,
          lastDonationDate: currentUser?.lastDonationDate || '2026-05-10',
          phone: currentUser?.phone || '+1 (555) 123-9876',
          isDonor: true
        };
        setCurrentUser(userData);
        localStorage.setItem('lbd_user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, extraData = {}) => {
    try {
      if (auth) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: extraData.fullName || 'New Donor',
          ...extraData,
          isDonor: true,
          totalDonations: 0,
          availability: extraData.availability || 'Available'
        };
        setCurrentUser(newUser);
        localStorage.setItem('lbd_user', JSON.stringify(newUser));
        return res.user;
      }
    } catch (err) {
      console.warn("Firebase Auth fallback to local mock login:", err.message);
    }
    
    // Fallback Mock Sign Up
    const mockUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: extraData.fullName || 'New Donor',
      ...extraData,
      isDonor: true,
      totalDonations: 0,
      availability: extraData.availability || 'Available',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    };
    setCurrentUser(mockUser);
    localStorage.setItem('lbd_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const login = async (email, password) => {
    try {
      if (auth) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return res.user;
      }
    } catch (err) {
      console.warn("Firebase Login fallback to mock login:", err.message);
    }

    const mockUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      bloodGroup: 'O+',
      city: 'Central City',
      location: 'Central City, NY',
      availability: 'Available',
      totalDonations: 4,
      lastDonationDate: '2026-05-10',
      phone: '+1 (555) 123-9876',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isDonor: true
    };
    setCurrentUser(mockUser);
    localStorage.setItem('lbd_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const loginWithGoogle = async () => {
    try {
      if (auth && googleProvider) {
        const res = await signInWithPopup(auth, googleProvider);
        return res.user;
      }
    } catch (err) {
      console.warn("Google Auth popup fallback:", err.message);
    }

    const mockGoogleUser = {
      uid: 'google-' + Date.now(),
      email: 'alex.google@example.com',
      displayName: 'Alex Morgan (Google)',
      bloodGroup: 'A+',
      city: 'Central City',
      location: 'Central City, NY',
      availability: 'Available',
      totalDonations: 2,
      lastDonationDate: '2026-06-15',
      phone: '+1 (555) 999-8877',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isDonor: true
    };
    setCurrentUser(mockGoogleUser);
    localStorage.setItem('lbd_user', JSON.stringify(mockGoogleUser));
    return mockGoogleUser;
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Signout error:", err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('lbd_user');
  };

  const updateUserProfile = (updatedFields) => {
    setCurrentUser(prev => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('lbd_user', JSON.stringify(newObj));
      return newObj;
    });
  };

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
