// packages/functions/src/middleware/rateLimiter.ts
// Sliding window rate limiter using Firestore counters

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { COLLECTIONS, RATE_LIMIT } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

/**
 * Check rate limit for a user using a sliding window approach.
 * Stores counters in Firestore rateLimits collection.
 *
 * @param userId - The user ID to rate limit
 * @param maxRequests - Max requests per window (default: 100)
 * @param windowMs - Window size in ms (default: 60000 = 1 minute)
 */
export async function checkRateLimit(
  userId: string,
  maxRequests: number = RATE_LIMIT.MAX_REQUESTS_PER_MINUTE,
  windowMs: number = RATE_LIMIT.WINDOW_SIZE_MS,
): Promise<void> {
  const db = getFirestore();
  const now = Date.now();
  const docRef = db.collection(COLLECTIONS.RATE_LIMITS).doc(`rate_${userId}`);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const data = doc.data() as RateLimitRecord | undefined;

    if (!data) {
      // First request — create a new window
      transaction.set(docRef, { count: 1, windowStart: now });
      return;
    }

    const windowAge = now - data.windowStart;

    if (windowAge > windowMs) {
      // Window expired — reset
      transaction.set(docRef, { count: 1, windowStart: now });
      return;
    }

    if (data.count >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        userId,
        action: 'checkRateLimit',
        count: String(data.count),
        maxRequests: String(maxRequests),
      });
      throw new HttpsError(
        'resource-exhausted',
        'Too many requests. Please try again later.',
      );
    }

    // Increment counter within the window
    transaction.update(docRef, { count: FieldValue.increment(1) });
  });
}
