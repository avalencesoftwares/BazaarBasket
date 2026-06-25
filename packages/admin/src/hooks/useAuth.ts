// packages/admin/src/hooks/useAuth.ts
// Hook to handle admin auth state, Firebase token syncing, and session timeout after 30 min of inactivity

import { useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  // Stable logout reference using getState
  const logout = useCallback(() => useAuthStore.getState().logout(), []);

  // 1. Firebase Auth listener — runs once on mount, no dependencies needed
  //    IMPORTANT: Do NOT call setLoading(true) inside this callback — it re-fires
  //    on every auth state change (including after logout), which resets the loading
  //    flag and causes the infinite "Verifying security credentials" spinner.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const store = useAuthStore.getState();
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          let isUserAdmin = tokenResult.claims.role === 'admin';

          if (!isUserAdmin) {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data()?.role === 'admin') {
              isUserAdmin = true;
            }
          }

          if (isUserAdmin) {
            store.setUser(currentUser);
            store.setAdmin(true);
          } else {
            // Not an admin — sign out directly instead of calling store.logout(),
            // which would trigger another onAuthStateChanged event (recursive loop).
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
            store.setUser(null);
            store.setAdmin(false);
            store.setError('Access denied: User is not an admin.');
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error verifying admin status:', err);
          store.setUser(null);
          store.setAdmin(false);
        }
      } else {
        store.setUser(null);
        store.setAdmin(false);
      }
      store.setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Empty deps — onAuthStateChanged only needs to subscribe once

  // 2. Activity Tracking for Session Timeout
  useEffect(() => {
    if (!user || !isAdmin) return;

    const handleUserActivity = () => {
      useAuthStore.getState().updateActivity();
    };

    // Events to watch for activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Interval to check for timeout
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const activity = useAuthStore.getState().lastActivity;
      if (now - activity > INACTIVITY_TIMEOUT) {
        // eslint-disable-next-line no-console
        console.warn('Session timed out due to inactivity.');
        // eslint-disable-next-line no-console
        useAuthStore.getState().logout().catch(console.error);
        alert('Your session has expired due to inactivity. Please log in again.');
      }
    }, 15000); // Check every 15 seconds

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(checkInterval);
    };
  }, [user, isAdmin]); // Only re-run when user/isAdmin changes, not on every lastActivity tick

  return {
    user,
    isAdmin,
    loading,
    error,
    logout,
  };
}
