// packages/functions/src/cart/index.ts
// Cart management Cloud Functions (Customer)

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import {
  COLLECTIONS,
  addToCartSchema,
  updateCartQuantitySchema,
  removeFromCartSchema,
} from '@bazaarbasket/shared';
import type { Cart, CartItem, Product } from '@bazaarbasket/shared';
import { requireAuth } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimiter';
import { checkWriteThrottle } from '../middleware/throttler';
import { validateInput } from '../middleware/validator';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

/**
 * Recalculate cart totals from items array.
 */
function recalculateCart(items: CartItem[]): { totalItems: number; totalAmount: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalAmount };
}

export const addToCart = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);
    await checkWriteThrottle(userId);

    const input = validateInput(addToCartSchema, request.data);
    const db = getFirestore();

    // Get product details
    const productSnap = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(input.productId)
      .get();

    if (!productSnap.exists) {
      throw new HttpsError('not-found', 'Product not found');
    }

    const product = { id: productSnap.id, ...productSnap.data() } as Product;

    if (!product.isActive) {
      throw new HttpsError('failed-precondition', 'Product is no longer available');
    }

    if (product.stock < input.quantity) {
      throw new HttpsError(
        'failed-precondition',
        `Insufficient stock. Available: ${product.stock}`,
      );
    }

    // Get or create cart
    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartSnap = await cartRef.get();
    const cart = cartSnap.exists
      ? (cartSnap.data() as Cart)
      : { userId, items: [], totalItems: 0, totalAmount: 0, updatedAt: new Date() };

    // Check if product already in cart
    const existingIndex = cart.items.findIndex((item) => item.productId === input.productId);

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + input.quantity;
      if (newQty > product.stock) {
        throw new HttpsError(
          'failed-precondition',
          `Cannot add more. Maximum available: ${product.stock}`,
        );
      }
      cart.items[existingIndex].quantity = newQty;
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

    const { totalItems, totalAmount } = recalculateCart(cart.items);
    const updatedCart: Cart = {
      ...cart,
      totalItems,
      totalAmount,
      updatedAt: new Date(),
    };

    await cartRef.set(updatedCart);

    logger.info('Item added to cart', {
      userId,
      action: 'addToCart',
      productId: input.productId,
    });

    return updatedCart;
  },
);

export const removeFromCart = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);
    await checkWriteThrottle(userId);

    const input = validateInput(removeFromCartSchema, request.data);
    const db = getFirestore();

    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) {
      throw new HttpsError('not-found', 'Cart not found');
    }

    const cart = cartSnap.data() as Cart;
    cart.items = cart.items.filter((item) => item.productId !== input.productId);

    const { totalItems, totalAmount } = recalculateCart(cart.items);
    const updatedCart: Cart = {
      ...cart,
      totalItems,
      totalAmount,
      updatedAt: new Date(),
    };

    await cartRef.set(updatedCart);

    logger.info('Item removed from cart', {
      userId,
      action: 'removeFromCart',
      productId: input.productId,
    });

    return updatedCart;
  },
);

export const updateCartQuantity = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);
    await checkWriteThrottle(userId);

    const input = validateInput(updateCartQuantitySchema, request.data);
    const db = getFirestore();

    // Verify stock
    const productSnap = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(input.productId)
      .get();

    if (!productSnap.exists) {
      throw new HttpsError('not-found', 'Product not found');
    }

    const product = productSnap.data() as Product;

    if (input.quantity > product.stock) {
      throw new HttpsError(
        'failed-precondition',
        `Insufficient stock. Available: ${product.stock}`,
      );
    }

    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists) {
      throw new HttpsError('not-found', 'Cart not found');
    }

    const cart = cartSnap.data() as Cart;
    const itemIndex = cart.items.findIndex((item) => item.productId === input.productId);

    if (itemIndex < 0) {
      throw new HttpsError('not-found', 'Item not found in cart');
    }

    cart.items[itemIndex].quantity = input.quantity;
    cart.items[itemIndex].stock = product.stock;

    const { totalItems, totalAmount } = recalculateCart(cart.items);
    const updatedCart: Cart = {
      ...cart,
      totalItems,
      totalAmount,
      updatedAt: new Date(),
    };

    await cartRef.set(updatedCart);

    logger.info('Cart quantity updated', {
      userId,
      action: 'updateCartQuantity',
      productId: input.productId,
      quantity: String(input.quantity),
    });

    return updatedCart;
  },
);

export const clearCart = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);

    const db = getFirestore();
    await db.collection(COLLECTIONS.CARTS).doc(userId).delete();

    logger.info('Cart cleared', { userId, action: 'clearCart' });
  },
);
