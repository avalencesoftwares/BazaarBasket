// packages/shared/src/validators/user.validator.ts
// Zod schemas for user validation

import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  email: z.string().email('Enter a valid email address').optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional(),
  photoUrl: z.string().url('Enter a valid URL').optional(),
});

export const addressSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required (e.g., Home, Work)')
    .max(50, 'Label must not exceed 50 characters')
    .trim(),
  fullName: z
    .string()
    .min(2, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  addressLine1: z
    .string()
    .min(5, 'Address line 1 is required (min 5 characters)')
    .max(200, 'Address must not exceed 200 characters')
    .trim(),
  addressLine2: z
    .string()
    .max(200, 'Address must not exceed 200 characters')
    .trim()
    .default(''),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City must not exceed 100 characters')
    .trim(),
  state: z
    .string()
    .min(2, 'State is required')
    .max(100, 'State must not exceed 100 characters')
    .trim(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  landmark: z
    .string()
    .max(200, 'Landmark must not exceed 200 characters')
    .trim()
    .default(''),
  isDefault: z.boolean().default(false),
});

export type UpdateUserProfileSchemaType = z.infer<typeof updateUserProfileSchema>;
export type AddressSchemaType = z.infer<typeof addressSchema>;
