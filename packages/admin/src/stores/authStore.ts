// packages/admin/src/stores/authStore.ts
// Zustand store for managing admin authentication state

import { create } from 'zustand';
import { type User, signInWithEmailAndPassword, signOut as firebaseSignOut, type IdTokenResult } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  lastActivity: number;
  setUser: (user: User | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateActivity: () => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,
  lastActivity: Date.now(),

  setUser: (user) => set({ user }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateActivity: () => set({ lastActivity: Date.now() }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify custom claims (must have role: 'admin')
      const tokenResult: IdTokenResult = await user.getIdTokenResult(true);
      const isAdmin = tokenResult.claims.role === 'admin';
      
      if (!isAdmin) {
        // Sign out if not admin
        await firebaseSignOut(auth);
        throw new Error('Access denied: User is not an admin.');
      }

      set({ user, isAdmin: true, loading: false, lastActivity: Date.now() });
      return user;
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed';
      set({ error: errorMessage, loading: false, isAdmin: false, user: null });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAdmin: false, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Sign out failed' });
      throw err;
    }
  },
}));
