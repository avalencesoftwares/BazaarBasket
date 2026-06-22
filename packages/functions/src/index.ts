// packages/functions/src/index.ts
// Main entry point — exports all Cloud Functions

import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp();

// Product functions (Admin-only)
export { createProduct, updateProduct, deleteProduct, updateProductStock } from './products';

// Category functions (Admin-only)
export { createCategory, updateCategory, deleteCategory } from './categories';

// Cart functions (Customer)
export { addToCart, removeFromCart, updateCartQuantity, clearCart } from './cart';

// Order functions
export { placeOrder, cancelOrder, updateOrderStatus } from './orders';

// User functions
export { setAdminRole, getUserProfile, updateUserProfile, registerFCMToken } from './users';

// Firestore triggers
export { onOrderStatusChange } from './triggers/orderTriggers';
export { onLowStock } from './triggers/stockTriggers';
