import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Configure persistence for Firebase Auth
auth.setPersistence = auth.setPersistence || (() => Promise.resolve());

// Log Firebase configuration for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized for:', window?.location?.hostname || 'localhost');
  console.log('Firebase Project:', firebaseConfig.projectId);
}
