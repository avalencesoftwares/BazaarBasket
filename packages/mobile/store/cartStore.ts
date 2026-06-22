// packages/mobile/store/cartStore.ts
// Cart state management using Zustand with Firestore sync

import { create } from 'zustand';
import type { CartItem } from '@bazaarbasket/shared';
import * as cartService from '../services/cartService';
import { logger } from '../utils/logger';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartFromServer: (items: CartItem[], totalItems: number, totalAmount: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  isSyncing: false,

  addItem: async (productId: string, quantity: number) => {
    set({ isSyncing: true });
    try {
      const cart = await cartService.addToCart({ productId, quantity });
      set({
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        isSyncing: false,
      });
    } catch (error) {
      logger.error('Failed to add item to cart', error);
      set({ isSyncing: false });
      throw error;
    }
  },

  removeItem: async (productId: string) => {
    set({ isSyncing: true });
    try {
      const cart = await cartService.removeFromCart({ productId });
      set({
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        isSyncing: false,
      });
    } catch (error) {
      logger.error('Failed to remove item from cart', error);
      set({ isSyncing: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ isSyncing: true });
    try {
      const cart = await cartService.updateCartQuantity({ productId, quantity });
      set({
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        isSyncing: false,
      });
    } catch (error) {
      logger.error('Failed to update cart quantity', error);
      set({ isSyncing: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isSyncing: true });
    try {
      await cartService.clearCart();
      set({
        items: [],
        totalItems: 0,
        totalAmount: 0,
        isSyncing: false,
      });
    } catch (error) {
      logger.error('Failed to clear cart', error);
      set({ isSyncing: false });
      throw error;
    }
  },

  setCartFromServer: (items, totalItems, totalAmount) => {
    set({ items, totalItems, totalAmount });
  },
}));
