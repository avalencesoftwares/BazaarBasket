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
  setDoc,
  type DocumentSnapshot,
  type QueryConstraint,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from './firebase';
import {
  COLLECTIONS,
  PAGINATION,
  DEFAULT_DELIVERY_SLOTS,
  DELIVERY_CONFIG,
  type Product,
  type Category,
  type Order,
  type User,
  type CreateProductInput,
  type UpdateProductInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type UpdateOrderStatusInput,
  type StoreSettings,
} from '@bazaarbasket/shared';

// ──── Cloud Function Callables ────

const createProductFn = httpsCallable<CreateProductInput, { productId: string }>(functions, 'createProduct');
const updateProductFn = httpsCallable<UpdateProductInput, void>(functions, 'updateProduct');
const deleteProductFn = httpsCallable<{ productId: string }, void>(functions, 'deleteProduct');
const updateProductStockFn = httpsCallable<{ productId: string; delta: number }, void>(functions, 'updateProductStock');
const createCategoryFn = httpsCallable<CreateCategoryInput, { categoryId: string }>(functions, 'createCategory');
const updateCategoryFn = httpsCallable<UpdateCategoryInput, void>(functions, 'updateCategory');
const deleteCategoryFn = httpsCallable<{ categoryId: string }, void>(functions, 'deleteCategory');
const updateOrderStatusFn = httpsCallable<UpdateOrderStatusInput, void>(functions, 'updateOrderStatus');
const setAdminRoleFn = httpsCallable<{ uid: string }, void>(functions, 'setAdminRole');

// ──── Products ────

export async function createProduct(input: CreateProductInput): Promise<{ productId: string }> {
  const result = await createProductFn(input);
  return result.data;
}

export async function updateProduct(input: UpdateProductInput): Promise<void> {
  await updateProductFn(input);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteProductFn({ productId });
}

export async function updateProductStock(input: { productId: string; delta: number }): Promise<void> {
  await updateProductStockFn(input);
}

export async function getProducts(params: {
  categoryId?: string;
  search?: string;
  lastDoc?: DocumentSnapshot;
  pageSize?: number;
  includeInactive?: boolean;
}): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const {
    categoryId,
    lastDoc: cursor,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    includeInactive = true,
  } = params;

  const constraints: QueryConstraint[] = [];

  if (!includeInactive) {
    constraints.push(where('isActive', '==', true));
  }
  if (categoryId) {
    constraints.push(where('categoryId', '==', categoryId));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize + 1));

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

  return { products, lastDoc: docs.length > 0 ? docs[docs.length - 1] : null, hasMore };
}

export async function getProduct(productId: string): Promise<Product | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Product;
}

// ──── Categories ────

export async function createCategory(input: CreateCategoryInput): Promise<{ categoryId: string }> {
  const result = await createCategoryFn(input);
  return result.data;
}

export async function updateCategory(input: UpdateCategoryInput): Promise<void> {
  await updateCategoryFn(input);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteCategoryFn({ categoryId });
}

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('sortOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Category[];
}

// ──── Orders ────

export async function getOrders(params: {
  status?: string;
  lastDoc?: DocumentSnapshot;
  pageSize?: number;
}): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const { status, lastDoc: cursor, pageSize = PAGINATION.DEFAULT_PAGE_SIZE } = params;

  const constraints: QueryConstraint[] = [];
  if (status) {
    constraints.push(where('status', '==', status));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize + 1));
  if (cursor) {
    constraints.push(startAfter(cursor));
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

  return { orders, lastDoc: docs.length > 0 ? docs[docs.length - 1] : null, hasMore };
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
}

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<void> {
  await updateOrderStatusFn(input);
}

// ──── Users ────

export async function setAdminRole(uid: string): Promise<void> {
  await setAdminRoleFn({ uid });
}

export async function getUsers(params: {
  lastDoc?: DocumentSnapshot;
  pageSize?: number;
}): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const { lastDoc: cursor, pageSize = PAGINATION.DEFAULT_PAGE_SIZE } = params;

  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1),
  ];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(collection(db, COLLECTIONS.USERS), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const users: User[] = docs.map((docSnap) => ({
    uid: docSnap.id,
    ...docSnap.data(),
  })) as User[];

  return { users, lastDoc: docs.length > 0 ? docs[docs.length - 1] : null, hasMore };
}

// ──── Dashboard Analytics ────

export async function getDashboardStats(): Promise<{
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
}> {
  const [productCount, orderCount, userCount, pendingCount] = await Promise.all([
    getCountFromServer(collection(db, COLLECTIONS.PRODUCTS)),
    getCountFromServer(collection(db, COLLECTIONS.ORDERS)),
    getCountFromServer(collection(db, COLLECTIONS.USERS)),
    getCountFromServer(query(collection(db, COLLECTIONS.ORDERS), where('status', '==', 'pending'))),
  ]);

  return {
    totalProducts: productCount.data().count,
    totalOrders: orderCount.data().count,
    totalUsers: userCount.data().count,
    pendingOrders: pendingCount.data().count,
  };
}

// ──── Store Settings ────

const STORE_CONFIG_DOC = 'storeConfig';

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'BazaarBasket Kirana',
  storePhone: '+91 9876543210',
  storeEmail: 'support@bazaarbasket.com',
  storeAddress: '12, MG Road, Bengaluru, Karnataka - 560001',
  deliveryFee: DELIVERY_CONFIG.DELIVERY_FEE,
  freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
  minOrderAmount: DELIVERY_CONFIG.MIN_ORDER_AMOUNT,
  deliverySlots: DEFAULT_DELIVERY_SLOTS.map((slot) => ({ ...slot, active: true })),
  bannerTitle: 'Fresh Groceries',
  bannerSubtitle: 'Delivered in minutes',
  bannerOffer: 'Free delivery on orders above ₹499',
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, STORE_CONFIG_DOC));
  if (!docSnap.exists()) {
    return DEFAULT_STORE_SETTINGS;
  }
  return { ...DEFAULT_STORE_SETTINGS, ...docSnap.data() } as StoreSettings;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  await setDoc(
    doc(db, COLLECTIONS.SETTINGS, STORE_CONFIG_DOC),
    { ...settings, updatedAt: Timestamp.now() },
    { merge: true },
  );
}

// ──── Dashboard Analytics (Real Data) ────

export async function getDashboardAnalytics(): Promise<{
  revenueTrend: { name: string; revenue: number }[];
  topProducts: { name: string; sales: number; fill: string }[];
  statusDistribution: { name: string; value: number; color: string }[];
  totalRevenue: number;
}> {
  const colors = ['#6366f1', '#a855f7', '#22c55e', '#3b82f6', '#f59e0b'];
  const statusColors: Record<string, string> = {
    delivered: '#22c55e',
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    packed: '#a855f7',
    out_for_delivery: '#6366f1',
    cancelled: '#ef4444',
  };
  const statusLabels: Record<string, string> = {
    delivered: 'Delivered',
    pending: 'Pending',
    confirmed: 'Confirmed',
    packed: 'Packed',
    out_for_delivery: 'Out for Delivery',
    cancelled: 'Cancelled',
  };

  // Fetch last 7 days of orders for revenue trend + product aggregation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentOrdersQuery = query(
    collection(db, COLLECTIONS.ORDERS),
    where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
    orderBy('createdAt', 'desc'),
    limit(500),
  );

  const allOrdersQuery = query(
    collection(db, COLLECTIONS.ORDERS),
    orderBy('createdAt', 'desc'),
    limit(1000),
  );

  const [recentSnap, allSnap] = await Promise.all([
    getDocs(recentOrdersQuery),
    getDocs(allOrdersQuery),
  ]);

  // Revenue trend by day (last 7 days)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueByDay[dayNames[d.getDay()]] = 0;
  }

  let totalRevenue = 0;
  recentSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const date = data.createdAt?.toDate?.() || new Date();
    const dayName = dayNames[date.getDay()];
    if (revenueByDay[dayName] !== undefined) {
      revenueByDay[dayName] += data.totalAmount || 0;
    }
    totalRevenue += data.totalAmount || 0;
  });

  const revenueTrend = Object.entries(revenueByDay).map(([name, revenue]) => ({
    name,
    revenue,
  }));

  // Top products by sales quantity
  const productSales: Record<string, number> = {};
  allSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        const name = item.productName || 'Unknown';
        productSales[name] = (productSales[name] || 0) + (item.quantity || 1);
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, sales], idx) => ({
      name,
      sales,
      fill: colors[idx % colors.length],
    }));

  // Status distribution from all orders
  const statusCounts: Record<string, number> = {};
  allSnap.docs.forEach((docSnap) => {
    const status = docSnap.data().status || 'pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const totalOrders = allSnap.docs.length || 1;
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: Math.round((count / totalOrders) * 100),
    color: statusColors[status] || '#94a3b8',
  }));

  return { revenueTrend, topProducts, statusDistribution, totalRevenue };
}
