// packages/functions/src/middleware/throttler.ts
// Token bucket write throttle for high-frequency operations like cart updates

import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { COLLECTIONS, RATE_LIMIT } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

interface ThrottleRecord {
  tokens: number;
  lastRefill: number;
}

/**
 * Token bucket throttler for write operations.
 * Limits writes to a max rate per second per user.
 *
 * @param userId - The user ID to throttle
 * @param maxTokens - Maximum tokens (writes) per second (default: 10)
 */
export async function checkWriteThrottle(
  userId: string,
  maxTokens: number = RATE_LIMIT.CART_WRITES_PER_SECOND,
): Promise<void> {
  const db = getFirestore();
  const now = Date.now();
  const docRef = db.collection(COLLECTIONS.RATE_LIMITS).doc(`throttle_${userId}`);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const data = doc.data() as ThrottleRecord | undefined;

    if (!data) {
      // First write — initialize bucket with one token consumed
      transaction.set(docRef, {
        tokens: maxTokens - 1,
        lastRefill: now,
      });
      return;
    }

    // Calculate tokens to add based on elapsed time
    const elapsed = now - data.lastRefill;
    const tokensToAdd = Math.floor((elapsed / 1000) * maxTokens);
    const currentTokens = Math.min(maxTokens, data.tokens + tokensToAdd);

    if (currentTokens < 1) {
      logger.warn('Write throttle exceeded', {
        userId,
        action: 'checkWriteThrottle',
        tokens: String(currentTokens),
      });
      throw new HttpsError(
        'resource-exhausted',
        'Too many writes. Please slow down.',
      );
    }

    // Consume one token
    transaction.set(docRef, {
      tokens: currentTokens - 1,
      lastRefill: tokensToAdd > 0 ? now : data.lastRefill,
    });
  });
}
