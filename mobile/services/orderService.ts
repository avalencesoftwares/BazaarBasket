// packages/mobile/services/orderService.ts
// Order service using Firebase Cloud Functions and Firestore

import { httpsCallable } from 'firebase/functions';
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
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { functions, db } from './firebase';
import { COLLECTIONS, PAGINATION } from '@bazaarbasket/shared';
import type { Order, PlaceOrderInput, CancelOrderInput } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const placeOrderFn = httpsCallable<PlaceOrderInput, { orderId: string }>(functions, 'placeOrder');
const cancelOrderFn = httpsCallable<CancelOrderInput, void>(functions, 'cancelOrder');

export async function placeOrder(input: PlaceOrderInput): Promise<{ orderId: string }> {
  const result = await placeOrderFn(input);
  logger.debug('Order placed', { orderId: result.data.orderId });
  return result.data;
}

export async function cancelOrder(input: CancelOrderInput): Promise<void> {
  await cancelOrderFn(input);
  logger.debug('Order cancelled', { orderId: input.orderId });
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
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
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

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
  } as Order;
}
