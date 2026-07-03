// packages/functions/src/middleware/validator.test.ts
// Unit tests for input validation middleware

import { z } from 'zod';
import { validateInput } from './validator';

// Mock firebase-functions logger
jest.mock('firebase-functions', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('validateInput', () => {
  const testSchema = z.object({
    name: z.string().min(2),
    age: z.number().int().positive(),
    email: z.string().email().optional(),
  });

  it('should return parsed data for valid input', () => {
    const input = { name: 'John', age: 25, email: 'john@example.com' };
    const result = validateInput(testSchema, input);
    expect(result).toEqual(input);
  });

  it('should throw invalid-argument for missing required field', () => {
    const input = { age: 25 };
    expect(() => validateInput(testSchema, input)).toThrow();
    try {
      validateInput(testSchema, input);
    } catch (error: unknown) {
      const httpsError = error as { code: string; message: string };
      expect(httpsError.code).toBe('invalid-argument');
      expect(httpsError.message).toContain('Validation failed');
    }
  });

  it('should throw for invalid field type', () => {
    const input = { name: 'John', age: 'twenty-five' };
    expect(() => validateInput(testSchema, input)).toThrow();
  });

  it('should throw for failing validation rules', () => {
    const input = { name: 'J', age: 25 }; // name too short
    expect(() => validateInput(testSchema, input)).toThrow();
  });

  it('should accept input without optional fields', () => {
    const input = { name: 'John', age: 25 };
    const result = validateInput(testSchema, input);
    expect(result.name).toBe('John');
    expect(result.age).toBe(25);
    expect(result.email).toBeUndefined();
  });

  it('should throw for negative age', () => {
    const input = { name: 'John', age: -5 };
    expect(() => validateInput(testSchema, input)).toThrow();
  });

  it('should include field path in error message', () => {
    const input = { name: 'J', age: 25 };
    try {
      validateInput(testSchema, input);
    } catch (error: unknown) {
      const httpsError = error as { message: string };
      expect(httpsError.message).toContain('name');
    }
  });
});
