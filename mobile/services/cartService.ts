// packages/mobile/services/cartService.ts
// Cart service using Firebase Cloud Functions

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { Cart, AddToCartInput, UpdateCartQuantityInput, RemoveFromCartInput } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const addToCartFn = httpsCallable<AddToCartInput, Cart>(functions, 'addToCart');
const removeFromCartFn = httpsCallable<RemoveFromCartInput, Cart>(functions, 'removeFromCart');
const updateCartQuantityFn = httpsCallable<UpdateCartQuantityInput, Cart>(functions, 'updateCartQuantity');
const clearCartFn = httpsCallable<Record<string, never>, void>(functions, 'clearCart');

export async function addToCart(input: AddToCartInput): Promise<Cart> {
  const result = await addToCartFn(input);
  logger.debug('Added to cart', { productId: input.productId });
  return result.data;
}

export async function removeFromCart(input: RemoveFromCartInput): Promise<Cart> {
  const result = await removeFromCartFn(input);
  logger.debug('Removed from cart', { productId: input.productId });
  return result.data;
}

export async function updateCartQuantity(input: UpdateCartQuantityInput): Promise<Cart> {
  const result = await updateCartQuantityFn(input);
  logger.debug('Cart quantity updated', { productId: input.productId });
  return result.data;
}

export async function clearCart(): Promise<void> {
  await clearCartFn({});
  logger.debug('Cart cleared');
}
