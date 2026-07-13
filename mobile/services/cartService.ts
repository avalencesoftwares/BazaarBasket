// packages/mobile/services/cartService.ts
// Cart service using client-side Firestore SDK to support free-tier Spark plan

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Cart, CartItem, AddToCartInput, UpdateCartQuantityInput, RemoveFromCartInput } from '@bazaarbasket/shared';
import { COLLECTIONS } from '@bazaarbasket/shared';
import { getProduct } from './productService';
import { logger } from '../utils/logger';
import { getActiveUid } from './authHelper';

export async function addToCart(input: AddToCartInput): Promise<Cart> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  // Get product details
  const product = await getProduct(input.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Get or create cart document reference
  const cartRef = doc(db, COLLECTIONS.CARTS, userId);
  const cartSnap = await getDoc(cartRef);
  
  let cart: Cart;
  if (cartSnap.exists()) {
    cart = cartSnap.data() as Cart;
  } else {
    cart = {
      userId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
      updatedAt: new Date(),
    };
  }

  // Check if product already in cart
  const existingIndex = cart.items.findIndex((item) => item.productId === input.productId);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += input.quantity;
  } else {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.images.length > 0 ? product.images[0].thumbnailUrl : '',
      price: product.price,
      mrp: product.mrp,
      quantity: input.quantity,
      unit: product.unit,
      stock: product.stock,
    };
    cart.items.push(cartItem);
  }

  // Recalculate totals
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updatedCart: Cart = {
    ...cart,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  await setDoc(cartRef, updatedCart);
  logger.debug('Added to cart (client-side)', { productId: input.productId });
  return updatedCart;
}

export async function removeFromCart(input: RemoveFromCartInput): Promise<Cart> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const cartRef = doc(db, COLLECTIONS.CARTS, userId);
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) {
    throw new Error('Cart not found');
  }

  const cart = cartSnap.data() as Cart;
  cart.items = cart.items.filter((item) => item.productId !== input.productId);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updatedCart: Cart = {
    ...cart,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  await setDoc(cartRef, updatedCart);
  logger.debug('Removed from cart (client-side)', { productId: input.productId });
  return updatedCart;
}

export async function updateCartQuantity(input: UpdateCartQuantityInput): Promise<Cart> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const cartRef = doc(db, COLLECTIONS.CARTS, userId);
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) {
    throw new Error('Cart not found');
  }

  const cart = cartSnap.data() as Cart;
  const existingIndex = cart.items.findIndex((item) => item.productId === input.productId);

  if (existingIndex < 0) {
    throw new Error('Item not found in cart');
  }

  cart.items[existingIndex].quantity = input.quantity;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updatedCart: Cart = {
    ...cart,
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  };

  await setDoc(cartRef, updatedCart);
  logger.debug('Cart quantity updated (client-side)', { productId: input.productId });
  return updatedCart;
}

export async function clearCart(): Promise<void> {
  const userId = getActiveUid(auth);
  if (!userId) return;

  const cartRef = doc(db, COLLECTIONS.CARTS, userId);
  await setDoc(cartRef, {
    userId,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: new Date(),
  });
  logger.debug('Cart cleared (client-side)');
}
