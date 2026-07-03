// packages/shared/src/validators/order.validator.test.ts
// Unit tests for order Zod validators

import { placeOrderSchema, updateOrderStatusSchema, cancelOrderSchema } from './order.validator';
import { OrderStatus, PaymentMethod } from '../enums';

describe('placeOrderSchema', () => {
  const validOrder = {
    deliveryAddress: {
      id: 'addr_1',
      label: 'Home',
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      addressLine1: '123 MG Road',
      addressLine2: 'Near City Mall',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      landmark: 'Opposite to park',
    },
    deliverySlot: {
      date: '2026-06-20',
      startTime: '09:00',
      endTime: '12:00',
      label: 'Morning (9 AM - 12 PM)',
    },
    paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    notes: 'Please ring the bell twice',
    idempotencyKey: 'order_123_abc',
  };

  it('should accept a valid order', () => {
    const result = placeOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('should reject invalid phone number', () => {
    const result = placeOrderSchema.safeParse({
      ...validOrder,
      deliveryAddress: { ...validOrder.deliveryAddress, phone: '12345' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid pincode', () => {
    const result = placeOrderSchema.safeParse({
      ...validOrder,
      deliveryAddress: { ...validOrder.deliveryAddress, pincode: '123' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing idempotency key', () => {
    const { idempotencyKey: _, ...withoutKey } = validOrder;
    const result = placeOrderSchema.safeParse(withoutKey);
    expect(result.success).toBe(false);
  });

  it('should reject missing delivery address', () => {
    const { deliveryAddress: _, ...withoutAddr } = validOrder;
    const result = placeOrderSchema.safeParse(withoutAddr);
    expect(result.success).toBe(false);
  });

  it('should accept phone numbers starting with 6-9', () => {
    for (const start of ['6', '7', '8', '9']) {
      const result = placeOrderSchema.safeParse({
        ...validOrder,
        deliveryAddress: {
          ...validOrder.deliveryAddress,
          phone: `${start}000000000`,
        },
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject phone numbers starting with 0-5', () => {
    for (const start of ['0', '1', '2', '3', '4', '5']) {
      const result = placeOrderSchema.safeParse({
        ...validOrder,
        deliveryAddress: {
          ...validOrder.deliveryAddress,
          phone: `${start}000000000`,
        },
      });
      expect(result.success).toBe(false);
    }
  });

  it('should default notes to empty string', () => {
    const { notes: _, ...withoutNotes } = validOrder;
    const result = placeOrderSchema.safeParse(withoutNotes);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe('');
    }
  });
});

describe('updateOrderStatusSchema', () => {
  it('should accept a valid status update', () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: 'order_123',
      status: OrderStatus.CONFIRMED,
      note: 'Order confirmed by admin',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing orderId', () => {
    const result = updateOrderStatusSchema.safeParse({
      status: OrderStatus.CONFIRMED,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status value', () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: 'order_123',
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('should default note to empty string', () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: 'order_123',
      status: OrderStatus.PACKED,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe('');
    }
  });
});

describe('cancelOrderSchema', () => {
  it('should accept a valid cancellation', () => {
    const result = cancelOrderSchema.safeParse({
      orderId: 'order_123',
      reason: 'Changed my mind about the order',
    });
    expect(result.success).toBe(true);
  });

  it('should reject reason shorter than 5 characters', () => {
    const result = cancelOrderSchema.safeParse({
      orderId: 'order_123',
      reason: 'No',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing orderId', () => {
    const result = cancelOrderSchema.safeParse({
      reason: 'Valid reason here',
    });
    expect(result.success).toBe(false);
  });

  it('should reject reason longer than 500 characters', () => {
    const result = cancelOrderSchema.safeParse({
      orderId: 'order_123',
      reason: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
