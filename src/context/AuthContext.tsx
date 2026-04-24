import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import axios from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        const token = await fbUser.getIdToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() } as UserProfile);
        } else {
          const newProfile = {
            name: fbUser.displayName || 'New User',
            email: fbUser.email || '',
            preferences: {
              darkMode: false,
              notificationsEnabled: true
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userRef, newProfile);
          setUser({ id: fbUser.uid, ...newProfile });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const code = error?.code?.toString();
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      logout,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

