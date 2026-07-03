// packages/shared/src/utils/currency.test.ts
// Unit tests for currency formatting utilities

import { formatCurrency, formatCurrencyCompact, calculateDiscount, calculateGST } from './currency';

describe('formatCurrency', () => {
  it('should format a positive number as Indian Rupees', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
    expect(result).toContain('₹');
  });

  it('should format zero as ₹0', () => {
    const result = formatCurrency(0);
    expect(result).toContain('₹');
    expect(result).toContain('0');
  });

  it('should handle decimal prices', () => {
    const result = formatCurrency(99.5);
    expect(result).toContain('99.5');
    expect(result).toContain('₹');
  });

  it('should return ₹0 for null', () => {
    const result = formatCurrency(null);
    expect(result).toContain('₹');
    expect(result).toContain('0');
  });

  it('should return ₹0 for undefined', () => {
    const result = formatCurrency(undefined);
    expect(result).toContain('₹');
    expect(result).toContain('0');
  });

  it('should return ₹0 for NaN', () => {
    const result = formatCurrency(NaN);
    expect(result).toContain('₹');
    expect(result).toContain('0');
  });

  it('should format large numbers with Indian comma grouping', () => {
    const result = formatCurrency(1234567);
    expect(result).toContain('₹');
    // Indian number system: 12,34,567
    expect(result).toContain('12,34,567');
  });
});

describe('formatCurrencyCompact', () => {
  it('should format large numbers in compact notation', () => {
    const result = formatCurrencyCompact(150000);
    expect(result).toContain('₹');
    // Should contain 'L' for Lakh or 'T' for thousands
    expect(result.length).toBeLessThan(15);
  });

  it('should return ₹0 for null', () => {
    const result = formatCurrencyCompact(null);
    expect(result).toContain('₹');
  });

  it('should return ₹0 for undefined', () => {
    const result = formatCurrencyCompact(undefined);
    expect(result).toContain('₹');
  });
});

describe('calculateDiscount', () => {
  it('should calculate correct discount percentage', () => {
    expect(calculateDiscount(100, 80)).toBe(20);
  });

  it('should return 0 when price equals MRP', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });

  it('should return 0 when MRP is 0', () => {
    expect(calculateDiscount(0, 0)).toBe(0);
  });

  it('should return 0 when price exceeds MRP', () => {
    expect(calculateDiscount(80, 100)).toBe(0);
  });

  it('should return 0 for negative MRP', () => {
    expect(calculateDiscount(-100, 80)).toBe(0);
  });

  it('should round discount to nearest integer', () => {
    expect(calculateDiscount(300, 199)).toBe(34); // 33.67 → 34
  });

  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });
});

describe('calculateGST', () => {
  it('should calculate 18% GST correctly', () => {
    expect(calculateGST(1000, 18)).toBe(180);
  });

  it('should return 0 for 0% GST', () => {
    expect(calculateGST(1000, 0)).toBe(0);
  });

  it('should return 0 for zero base amount', () => {
    expect(calculateGST(0, 18)).toBe(0);
  });

  it('should return 0 for negative base amount', () => {
    expect(calculateGST(-1000, 18)).toBe(0);
  });

  it('should round GST to nearest integer', () => {
    expect(calculateGST(333, 5)).toBe(17); // 16.65 → 17
  });

  it('should calculate 5% GST correctly', () => {
    expect(calculateGST(200, 5)).toBe(10);
  });

  it('should calculate 12% GST correctly', () => {
    expect(calculateGST(500, 12)).toBe(60);
  });
});
