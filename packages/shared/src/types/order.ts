// packages/shared/src/types/order.ts
// Order-related type definitions for Firestore documents

import { OrderStatus, PaymentStatus, PaymentMethod } from '../enums';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  mrp: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface OrderAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface OrderDeliverySlot {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  deliveryAddress: OrderAddress;
  deliverySlot: OrderDeliverySlot;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  itemsTotal: number;
  deliveryFee: number;
  gstAmount: number;
  discount: number;
  totalAmount: number;
  notes: string;
  cancelReason: string;
  idempotencyKey: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceOrderInput {
  deliveryAddress: OrderAddress;
  deliverySlot: OrderDeliverySlot;
  paymentMethod: PaymentMethod;
  notes: string;
  idempotencyKey: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  note: string;
}

export interface CancelOrderInput {
  orderId: string;
  reason: string;
}
