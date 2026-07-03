// packages/shared/src/validators/order.validator.ts
// Zod schemas for order validation

import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '../enums';

const orderAddressSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Address label is required'),
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(5, 'Address line 1 is required').max(200),
  addressLine2: z.string().max(200).default(''),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  landmark: z.string().max(200).default(''),
});

const deliverySlotSchema = z.object({
  date: z.string().min(1, 'Delivery date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  label: z.string().min(1, 'Slot label is required'),
});

export const placeOrderSchema = z.object({
  deliveryAddress: orderAddressSchema,
  deliverySlot: deliverySlotSchema,
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').default(''),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  note: z.string().max(500).default(''),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z
    .string()
    .min(5, 'Please provide a reason for cancellation (min 5 characters)')
    .max(500, 'Reason must not exceed 500 characters'),
});

export type PlaceOrderSchemaType = z.infer<typeof placeOrderSchema>;
export type UpdateOrderStatusSchemaType = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderSchemaType = z.infer<typeof cancelOrderSchema>;
