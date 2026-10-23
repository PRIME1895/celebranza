import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase.ts';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
  providerId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInAsDemo: (name?: string, role?: string) => void;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'eventflow_demo_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Check saved demo user on startup if any
    try {
      const saved = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default to initial Harikrishna user from mockup
    return {
      uid: 'user-harikrishna-1',
      displayName: 'Harikrishna',
      email: 'harikrishna@celebranza.io',
      photoURL: null,
      isDemo: true,
      providerId: 'demo',
    };
  });

  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          const mapped: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Planner',
            photoURL: firebaseUser.photoURL,
            isDemo: false,
            providerId: firebaseUser.providerData[0]?.providerId || 'firebase',
          };
          setUser(mapped);
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        } else {
          // If signed out of firebase, check if demo user was explicitly set
          const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (savedDemo) {
            setUser(JSON.parse(savedDemo));
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error('Firebase credentials not configured yet. You can sign in using Demo Planner Mode!');
    }
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        isDemo: false,
        providerId: 'google.com',
      });
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase credentials not configured yet. You can sign in using Demo Planner Mode!');
    }
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        photoURL: res.user.photoURL,
        isDemo: false,
        providerId: 'password',
      });
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase credentials not configured yet. You can sign in using Demo Planner Mode!');
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || email.split('@')[0],
        photoURL: null,
        isDemo: false,
        providerId: 'password',
      });
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
  };

  const signInAsDemo = (name: string = 'Harikrishna', _role: string = 'Event Director') => {
    const demoUser: AuthUser = {
      uid: `demo-${Date.now()}`,
      displayName: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@celebranza.io`,
      photoURL: null,
      isDemo: true,
      providerId: 'demo',
    };
    setUser(demoUser);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const signOutUser = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        authModalOpen,
        setAuthModalOpen,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemo,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
