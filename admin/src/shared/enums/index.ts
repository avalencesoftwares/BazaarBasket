// packages/shared/src/enums/index.ts
// All enumerations used across the platform

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PACKED = 'packed',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  ONLINE = 'online',
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export enum GSTSlab {
  ZERO = 0,
  FIVE = 5,
  TWELVE = 12,
  EIGHTEEN = 18,
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Completed',
  [OrderStatus.PACKED]: 'Completed',
  [OrderStatus.OUT_FOR_DELIVERY]: 'Completed',
  [OrderStatus.DELIVERED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PAID]: 'Paid',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
  [PaymentMethod.ONLINE]: 'Online Payment',
};

/**
 * Defines valid order status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [],
  [OrderStatus.PACKED]: [],
  [OrderStatus.OUT_FOR_DELIVERY]: [],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const GST_SLAB_VALUES = [0, 5, 12, 18] as const;
export type GSTSlabValue = (typeof GST_SLAB_VALUES)[number];
