// packages/shared/src/validators/cart.validator.ts
// Zod schemas for cart validation

import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Maximum 50 units per item'),
});

export const updateCartQuantitySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Maximum 50 units per item'),
});

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type AddToCartSchemaType = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantitySchemaType = z.infer<typeof updateCartQuantitySchema>;
export type RemoveFromCartSchemaType = z.infer<typeof removeFromCartSchema>;
