// packages/mobile/services/productService.ts
// Product data service using Firestore queries

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
import { db } from './firebase';
import { COLLECTIONS, PAGINATION } from '@bazaarbasket/shared';
import type { Product, Category } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

/**
 * Fetch products with optional filters and cursor-based pagination.
 */
export async function getProducts(params: {
  categoryId?: string;
  search?: string;
  lastDoc?: DocumentSnapshot;
  pageSize?: number;
  activeOnly?: boolean;
}): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const {
    categoryId,
    lastDoc: cursor,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    activeOnly = true,
  } = params;

  const constraints: QueryConstraint[] = [];

  if (activeOnly) {
    constraints.push(where('isActive', '==', true));
  }

  if (categoryId) {
    constraints.push(where('categoryId', '==', categoryId));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize + 1)); // Fetch one extra to check hasMore

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(collection(db, COLLECTIONS.PRODUCTS), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const products: Product[] = docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
  })) as Product[];

  const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

  logger.debug('Products fetched', { count: String(products.length) });

  return { products, lastDoc: newLastDoc, hasMore };
}

/**
 * Fetch a single product by ID.
 */
export async function getProduct(productId: string): Promise<Product | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, productId));

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
  } as Product;
}

/**
 * Search products by name (client-side prefix match).
 * For production, consider Algolia or Typesense.
 */
export async function searchProducts(
  searchTerm: string,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): Promise<Product[]> {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  if (!normalizedSearch) {
    return [];
  }

  // Firestore doesn't support full-text search natively.
  // We use a range query on name for prefix matching.
  const end = normalizedSearch + '\uf8ff';
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where('isActive', '==', true),
    orderBy('name'),
    where('name', '>=', normalizedSearch),
    where('name', '<=', end),
    limit(pageSize),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
  })) as Product[];
}

/**
 * Fetch all active categories.
 */
export async function getCategories(): Promise<Category[]> {
  const q = query(
    collection(db, COLLECTIONS.CATEGORIES),
    orderBy('sortOrder', 'asc'),
  );

  const snapshot = await getDocs(q);

  const categories = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
  })) as Category[];

  return categories.filter((category) => category.isActive === true);
}
