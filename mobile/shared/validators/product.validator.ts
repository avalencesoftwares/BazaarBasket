// packages/shared/src/validators/product.validator.ts
// Zod schemas for product validation

import { z } from 'zod';
import { GST_SLAB_VALUES } from '../enums';

const imageInputSchema = z.object({
  base64: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Only JPEG, PNG, and WebP images are allowed' }),
  }),
  fileName: z.string().min(1, 'File name is required'),
});

export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .default(''),
    categoryId: z.string().min(1, 'Category is required'),
    price: z
      .number()
      .positive('Price must be a positive number')
      .max(1000000, 'Price must not exceed ₹10,00,000'),
    mrp: z
      .number()
      .positive('MRP must be a positive number')
      .max(1000000, 'MRP must not exceed ₹10,00,000'),
    unit: z
      .string()
      .min(1, 'Unit is required')
      .max(50, 'Unit must not exceed 50 characters')
      .trim(),
    stock: z
      .number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .max(100000, 'Stock must not exceed 1,00,000'),
    images: z
      .array(imageInputSchema)
      .max(5, 'Maximum 5 images allowed')
      .default([]),
    isActive: z.boolean().default(true),
    tags: z
      .array(z.string().trim().min(1).max(50))
      .max(20, 'Maximum 20 tags allowed')
      .default([]),
    gstSlab: z.union(
      [z.literal(0), z.literal(5), z.literal(12), z.literal(18)],
      { errorMap: () => ({ message: `GST slab must be one of: ${GST_SLAB_VALUES.join(', ')}%` }) },
    ),
  })
  .refine((data) => data.price <= data.mrp, {
    message: 'Selling price cannot exceed MRP',
    path: ['price'],
  });

export const updateProductSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required'),
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional(),
    categoryId: z.string().min(1).optional(),
    price: z
      .number()
      .positive('Price must be a positive number')
      .max(1000000)
      .optional(),
    mrp: z
      .number()
      .positive('MRP must be a positive number')
      .max(1000000)
      .optional(),
    unit: z.string().min(1).max(50).trim().optional(),
    stock: z.number().int().min(0).max(100000).optional(),
    imagesToAdd: z.array(imageInputSchema).max(5).optional(),
    imagesToRemove: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    gstSlab: z
      .union([z.literal(0), z.literal(5), z.literal(12), z.literal(18)])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.price !== undefined && data.mrp !== undefined) {
        return data.price <= data.mrp;
      }
      return true;
    },
    {
      message: 'Selling price cannot exceed MRP',
      path: ['price'],
    },
  );

export const updateProductStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  delta: z.number().int('Delta must be a whole number'),
});

export type CreateProductSchemaType = z.infer<typeof createProductSchema>;
export type UpdateProductSchemaType = z.infer<typeof updateProductSchema>;
export type UpdateProductStockSchemaType = z.infer<typeof updateProductStockSchema>;
