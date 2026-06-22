// packages/functions/src/orders/index.ts
// Order management Cloud Functions

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  COLLECTIONS,
  DELIVERY_CONFIG,
  placeOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_TRANSITIONS,
  calculateGST,
} from '@bazaarbasket/shared';
import type { Order, Cart, Product, OrderItem } from '@bazaarbasket/shared';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimiter';
import { validateInput } from '../middleware/validator';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

/**
 * Generate a human-readable order number.
 * Format: BB-YYYYMMDD-XXXX (e.g., BB-20260619-0042)
 */
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `BB-${dateStr}-${random}`;
}

export const placeOrder = onCall(
  { region: REGION, maxInstances: 10, minInstances: 1, memory: '256MiB' },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);

    const input = validateInput(placeOrderSchema, request.data);
    const db = getFirestore();

    // Idempotency check
    const existingOrders = await db
      .collection(COLLECTIONS.ORDERS)
      .where('idempotencyKey', '==', input.idempotencyKey)
      .limit(1)
      .get();

    if (!existingOrders.empty) {
      const existingOrder = existingOrders.docs[0];
      logger.info('Duplicate order request blocked', {
        userId,
        action: 'placeOrder',
        orderId: existingOrder.id,
        idempotencyKey: input.idempotencyKey,
      });
      return { orderId: existingOrder.id };
    }

    // Get cart
    const cartSnap = await db.collection(COLLECTIONS.CARTS).doc(userId).get();
    if (!cartSnap.exists) {
      throw new HttpsError('failed-precondition', 'Cart is empty');
    }

    const cart = cartSnap.data() as Cart;
    if (cart.items.length === 0) {
      throw new HttpsError('failed-precondition', 'Cart is empty');
    }

    // Validate stock and build order items within a transaction
    const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
    const cartRef = db.collection(COLLECTIONS.CARTS).doc(userId);

    await db.runTransaction(async (transaction) => {
      const orderItems: OrderItem[] = [];
      let itemsTotal = 0;
      let totalGST = 0;

      // Verify each product's stock
      for (const cartItem of cart.items) {
        const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(cartItem.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists) {
          throw new HttpsError(
            'failed-precondition',
            `Product "${cartItem.productName}" is no longer available`,
          );
        }

        const product = productSnap.data() as Product;

        if (!product.isActive) {
          throw new HttpsError(
            'failed-precondition',
            `Product "${product.name}" is no longer available`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new HttpsError(
            'failed-precondition',
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          );
        }

        // Use current product price (not cached cart price)
        const subtotal = product.price * cartItem.quantity;
        const gst = calculateGST(subtotal, product.gstSlab);

        orderItems.push({
          productId: cartItem.productId,
          productName: product.name,
          productImage: product.images.length > 0 ? product.images[0].thumbnailUrl : '',
          price: product.price,
          mrp: product.mrp,
          quantity: cartItem.quantity,
          unit: product.unit,
          subtotal,
        });

        itemsTotal += subtotal;
        totalGST += gst;

        // Decrement stock
        transaction.update(productRef, {
          stock: FieldValue.increment(-cartItem.quantity),
        });
      }

      // Calculate delivery fee
      const deliveryFee =
        itemsTotal >= DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD
          ? 0
          : DELIVERY_CONFIG.DELIVERY_FEE;

      // Minimum order check
      if (itemsTotal < DELIVERY_CONFIG.MIN_ORDER_AMOUNT) {
        throw new HttpsError(
          'failed-precondition',
          `Minimum order amount is ₹${DELIVERY_CONFIG.MIN_ORDER_AMOUNT}`,
        );
      }

      const totalAmount = itemsTotal + deliveryFee + totalGST;
      const now = new Date();

      // Get user profile
      const userSnap = await transaction.get(
        db.collection(COLLECTIONS.USERS).doc(userId),
      );
      const userData = userSnap.data() || {};

      const order: Omit<Order, 'id'> = {
        orderNumber: generateOrderNumber(),
        userId,
        userName: (userData.displayName as string) || '',
        userPhone: (userData.phone as string) || input.deliveryAddress.phone,
        items: orderItems,
        deliveryAddress: {
          ...input.deliveryAddress,
          addressLine2: input.deliveryAddress.addressLine2 || '',
          landmark: input.deliveryAddress.landmark || '',
        },
        deliverySlot: input.deliverySlot,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: input.paymentMethod,
        itemsTotal,
        deliveryFee,
        gstAmount: totalGST,
        discount: 0,
        totalAmount,
        notes: input.notes || '',
        cancelReason: '',
        idempotencyKey: input.idempotencyKey,
        statusHistory: [
          {
            status: OrderStatus.PENDING,
            timestamp: now,
            note: 'Order placed',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(orderRef, order);

      // Clear cart
      transaction.delete(cartRef);
    });

    logger.info('Order placed', {
      userId,
      action: 'placeOrder',
      orderId: orderRef.id,
    });

    return { orderId: orderRef.id };
  },
);

export const cancelOrder = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);

    const input = validateInput(cancelOrderSchema, request.data);
    const db = getFirestore();

    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(input.orderId);

    await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new HttpsError('not-found', 'Order not found');
      }

      const order = orderSnap.data() as Order;

      // Verify ownership
      if (order.userId !== userId) {
        throw new HttpsError('permission-denied', 'You can only cancel your own orders');
      }

      // Check if cancellation is allowed
      const allowedStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
      if (!allowedStatuses.includes(order.status)) {
        throw new HttpsError(
          'failed-precondition',
          `Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`,
        );
      }

      // Restore stock for each item
      for (const item of order.items) {
        const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(item.productId);
        transaction.update(productRef, {
          stock: FieldValue.increment(item.quantity),
        });
      }

      // Update order status
      const now = new Date();
      transaction.update(orderRef, {
        status: OrderStatus.CANCELLED,
        cancelReason: input.reason,
        updatedAt: now,
        statusHistory: FieldValue.arrayUnion({
          status: OrderStatus.CANCELLED,
          timestamp: now,
          note: `Cancelled by customer: ${input.reason}`,
        }),
      });
    });

    logger.info('Order cancelled', {
      userId,
      action: 'cancelOrder',
      orderId: input.orderId,
    });
  },
);

export const updateOrderStatus = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(updateOrderStatusSchema, request.data);
    const db = getFirestore();

    const orderRef = db.collection(COLLECTIONS.ORDERS).doc(input.orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new HttpsError('not-found', 'Order not found');
    }

    const order = orderSnap.data() as Order;

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(input.status)) {
      throw new HttpsError(
        'failed-precondition',
        `Cannot transition from "${order.status}" to "${input.status}". Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: input.status,
      updatedAt: now,
      statusHistory: FieldValue.arrayUnion({
        status: input.status,
        timestamp: now,
        note: input.note || `Status updated by admin`,
      }),
    };

    // If delivered, mark payment as paid for COD
    if (input.status === OrderStatus.DELIVERED) {
      updateData.paymentStatus = PaymentStatus.PAID;
    }

    // If cancelled by admin, restore stock
    if (input.status === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await db
          .collection(COLLECTIONS.PRODUCTS)
          .doc(item.productId)
          .update({ stock: FieldValue.increment(item.quantity) });
      }
      updateData.cancelReason = input.note || 'Cancelled by admin';
    }

    await orderRef.update(updateData);

    logger.info('Order status updated', {
      userId: adminUid,
      action: 'updateOrderStatus',
      orderId: input.orderId,
      newStatus: input.status,
    });
  },
);
