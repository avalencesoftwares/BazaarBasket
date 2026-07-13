// packages/mobile/store/wishlistStore.ts
// Global Wishlist state management using Zustand and AsyncStorage persistence

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const WISHLIST_KEY = 'bazaarbasket_wishlist_ids';

interface WishlistState {
  wishlistIds: string[];
  loadWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],

  loadWishlist: async () => {
    try {
      const data = await AsyncStorage.getItem(WISHLIST_KEY);
      if (data) {
        set({ wishlistIds: JSON.parse(data) });
      }
    } catch (error) {
      logger.error('Failed to load wishlist from AsyncStorage:', error);
    }
  },

  toggleWishlist: async (productId: string) => {
    try {
      const current = get().wishlistIds;
      const updated = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      
      set({ wishlistIds: updated });
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to toggle wishlist and save to AsyncStorage:', error);
    }
  },
}));
