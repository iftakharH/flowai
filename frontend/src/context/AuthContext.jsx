import { createContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'flowai_firebase_id_token';

const setCachedToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

const primeUserSession = async (firebaseUser) => {
  if (!firebaseUser) {
    setCachedToken(null);
    return null;
  }

  const token = await firebaseUser.getIdToken(true);
  setCachedToken(token);
  return token;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        await primeUserSession(firebaseUser);
      } else {
        setCachedToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isSignedIn: !!user,
    signInWithEmail: async (email, password) => {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      await primeUserSession(credentials.user);
      return credentials;
    },
    signUpWithEmail: async (email, password, firstName, lastName) => {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const name = `${firstName || ''} ${lastName || ''}`.trim();
      if (name) {
        await updateProfile(credentials.user, { displayName: name });
      }
      await primeUserSession(credentials.user);
      return credentials;
    },
    signInWithGoogle: async () => {
      const credentials = await signInWithPopup(auth, googleProvider);
      await primeUserSession(credentials.user);
      return credentials;
    },
    logout: () => signOut(auth),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
