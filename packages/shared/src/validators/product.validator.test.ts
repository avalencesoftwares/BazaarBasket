// packages/shared/src/validators/product.validator.test.ts
// Unit tests for product Zod validators

import { createProductSchema, updateProductSchema, updateProductStockSchema } from './product.validator';

describe('createProductSchema', () => {
  const validProduct = {
    name: 'Fresh Organic Tomatoes',
    description: 'Farm-fresh organic tomatoes',
    categoryId: 'cat_vegetables',
    price: 40,
    mrp: 50,
    unit: '500g',
    stock: 100,
    images: [],
    isActive: true,
    tags: ['organic', 'fresh'],
    gstSlab: 0 as const,
  };

  it('should accept a valid product', () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject when name is too short', () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });

  it('should reject when price exceeds MRP', () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 60, mrp: 50 });
    expect(result.success).toBe(false);
  });

  it('should reject when categoryId is empty', () => {
    const result = createProductSchema.safeParse({ ...validProduct, categoryId: '' });
    expect(result.success).toBe(false);
  });

  it('should reject negative stock', () => {
    const result = createProductSchema.safeParse({ ...validProduct, stock: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid GST slab', () => {
    const result = createProductSchema.safeParse({ ...validProduct, gstSlab: 7 });
    expect(result.success).toBe(false);
  });

  it('should accept all valid GST slabs', () => {
    for (const slab of [0, 5, 12, 18] as const) {
      const result = createProductSchema.safeParse({ ...validProduct, gstSlab: slab });
      expect(result.success).toBe(true);
    }
  });

  it('should reject more than 5 images', () => {
    const images = Array.from({ length: 6 }, (_, i) => ({
      base64: `data:image/jpeg;base64,test${i}`,
      mimeType: 'image/jpeg' as const,
      fileName: `image${i}.jpg`,
    }));
    const result = createProductSchema.safeParse({ ...validProduct, images });
    expect(result.success).toBe(false);
  });

  it('should reject invalid image mime type', () => {
    const images = [
      { base64: 'data:image/gif;base64,test', mimeType: 'image/gif', fileName: 'image.gif' },
    ];
    const result = createProductSchema.safeParse({ ...validProduct, images });
    expect(result.success).toBe(false);
  });

  it('should accept when price equals MRP', () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 50, mrp: 50 });
    expect(result.success).toBe(true);
  });

  it('should default isActive to true when not provided', () => {
    const { isActive: _, ...withoutActive } = validProduct;
    const result = createProductSchema.safeParse(withoutActive);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });
});

describe('updateProductSchema', () => {
  it('should accept a valid partial update', () => {
    const result = updateProductSchema.safeParse({
      productId: 'prod_123',
      name: 'Updated Name',
      price: 45,
    });
    expect(result.success).toBe(true);
  });

  it('should require productId', () => {
    const result = updateProductSchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(false);
  });

  it('should accept productId only', () => {
    const result = updateProductSchema.safeParse({ productId: 'prod_123' });
    expect(result.success).toBe(true);
  });

  it('should reject when price exceeds mrp (both provided)', () => {
    const result = updateProductSchema.safeParse({
      productId: 'prod_123',
      price: 60,
      mrp: 50,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateProductStockSchema', () => {
  it('should accept positive delta', () => {
    const result = updateProductStockSchema.safeParse({ productId: 'prod_123', delta: 10 });
    expect(result.success).toBe(true);
  });

  it('should accept negative delta', () => {
    const result = updateProductStockSchema.safeParse({ productId: 'prod_123', delta: -5 });
    expect(result.success).toBe(true);
  });

  it('should reject non-integer delta', () => {
    const result = updateProductStockSchema.safeParse({ productId: 'prod_123', delta: 1.5 });
    expect(result.success).toBe(false);
  });

  it('should require productId', () => {
    const result = updateProductStockSchema.safeParse({ delta: 10 });
    expect(result.success).toBe(false);
  });
});
