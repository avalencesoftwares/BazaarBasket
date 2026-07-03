// packages/shared/src/utils/slug.ts
// URL-safe slug generation from strings

/**
 * Generate a URL-safe slug from a string.
 * Handles Unicode characters by transliterating common ones and stripping the rest.
 *
 * @example
 * generateSlug('Fresh Organic Tomatoes (500g)')  // "fresh-organic-tomatoes-500g"
 * generateSlug('Atta - Whole Wheat Flour 5kg')   // "atta-whole-wheat-flour-5kg"
 * generateSlug('Amul Taaza Toned Milk (1L)')     // "amul-taaza-toned-milk-1l"
 * generateSlug('  Multiple   Spaces  ')          // "multiple-spaces"
 */
export function generateSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'and')
    .replace(/[₹]/g, 'rs')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique slug by appending a random suffix.
 *
 * @example
 * generateUniqueSlug('Fresh Tomatoes')  // "fresh-tomatoes-a3b7"
 */
export function generateUniqueSlug(input: string): string {
  const base = generateSlug(input);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}
