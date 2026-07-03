// packages/shared/src/utils/sanitize.test.ts
// Unit tests for input sanitization utilities

import { stripHtmlTags, sanitizeInput, sanitizeObject, escapeSearchQuery } from './sanitize';

describe('stripHtmlTags', () => {
  it('should remove HTML tags from a string', () => {
    expect(stripHtmlTags('<b>Hello</b>')).toBe('Hello');
  });

  it('should remove script tags', () => {
    expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('should handle nested tags', () => {
    expect(stripHtmlTags('<div><p>Hello</p></div>')).toBe('Hello');
  });

  it('should return empty string for null', () => {
    expect(stripHtmlTags(null as unknown as string)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(stripHtmlTags(undefined as unknown as string)).toBe('');
  });

  it('should return plain text unchanged', () => {
    expect(stripHtmlTags('Hello World')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('should remove self-closing tags', () => {
    expect(stripHtmlTags('Hello<br/>World')).toBe('HelloWorld');
  });
});

describe('sanitizeInput', () => {
  it('should strip HTML and trim whitespace', () => {
    expect(sanitizeInput('  Hello   <b>World</b>  ')).toBe('Hello World');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitizeInput('Hello     World')).toBe('Hello World');
  });

  it('should return empty string for null', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('');
  });

  it('should handle strings with only whitespace', () => {
    expect(sanitizeInput('   ')).toBe('');
  });

  it('should preserve single spaces between words', () => {
    expect(sanitizeInput('Fresh Organic Tomatoes')).toBe('Fresh Organic Tomatoes');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize all string values in an object', () => {
    const input = {
      name: '  <b>Tomato</b>  ',
      price: 50,
      description: '<script>alert("xss")</script>Fresh tomato',
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('Tomato');
    expect(result.price).toBe(50);
    expect(result.description).toBe('alert("xss")Fresh tomato');
  });

  it('should handle nested objects', () => {
    const input = {
      product: {
        name: '  <b>Test</b>  ',
      },
    };
    const result = sanitizeObject(input);
    expect((result.product as Record<string, unknown>).name).toBe('Test');
  });

  it('should not modify non-string values', () => {
    const input = { count: 5, active: true, items: [1, 2, 3] };
    const result = sanitizeObject(input);
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
    expect(result.items).toEqual([1, 2, 3]);
  });
});

describe('escapeSearchQuery', () => {
  it('should escape regex special characters', () => {
    expect(escapeSearchQuery('price (500g)')).toBe('price \\(500g\\)');
  });

  it('should escape dots', () => {
    expect(escapeSearchQuery('1.5kg')).toBe('1\\.5kg');
  });

  it('should return empty string for null', () => {
    expect(escapeSearchQuery(null as unknown as string)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(escapeSearchQuery('  hello  ')).toBe('hello');
  });

  it('should handle plain text without modification', () => {
    expect(escapeSearchQuery('tomato')).toBe('tomato');
  });
});
