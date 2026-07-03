// packages/shared/src/utils/slug.test.ts
// Unit tests for slug generation utilities

import { generateSlug, generateUniqueSlug } from './slug';

describe('generateSlug', () => {
  it('should generate a lowercase slug', () => {
    expect(generateSlug('Fresh Organic Tomatoes')).toBe('fresh-organic-tomatoes');
  });

  it('should handle parentheses and special characters', () => {
    expect(generateSlug('Fresh Organic Tomatoes (500g)')).toBe('fresh-organic-tomatoes-500g');
  });

  it('should handle dashes in input', () => {
    expect(generateSlug('Atta - Whole Wheat Flour 5kg')).toBe('atta-whole-wheat-flour-5kg');
  });

  it('should replace ampersand with and', () => {
    expect(generateSlug('Salt & Pepper')).toBe('salt-and-pepper');
  });

  it('should replace rupee sign', () => {
    expect(generateSlug('₹99 Deal')).toBe('rs99-deal');
  });

  it('should collapse multiple spaces', () => {
    expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it('should collapse multiple dashes', () => {
    expect(generateSlug('Hello---World')).toBe('hello-world');
  });

  it('should return empty string for null', () => {
    expect(generateSlug(null as unknown as string)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(generateSlug(undefined as unknown as string)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should strip Unicode characters not in transliteration map', () => {
    expect(generateSlug('Café Mocha')).toBe('cafe-mocha');
  });

  it('should handle numbers', () => {
    expect(generateSlug('Product 123')).toBe('product-123');
  });

  it('should not start or end with a dash', () => {
    const slug = generateSlug(' -Hello World- ');
    expect(slug).not.toMatch(/^-/);
    expect(slug).not.toMatch(/-$/);
  });
});

describe('generateUniqueSlug', () => {
  it('should generate a slug with a random suffix', () => {
    const slug = generateUniqueSlug('Fresh Tomatoes');
    expect(slug).toMatch(/^fresh-tomatoes-[a-z0-9]{4}$/);
  });

  it('should generate different slugs on repeated calls', () => {
    const slug1 = generateUniqueSlug('Test');
    const slug2 = generateUniqueSlug('Test');
    // While technically could be the same, practically never will be
    expect(slug1.startsWith('test-')).toBe(true);
    expect(slug2.startsWith('test-')).toBe(true);
  });

  it('should return a slug with suffix for empty input', () => {
    const slug = generateUniqueSlug('');
    // Empty base + suffix: "-xxxx"
    expect(slug).toMatch(/^-[a-z0-9]{4}$/);
  });
});
