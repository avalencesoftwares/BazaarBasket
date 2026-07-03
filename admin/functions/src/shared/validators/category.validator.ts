// packages/shared/src/validators/category.validator.ts
// Zod schemas for category validation

import { z } from 'zod';

const imageInputSchema = z.object({
  base64: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Only JPEG, PNG, and WebP images are allowed' }),
  }),
  fileName: z.string().min(1, 'File name is required'),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .trim(),
  image: imageInputSchema.optional(),
  sortOrder: z
    .number()
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be non-negative')
    .max(1000, 'Sort order must not exceed 1000')
    .default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .trim()
    .optional(),
  image: imageInputSchema.optional(),
  removeImage: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategorySchemaType = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>;
