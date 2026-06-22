// packages/mobile/store/authStore.ts
// Authentication state management using Zustand

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { UserRole, type User } from '@bazaarbasket/shared';
import { onAuthChange } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { logger } from '../utils/logger';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  initialize: () => () => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  fetchUserProfile: () => Promise<void>;
  clearAuth: () => void;
  setDevUser: (phone: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  initialize: () => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        set({ firebaseUser: user, isAuthenticated: true, isLoading: false });
        // Fetch user profile in the background
        try {
          await get().fetchUserProfile();
        } catch (error) {
          logger.error('Failed to fetch user profile', error);
        }
      } else {
        set({
          firebaseUser: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          isAdmin: false,
        });
      }
    });
    return unsubscribe;
  },

  setFirebaseUser: (user) => {
    set({
      firebaseUser: user,
      isAuthenticated: !!user,
    });
  },

  fetchUserProfile: async () => {
    try {
      const profile = await getUserProfile();
      set({
        userProfile: profile,
        isAdmin: profile.role === 'admin',
      });
    } catch (error) {
      logger.error('Failed to fetch user profile', error);
    }
  },

  clearAuth: () => {
    set({
      firebaseUser: null,
      userProfile: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  setDevUser: (phone: string) => {
    const devProfile: User = {
      uid: 'dev-user-001',
      phone,
      displayName: 'Dev User',
      email: 'dev@bazaarbasket.local',
      role: UserRole.CUSTOMER,
      photoUrl: '',
      fcmTokens: [],
      addresses: [],
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({
      userProfile: devProfile,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: false,
    });
    logger.info('Dev user set', { phone });
  },
}));
