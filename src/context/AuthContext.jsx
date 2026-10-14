import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured 
} from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendEmailVerification,
  reload,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();
export { useAuth } from './useAuth';

const RESEND_COOLDOWN_MS = 60000; // 60 seconds cooldown

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lbd_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [lastVerificationSent, setLastVerificationSent] = useState(() => {
    const saved = localStorage.getItem('lbd_last_verif_sent');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Keep references to prevent recreating action callbacks
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const lastVerificationSentRef = useRef(lastVerificationSent);
  useEffect(() => {
    lastVerificationSentRef.current = lastVerificationSent;
  }, [lastVerificationSent]);

  // Keep local registered accounts in sync for fallback / demo testing
  const getRegisteredAccounts = useCallback(() => {
    try {
      const stored = localStorage.getItem('lbd_registered_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const saveRegisteredAccounts = useCallback((accounts) => {
    try {
      localStorage.setItem('lbd_registered_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save registered accounts', e);
    }
  }, []);

  // Listen to Firebase auth changes when configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profileData = {};

        // Attempt to fetch profile from Cloud Firestore
        if (db) {
          try {
            const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (docSnap.exists()) {
              profileData = docSnap.data();
            }
          } catch (err) {
            console.warn('Firestore profile fetch warning:', err);
          }
        }

        // Check local profile cache
        if (Object.keys(profileData).length === 0) {
          try {
            const cached = localStorage.getItem(`lbd_profile_${firebaseUser.uid}`);
            if (cached) {
              profileData = JSON.parse(cached);
            }
          } catch {
            // cache miss
          }
        }

        const userData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || profileData.displayName || profileData.fullName || 'BloodLink User',
          email: firebaseUser.email,
          emailVerified: Boolean(firebaseUser.emailVerified),
          photoUrl: firebaseUser.photoURL || profileData.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
          bloodGroup: profileData.bloodGroup || 'O+',
          city: profileData.city || 'Pune',
          area: profileData.area || '',
          address: profileData.address || '',
          location: profileData.location || `${profileData.city || 'Pune'}, Maharashtra`,
          availability: profileData.availability || 'Available',
          totalDonations: profileData.totalDonations || 0,
          livesSaved: profileData.livesSaved || 0,
          lastDonationDate: profileData.lastDonationDate || '',
          phone: profileData.phone || '',
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || 'Not specified',
          bio: profileData.bio || '',
          isDonor: true
        };

        setCurrentUser(userData);
        localStorage.setItem('lbd_user', JSON.stringify(userData));
        localStorage.setItem(`lbd_profile_${firebaseUser.uid}`, JSON.stringify(userData));
      } else {
        // Only clear if we were not using mock user
        const saved = localStorage.getItem('lbd_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.isFirebaseUser) {
            setCurrentUser(null);
            localStorage.removeItem('lbd_user');
          }
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 1. Mandatory Email Verification Signup
  const signup = useCallback(async (email, password, extraData = {}) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // A) If Firebase Auth is configured
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      
      if (extraData.fullName) {
        try {
          await updateProfile(res.user, { displayName: extraData.fullName });
        } catch {
          // ignore
        }
      }

      // Send Firebase Email Verification link
      await sendEmailVerification(res.user);
      const sentTime = Date.now();
      setLastVerificationSent(sentTime);
      localStorage.setItem('lbd_last_verif_sent', sentTime.toString());

      const profileObj = {
        uid: res.user.uid,
        email: trimmedEmail,
        displayName: extraData.fullName || 'BloodLink User',
        fullName: extraData.fullName || 'BloodLink User',
        ...extraData,
        city: extraData.city || 'Pune',
        location: extraData.location || `${extraData.city || 'Pune'}, Maharashtra`,
        emailVerified: false,
        isDonor: true,
        totalDonations: 0,
        availability: extraData.availability || 'Available',
        photoUrl: extraData.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        isFirebaseUser: true
      };

      // Save to Firestore if available
      if (db) {
        try {
          await setDoc(doc(db, 'users', res.user.uid), profileObj);
        } catch (dbErr) {
          console.warn('Firestore save warning:', dbErr);
        }
      }

      // Cache profile locally
      localStorage.setItem(`lbd_profile_${res.user.uid}`, JSON.stringify(profileObj));

      // Note: User is initially unverified (emailVerified = false)
      const userState = { ...profileObj, emailVerified: false };
      setCurrentUser(userState);
      localStorage.setItem('lbd_user', JSON.stringify(userState));

      return { user: res.user, emailVerified: false, email: trimmedEmail };
    }

    // B) BloodLink Local Engine (when Firebase credentials in .env are placeholder)
    const accounts = getRegisteredAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      const err = new Error('An account with this email already exists. Please log in.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const newUid = 'user-' + Date.now();
    const sentTime = Date.now();
    const verificationToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    const newAccount = {
      uid: newUid,
      email: trimmedEmail,
      displayName: extraData.fullName || 'BloodLink User',
      fullName: extraData.fullName || 'BloodLink User',
      password, // retained in local accounts for simulated verification login
      ...extraData,
      city: extraData.city || 'Pune',
      location: extraData.location || `${extraData.city || 'Pune'}, Maharashtra`,
      emailVerified: false,
      verificationToken,
      verificationSentAt: sentTime,
      isDonor: true,
      totalDonations: 0,
      availability: extraData.availability || 'Available',
      photoUrl: extraData.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    saveRegisteredAccounts([newAccount, ...accounts]);
    localStorage.setItem(`lbd_profile_${newUid}`, JSON.stringify(newAccount));
    localStorage.setItem('lbd_last_verif_sent', sentTime.toString());
    setLastVerificationSent(sentTime);

    // Set unverified user state so the verification view has their context
    const userState = { ...newAccount, emailVerified: false };
    delete userState.password;
    setCurrentUser(userState);
    localStorage.setItem('lbd_user', JSON.stringify(userState));

    return { user: userState, emailVerified: false, email: trimmedEmail, verificationToken };
  }, [getRegisteredAccounts, saveRegisteredAccounts]);

  // 2. Login Flow with Email Verification Check
  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // A) Firebase Auth
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // Reload user from Firebase to fetch the authoritative emailVerified status
      await reload(res.user);

      if (!res.user.emailVerified) {
        // User has not verified their email
        const unverifiedUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || 'BloodLink User',
          emailVerified: false,
          isFirebaseUser: true
        };
        setCurrentUser(unverifiedUser);
        localStorage.setItem('lbd_user', JSON.stringify(unverifiedUser));
        return { unverified: true, email: res.user.email, user: res.user };
      }

      // Verified user: load profile and allow access
      let profileData = {};
      if (db) {
        try {
          const docSnap = await getDoc(doc(db, 'users', res.user.uid));
          if (docSnap.exists()) profileData = docSnap.data();
        } catch {
          // ignore
        }
      }

      if (Object.keys(profileData).length === 0) {
        try {
          const cached = localStorage.getItem(`lbd_profile_${res.user.uid}`);
          if (cached) profileData = JSON.parse(cached);
        } catch {
          // ignore
        }
      }

      const verifiedUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || profileData.displayName || 'BloodLink User',
        ...profileData,
        emailVerified: true,
        isFirebaseUser: true
      };

      setCurrentUser(verifiedUser);
      localStorage.setItem('lbd_user', JSON.stringify(verifiedUser));
      return { unverified: false, emailVerified: true, user: verifiedUser };
    }

    // B) Local Engine
    const accounts = getRegisteredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === trimmedEmail);

    if (!account) {
      const err = new Error('No registered account found with this email. Please register first.');
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (account.password && account.password !== password) {
      const err = new Error('Incorrect password. Please try again.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    if (!account.emailVerified) {
      // Unverified account
      const unverifiedState = { ...account, emailVerified: false };
      delete unverifiedState.password;
      setCurrentUser(unverifiedState);
      localStorage.setItem('lbd_user', JSON.stringify(unverifiedState));
      return { unverified: true, email: account.email, user: unverifiedState };
    }

    // Verified account
    const verifiedState = { ...account, emailVerified: true };
    delete verifiedState.password;
    setCurrentUser(verifiedState);
    localStorage.setItem('lbd_user', JSON.stringify(verifiedState));
    return { unverified: false, emailVerified: true, user: verifiedState };
  }, [getRegisteredAccounts]);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    }

    const mockGoogleUser = {
      uid: 'google-' + Date.now(),
      email: 'minakshi.google@example.com',
      displayName: 'Dr. Minakshi Pawar (Google)',
      emailVerified: true, // Google Auth accounts are email-verified by Google
      bloodGroup: 'O-',
      city: 'Pune',
      location: 'Pune, Maharashtra, India',
      availability: 'Available',
      totalDonations: 4,
      lastDonationDate: '2026-06-15',
      phone: '+91 98230 12345',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      isDonor: true
    };
    setCurrentUser(mockGoogleUser);
    localStorage.setItem('lbd_user', JSON.stringify(mockGoogleUser));
    return mockGoogleUser;
  }, []);

  // 3. Resend Verification Email with Cooldown
  const resendVerificationEmail = useCallback(async (targetEmail) => {
    const cur = currentUserRef.current;
    const emailToUse = (targetEmail || cur?.email || '').trim().toLowerCase();
    const now = Date.now();
    const timeSinceLast = now - lastVerificationSentRef.current;

    if (timeSinceLast < RESEND_COOLDOWN_MS) {
      const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLast) / 1000);
      return {
        success: false,
        cooldownRemaining: remainingSec,
        message: `Please wait ${remainingSec} second${remainingSec === 1 ? '' : 's'} before resending verification email.`
      };
    }

    if (isFirebaseConfigured && auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setLastVerificationSent(now);
      localStorage.setItem('lbd_last_verif_sent', now.toString());
      return { success: true, message: `Verification email resent to ${emailToUse}.` };
    }

    // Local engine
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex(a => a.email.toLowerCase() === emailToUse);
    if (idx !== -1) {
      accounts[idx].verificationSentAt = now;
      accounts[idx].verificationToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      saveRegisteredAccounts(accounts);
    }

    setLastVerificationSent(now);
    localStorage.setItem('lbd_last_verif_sent', now.toString());
    return { success: true, message: `Verification email resent to ${emailToUse}.` };
  }, [getRegisteredAccounts, saveRegisteredAccounts]);

  // 4. Check Verification Status & Refresh Auth State
  const checkEmailVerification = useCallback(async () => {
    const cur = currentUserRef.current;
    if (isFirebaseConfigured && auth && auth.currentUser) {
      await reload(auth.currentUser);
      const isVerified = Boolean(auth.currentUser.emailVerified);
      if (isVerified && cur) {
        const updated = { ...cur, emailVerified: true };
        setCurrentUser(updated);
        localStorage.setItem('lbd_user', JSON.stringify(updated));
      }
      return isVerified;
    }

    // Local engine
    if (cur?.email) {
      const accounts = getRegisteredAccounts();
      const account = accounts.find(a => a.email.toLowerCase() === cur.email.toLowerCase());
      if (account && account.emailVerified) {
        const updated = { ...cur, emailVerified: true };
        setCurrentUser(updated);
        localStorage.setItem('lbd_user', JSON.stringify(updated));
        return true;
      }
    }

    return Boolean(cur?.emailVerified);
  }, [getRegisteredAccounts]);

  // 5. Confirm / Complete Email Verification (For test links or direct verification)
  const confirmEmailVerification = useCallback((emailToVerify) => {
    const cur = currentUserRef.current;
    const target = (emailToVerify || cur?.email || '').trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    let updated = false;

    const newAccounts = accounts.map(acc => {
      if (acc.email.toLowerCase() === target) {
        updated = true;
        return { ...acc, emailVerified: true };
      }
      return acc;
    });

    if (updated) {
      saveRegisteredAccounts(newAccounts);
    }

    if (cur && cur.email?.toLowerCase() === target) {
      const updatedUser = { ...cur, emailVerified: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('lbd_user', JSON.stringify(updatedUser));
      if (cur.uid) {
        localStorage.setItem(`lbd_profile_${cur.uid}`, JSON.stringify(updatedUser));
      }
    }

    return true;
  }, [getRegisteredAccounts, saveRegisteredAccounts]);

  // Logout
  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Signout error:", err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('lbd_user');
  }, []);

  // Update profile
  const updateUserProfile = useCallback(async (updatedFields) => {
    const cur = currentUserRef.current;
    if (!cur) return;

    // Never allow client to tamper with emailVerified or uid via profile edits
    const safeFields = { ...updatedFields };
    delete safeFields.emailVerified;
    delete safeFields.uid;

    const newObj = { ...cur, ...safeFields };
    setCurrentUser(newObj);
    localStorage.setItem('lbd_user', JSON.stringify(newObj));

    if (newObj.uid) {
      localStorage.setItem(`lbd_profile_${newObj.uid}`, JSON.stringify(newObj));
    }

    // Sync with registered accounts list for local engine
    try {
      const accounts = getRegisteredAccounts();
      const updatedAccounts = accounts.map(acc => {
        if (acc.uid === cur.uid || (acc.email && acc.email.toLowerCase() === cur.email?.toLowerCase())) {
          return { ...acc, ...safeFields };
        }
        return acc;
      });
      saveRegisteredAccounts(updatedAccounts);
    } catch (e) {
      console.warn('Error syncing updated profile with registered accounts:', e);
    }

    // Sync availability to Express backend if availability was changed
    if (safeFields.availability) {
      try {
        await fetch('http://localhost:5000/api/donors/availability', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: cur.uid,
            email: cur.email,
            availability: safeFields.availability
          })
        });
      } catch (backendErr) {
        console.warn('Backend donor availability sync warning:', backendErr);
      }
    }

    // Firestore update if configured
    if (isFirebaseConfigured && db && cur.uid) {
      try {
        await setDoc(doc(db, 'users', cur.uid), newObj, { merge: true });
      } catch (err) {
        console.warn('Firestore update warning:', err);
      }
    }

    return newObj;
  }, [getRegisteredAccounts, saveRegisteredAccounts]);

  const getCooldownRemaining = useCallback(() => {
    const now = Date.now();
    const timeSinceLast = now - lastVerificationSentRef.current;
    if (timeSinceLast < RESEND_COOLDOWN_MS) {
      return Math.ceil((RESEND_COOLDOWN_MS - timeSinceLast) / 1000);
    }
    return 0;
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resendVerificationEmail,
    checkEmailVerification,
    confirmEmailVerification,
    updateUserProfile,
    getCooldownRemaining
  }), [
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resendVerificationEmail,
    checkEmailVerification,
    confirmEmailVerification,
    updateUserProfile,
    getCooldownRemaining
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
