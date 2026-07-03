// packages/shared/src/utils/index.ts
// Barrel export of all utilities

export {
  formatCurrency,
  formatCurrencyCompact,
  calculateDiscount,
  calculateGST,
} from './currency';

export {
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeTime,
  toISTString,
  getTodayIST,
  getNextNDays,
} from './date';

export { stripHtmlTags, sanitizeInput, sanitizeObject, escapeSearchQuery } from './sanitize';

export { generateSlug, generateUniqueSlug } from './slug';
