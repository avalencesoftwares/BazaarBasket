// packages/shared/src/utils/sanitize.ts
// Input sanitization utilities to prevent XSS and injection

/**
 * Strip all HTML tags from a string.
 *
 * @example
 * stripHtmlTags('<b>Hello</b> <script>alert("xss")</script>')
 * // "Hello alert(\"xss\")"
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input: strip HTML, trim whitespace, collapse multiple spaces.
 *
 * @example
 * sanitizeInput('  Hello   <b>World</b>  ')
 * // "Hello World"
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return stripHtmlTags(input)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize all string values in an object recursively.
 * Non-string values are passed through unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const value = result[key as keyof T];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
      );
    }
  }
  return result;
}

/**
 * Escape special characters for use in search queries.
 */
export function escapeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
}
