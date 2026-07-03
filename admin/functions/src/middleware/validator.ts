// packages/functions/src/middleware/validator.ts
// Input validation middleware using Zod schemas

import { HttpsError } from 'firebase-functions/v2/https';
import { type ZodSchema, type ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Validate input data against a Zod schema.
 * Throws HttpsError('invalid-argument') with detailed error messages on failure.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The input data to validate
 * @returns The parsed and validated data
 */
export function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = formatZodErrors(result.error);

    logger.warn('Input validation failed', {
      action: 'validateInput',
      errors: JSON.stringify(errors),
    });

    throw new HttpsError(
      'invalid-argument',
      `Validation failed: ${errors.join('; ')}`,
    );
  }

  return result.data;
}

/**
 * Format Zod validation errors into human-readable messages.
 */
function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}
