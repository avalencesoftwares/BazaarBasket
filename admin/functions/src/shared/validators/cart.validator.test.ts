// packages/shared/src/validators/cart.validator.test.ts
// Unit tests for cart Zod validators

import { addToCartSchema, updateCartQuantitySchema, removeFromCartSchema } from './cart.validator';

describe('addToCartSchema', () => {
  it('should accept valid input', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: 2 });
    expect(result.success).toBe(true);
  });

  it('should reject zero quantity', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject negative quantity', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject quantity over 50', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: 51 });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer quantity', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: 1.5 });
    expect(result.success).toBe(false);
  });

  it('should reject empty productId', () => {
    const result = addToCartSchema.safeParse({ productId: '', quantity: 1 });
    expect(result.success).toBe(false);
  });

  it('should reject missing productId', () => {
    const result = addToCartSchema.safeParse({ quantity: 1 });
    expect(result.success).toBe(false);
  });

  it('should accept maximum quantity of 50', () => {
    const result = addToCartSchema.safeParse({ productId: 'prod_123', quantity: 50 });
    expect(result.success).toBe(true);
  });
});

describe('updateCartQuantitySchema', () => {
  it('should accept valid update', () => {
    const result = updateCartQuantitySchema.safeParse({ productId: 'prod_123', quantity: 5 });
    expect(result.success).toBe(true);
  });

  it('should reject zero quantity', () => {
    const result = updateCartQuantitySchema.safeParse({ productId: 'prod_123', quantity: 0 });
    expect(result.success).toBe(false);
  });
});

describe('removeFromCartSchema', () => {
  it('should accept valid productId', () => {
    const result = removeFromCartSchema.safeParse({ productId: 'prod_123' });
    expect(result.success).toBe(true);
  });

  it('should reject empty productId', () => {
    const result = removeFromCartSchema.safeParse({ productId: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing productId', () => {
    const result = removeFromCartSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
