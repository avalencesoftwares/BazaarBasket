// packages/shared/src/constants/index.ts
// Shared constants used across the platform

/**
 * Firestore collection names — single source of truth.
 */
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  CATEGORIES: 'categories',
  CARTS: 'carts',
  RATE_LIMITS: 'rateLimits',
  DELIVERY_SLOTS: 'deliverySlots',
  SETTINGS: 'settings',
} as const;

/**
 * Cloudinary folder paths for image organization.
 */
export const CLOUDINARY_FOLDERS = {
  PRODUCT_IMAGES: 'bazaarbasket/products',
  CATEGORY_IMAGES: 'bazaarbasket/categories',
  USER_AVATARS: 'bazaarbasket/users',
} as const;

/**
 * Default delivery slot definitions.
 * Customers can choose any slot; admin can configure availability.
 */
export const DEFAULT_DELIVERY_SLOTS = [
  { id: 'morning', label: 'Morning', startTime: '09:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Afternoon', startTime: '12:00', endTime: '15:00' },
  { id: 'evening', label: 'Evening', startTime: '15:00', endTime: '18:00' },
  { id: 'night', label: 'Night', startTime: '18:00', endTime: '21:00' },
] as const;

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Stock thresholds.
 */
export const LOW_STOCK_THRESHOLD = 10;

/**
 * Rate limiting configuration.
 */
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 100,
  CART_WRITES_PER_SECOND: 10,
  WINDOW_SIZE_MS: 60_000,
} as const;

/**
 * Image upload constraints.
 */
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_PRODUCT_IMAGES: 5,
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 400,
  FULL_WIDTH: 800,
  FULL_HEIGHT: 800,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Delivery fee configuration.
 */
export const DELIVERY_CONFIG = {
  FREE_DELIVERY_THRESHOLD: 499,
  DELIVERY_FEE: 30,
  MIN_ORDER_AMOUNT: 99,
} as const;

/**
 * Indian states list for address dropdowns.
 */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;
