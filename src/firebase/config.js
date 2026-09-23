import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default Firebase configuration with environment variable support
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForLocalBloodDonorApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "local-blood-donor.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-blood-donor",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "local-blood-donor.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456789"
};

let app, auth, db, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn("Firebase initialization warning (using local state fallback):", error);
}

export { auth, db, googleProvider };
