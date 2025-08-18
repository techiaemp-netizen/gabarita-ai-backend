/**
 * Authentication utilities and context
 *
 * The AuthProvider wraps the application and exposes the current user
 * object, a loading state and helper methods for signing in and out.
 * Hooks are used to subscribe to Firebase auth state changes.
 */
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Initiates a sign in flow with the Google provider. When complete
  // Firebase will trigger the auth state listener above and update
  // the current user.
  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  // Signs the current user out of Firebase. Errors are propagated to
  // the caller.
  const signOut = async () => {
    await fbSignOut(auth);
  };

  const value = { user, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
