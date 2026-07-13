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
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  increment,
  runTransaction,
  type DocumentSnapshot,
  type QueryConstraint,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
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
  sanitizeObject,
  generateSlug,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_TRANSITIONS,
  CLOUDINARY_FOLDERS,
  type ProductImage,
} from '@bazaarbasket/shared';

// ──── Cloudinary Direct Direct Upload Helper ────

async function uploadToCloudinaryClient(
  base64Data: string,
  folder: string,
  fileName: string,
): Promise<ProductImage> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bazaarbasket';

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured in VITE_CLOUDINARY_CLOUD_NAME');
  }

  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('public_id', fileName.replace(/\.[^.]+$/, ''));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary');
  }

  const result = await response.json();
  const secureUrl = result.secure_url;
  
  // Create w_400 transform thumbnail URL
  const thumbnailUrl = secureUrl.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');

  return {
    url: secureUrl,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    thumbnailUrl,
  };
}

// ──── Banner Image Upload Helper ────

export async function uploadBannerImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const result = await uploadToCloudinaryClient(
          base64,
          'bazaarbasket/banners',
          `banner_${Date.now()}_${file.name}`,
        );
        resolve({ url: result.url, publicId: result.publicId });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ──── Products ────

export async function createProduct(input: CreateProductInput): Promise<{ productId: string }> {
  const sanitized = sanitizeObject(input as unknown as Record<string, unknown>);

  const images: ProductImage[] = [];
  for (const img of input.images || []) {
    const result = await uploadToCloudinaryClient(
      img.base64,
      CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
      `${Date.now()}_${img.fileName}`,
    );
    images.push(result);
  }

  const slug = generateSlug(sanitized.name as string);
  const now = new Date();

  const productData: Omit<Product, 'id'> = {
    name: sanitized.name as string,
    slug,
    description: (sanitized.description as string) || '',
    categoryId: sanitized.categoryId as string,
    price: input.price,
    mrp: input.mrp,
    unit: sanitized.unit as string,
    stock: input.stock,
    images,
    isActive: input.isActive ?? true,
    tags: input.tags ?? [],
    gstSlab: input.gstSlab,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), productData);

  // Update category product count
  await updateDoc(doc(db, COLLECTIONS.CATEGORIES, input.categoryId), {
    productCount: increment(1),
  });

  return { productId: docRef.id };
}

export async function updateProduct(input: UpdateProductInput): Promise<void> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, input.productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error('Product not found');
  }

  const existingProduct = productSnap.data() as Product;
  const updateData: Record<string, any> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const sanitized = sanitizeObject({ name: input.name });
    updateData.name = sanitized.name;
    updateData.slug = generateSlug(sanitized.name);
  }
  if (input.description !== undefined) {
    updateData.description = sanitizeObject({ description: input.description }).description;
  }
  if (input.categoryId !== undefined) {
    if (input.categoryId !== existingProduct.categoryId) {
      await updateDoc(doc(db, COLLECTIONS.CATEGORIES, existingProduct.categoryId), {
        productCount: increment(-1),
      });
      await updateDoc(doc(db, COLLECTIONS.CATEGORIES, input.categoryId), {
        productCount: increment(1),
      });
    }
    updateData.categoryId = input.categoryId;
  }
  if (input.price !== undefined) { updateData.price = input.price; }
  if (input.mrp !== undefined) { updateData.mrp = input.mrp; }
  if (input.unit !== undefined) { updateData.unit = input.unit; }
  if (input.stock !== undefined) { updateData.stock = input.stock; }
  if (input.isActive !== undefined) { updateData.isActive = input.isActive; }
  if (input.tags !== undefined) { updateData.tags = input.tags; }
  if (input.gstSlab !== undefined) { updateData.gstSlab = input.gstSlab; }

  if (input.imagesToRemove && input.imagesToRemove.length > 0) {
    const remainingImages = existingProduct.images.filter(
      (img) => !input.imagesToRemove?.includes(img.publicId),
    );
    updateData.images = remainingImages;
  }

  if (input.imagesToAdd && input.imagesToAdd.length > 0) {
    const currentImages = [...((updateData.images as ProductImage[]) || existingProduct.images)];
    for (const img of input.imagesToAdd) {
      const result = await uploadToCloudinaryClient(
        img.base64,
        CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
        `${Date.now()}_${img.fileName}`,
      );
      currentImages.push(result);
    }
    updateData.images = currentImages;
  }

  await updateDoc(productRef, updateData);
}

export async function deleteProduct(productId: string): Promise<void> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error('Product not found');
  }

  const product = productSnap.data() as Product;

  await updateDoc(productRef, { isActive: false, updatedAt: new Date() });

  await updateDoc(doc(db, COLLECTIONS.CATEGORIES, product.categoryId), {
    productCount: increment(-1),
  });
}

export async function updateProductStock(input: { productId: string; delta: number }): Promise<void> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, input.productId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(productRef);
    if (!snap.exists()) {
      throw new Error('Product not found');
    }

    const product = snap.data() as Product;
    const newStock = product.stock + input.delta;

    if (newStock < 0) {
      throw new Error(`Insufficient stock. Current: ${product.stock}, requested delta: ${input.delta}`);
    }

    transaction.update(productRef, {
      stock: newStock,
      updatedAt: new Date(),
    });
  });
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
  const sanitized = sanitizeObject({ name: input.name });

  let imageUrl = '';
  let imagePublicId = '';

  if (input.image) {
    const result = await uploadToCloudinaryClient(
      input.image.base64,
      CLOUDINARY_FOLDERS.CATEGORY_IMAGES,
      `${Date.now()}_${input.image.fileName}`,
    );
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const slug = generateSlug(sanitized.name);
  const now = new Date();

  const categoryData: Omit<Category, 'id'> = {
    name: sanitized.name,
    slug,
    imageUrl,
    imagePublicId,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    productCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), categoryData);
  return { categoryId: docRef.id };
}

export async function updateCategory(input: UpdateCategoryInput): Promise<void> {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, input.categoryId);
  const categorySnap = await getDoc(categoryRef);

  if (!categorySnap.exists()) {
    throw new Error('Category not found');
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const sanitized = sanitizeObject({ name: input.name });
    updateData.name = sanitized.name;
    updateData.slug = generateSlug(sanitized.name);
  }
  if (input.sortOrder !== undefined) { updateData.sortOrder = input.sortOrder; }
  if (input.isActive !== undefined) { updateData.isActive = input.isActive; }

  // Handle image removal
  if (input.removeImage) {
    updateData.imageUrl = '';
    updateData.imagePublicId = '';
  }

  // Handle new image upload
  if (input.image) {
    const result = await uploadToCloudinaryClient(
      input.image.base64,
      CLOUDINARY_FOLDERS.CATEGORY_IMAGES,
      `${Date.now()}_${input.image.fileName}`,
    );
    updateData.imageUrl = result.url;
    updateData.imagePublicId = result.publicId;
  }

  await updateDoc(categoryRef, updateData);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  const categorySnap = await getDoc(categoryRef);

  if (!categorySnap.exists()) {
    throw new Error('Category not found');
  }

  // Query products collection directly to check for any active products under this category
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where('categoryId', '==', categoryId),
    limit(1),
  );
  const productsSnap = await getDocs(q);

  if (!productsSnap.empty) {
    throw new Error('Cannot delete category with active products. Move or delete them first.');
  }

  await deleteDoc(categoryRef);
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
  const orderRef = doc(db, COLLECTIONS.ORDERS, input.orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const order = orderSnap.data() as Order;

  // Validate status transition
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions.includes(input.status)) {
    throw new Error(
      `Cannot transition from "${order.status}" to "${input.status}". Allowed: ${allowedTransitions.join(', ') || 'none'}`,
    );
  }

  const now = new Date();
  const updateData: Record<string, any> = {
    status: input.status,
    updatedAt: now,
    statusHistory: arrayUnion({
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
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, item.productId), {
        stock: increment(item.quantity),
      });
    }
    updateData.cancelReason = input.note || 'Cancelled by admin';
  }

  await updateDoc(orderRef, updateData);
}

// ──── Users ────

export async function setAdminRole(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role: 'admin',
    updatedAt: new Date(),
  });
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
  storeName: '',
  storePhone: '',
  storeEmail: '',
  storeAddress: '',
  deliveryFee: DELIVERY_CONFIG.DELIVERY_FEE,
  freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
  minOrderAmount: DELIVERY_CONFIG.MIN_ORDER_AMOUNT,
  minOrderLimit: 0,
  deliverySlots: DEFAULT_DELIVERY_SLOTS.map((slot) => ({ ...slot, active: true })),
  bannerTitle: '',
  bannerSubtitle: '',
  bannerOffer: '',
  bannerImageUrl: '',
  bannerImagePublicId: '',
  ribbonLabel: '',
  ribbonPercent: '',
  ribbonSubLabel: '',
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
