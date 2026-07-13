// packages/mobile/services/orderService.ts
// Order service using client-side Firestore SDK to support free-tier Spark plan

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  increment,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { COLLECTIONS, PAGINATION, OrderStatus, PaymentStatus, DELIVERY_CONFIG } from '@bazaarbasket/shared';
import type { Order, PlaceOrderInput, CancelOrderInput, Cart, Product, OrderItem } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';
import { getActiveUid } from './authHelper';

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const cartRef = doc(db, COLLECTIONS.CARTS, userId);
  const orderRef = doc(collection(db, COLLECTIONS.ORDERS));

  await runTransaction(db, async (transaction) => {
    // 1. Group all read operations first
    const cartSnap = await transaction.get(cartRef);
    if (!cartSnap.exists()) {
      throw new Error('Cart is empty');
    }
    const cart = cartSnap.data() as Cart;
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'storeConfig');
    const settingsSnap = await transaction.get(settingsRef);

    // Fetch all products in parallel before executing any writes
    const productSnaps = await Promise.all(
      cart.items.map((cartItem) =>
        transaction.get(doc(db, COLLECTIONS.PRODUCTS, cartItem.productId))
      )
    );

    // -- READ PHASE COMPLETE. START PROCESSING LOGIC --

    const orderItems: OrderItem[] = [];
    let itemsTotal = 0;
    const stockDecrementUpdates: Array<{ ref: any; quantity: number }> = [];

    // 2. Validate product availability and prepare stock decrements
    for (let i = 0; i < cart.items.length; i++) {
      const cartItem = cart.items[i];
      const productSnap = productSnaps[i];
      const productRef = doc(db, COLLECTIONS.PRODUCTS, cartItem.productId);

      if (!productSnap.exists()) {
        throw new Error(`Product "${cartItem.productName}" is no longer available`);
      }

      const product = productSnap.data() as Product;
      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is no longer available`);
      }

      if (product.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }

      const subtotal = product.price * cartItem.quantity;
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

      stockDecrementUpdates.push({
        ref: productRef,
        quantity: cartItem.quantity,
      });
    }

    // 3. Dynamic settings thresholds verification
    let dynamicFreeThreshold = DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD;
    let dynamicDeliveryFee = DELIVERY_CONFIG.DELIVERY_FEE;
    let dynamicMinDelivery = DELIVERY_CONFIG.MIN_ORDER_AMOUNT;
    let dynamicMinOrderLimit = 0;

    if (settingsSnap.exists()) {
      const settingsData = settingsSnap.data();
      if (settingsData.freeDeliveryThreshold !== undefined) dynamicFreeThreshold = settingsData.freeDeliveryThreshold;
      if (settingsData.deliveryFee !== undefined) dynamicDeliveryFee = settingsData.deliveryFee;
      if (settingsData.minOrderAmount !== undefined) dynamicMinDelivery = settingsData.minOrderAmount;
      if (settingsData.minOrderLimit !== undefined) dynamicMinOrderLimit = settingsData.minOrderLimit;
    }

    const isPickup = input.deliveryAddress.id === 'pickup';
    const deliveryFee = isPickup ? 0 : (itemsTotal >= dynamicFreeThreshold ? 0 : dynamicDeliveryFee);

    const requiredMin = isPickup ? dynamicMinOrderLimit : dynamicMinDelivery;
    if (itemsTotal < requiredMin) {
      throw new Error(`Minimum order amount for ${isPickup ? 'pickup' : 'delivery'} is ₹${requiredMin}`);
    }

    const gstAmount = 0; // Simple client-side fallback
    const totalAmount = itemsTotal + deliveryFee;

    // Generate human-readable order number BB-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const orderNumber = `BB-${dateStr}-${randomNum}`;

    const orderData = {
      id: orderRef.id,
      orderNumber,
      userId,
      items: orderItems,
      itemsTotal,
      deliveryFee,
      gstAmount,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: input.paymentMethod,
      deliveryAddress: input.deliveryAddress,
      deliverySlot: input.deliverySlot,
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(),
          note: 'Order placed successfully',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      idempotencyKey: input.idempotencyKey,
    };

    // 4. WRITE PHASE
    // Decrement stock for all items
    for (const update of stockDecrementUpdates) {
      transaction.update(update.ref, {
        stock: increment(-update.quantity),
      });
    }

    // Create the order document
    transaction.set(orderRef, orderData);

    // Clear the cart
    transaction.set(cartRef, {
      userId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
      updatedAt: new Date(),
    });
  });

  logger.debug('Order placed (client-side)', { orderId: orderRef.id });
  return { orderId: orderRef.id };
}

export async function cancelOrder(input: CancelOrderInput): Promise<void> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const orderRef = doc(db, COLLECTIONS.ORDERS, input.orderId);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const order = orderSnap.data() as Order;
    if (order.userId !== userId) {
      throw new Error('Permission denied');
    }

    if (order.status === OrderStatus.CANCELLED) {
      return; // Already cancelled
    }

    // Restore stock for each item
    for (const item of order.items) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      transaction.update(productRef, {
        stock: increment(item.quantity),
      });
    }

    // Update order status
    transaction.update(orderRef, {
      status: OrderStatus.CANCELLED,
      statusHistory: [
        ...order.statusHistory,
        {
          status: OrderStatus.CANCELLED,
          timestamp: new Date(),
          note: input.reason || 'Cancelled by customer',
        },
      ],
      updatedAt: new Date(),
    });
  });

  logger.debug('Order cancelled (client-side)', { orderId: input.orderId });
}

/**
 * Fetch user's orders with cursor-based pagination.
 */
export async function getOrders(
  userId: string,
  lastDoc?: DocumentSnapshot,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1),
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, COLLECTIONS.ORDERS), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const orders: Order[] = docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(docSnap.data().createdAt),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(docSnap.data().updatedAt),
  })) as Order[];

  return {
    orders,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

/**
 * Fetch a single order by ID.
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
  } as Order;
}
