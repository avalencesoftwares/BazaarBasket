// packages/shared/src/utils/currency.ts
// Indian Rupee currency formatting utilities

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const INR_COMPACT_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * Format a number as Indian Rupees (₹).
 * Returns "₹0" for null/undefined/NaN.
 *
 * @example
 * formatCurrency(1500)     // "₹1,500"
 * formatCurrency(0)        // "₹0"
 * formatCurrency(99.50)    // "₹99.50"
 * formatCurrency(undefined) // "₹0"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return INR_FORMATTER.format(0);
  }
  return INR_FORMATTER.format(amount);
}

/**
 * Format a large number as compact Indian Rupees.
 *
 * @example
 * formatCurrencyCompact(150000)  // "₹1.5L"
 * formatCurrencyCompact(1500000) // "₹15L"
 */
export function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return INR_COMPACT_FORMATTER.format(0);
  }
  return INR_COMPACT_FORMATTER.format(amount);
}

/**
 * Calculate discount percentage between MRP and selling price.
 *
 * @example
 * calculateDiscount(100, 80)  // 20
 * calculateDiscount(100, 100) // 0
 * calculateDiscount(0, 0)     // 0
 */
export function calculateDiscount(mrp: number, price: number): number {
  if (!mrp || mrp <= 0 || price < 0) {
    return 0;
  }
  if (price >= mrp) {
    return 0;
  }
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Calculate GST amount from a base price and GST slab percentage.
 *
 * @example
 * calculateGST(1000, 18) // 180
 * calculateGST(1000, 0)  // 0
 */
export function calculateGST(baseAmount: number, gstPercentage: number): number {
  if (!baseAmount || baseAmount <= 0 || !gstPercentage || gstPercentage <= 0) {
    return 0;
  }
  return Math.round((baseAmount * gstPercentage) / 100);
}
