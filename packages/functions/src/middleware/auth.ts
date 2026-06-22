// packages/functions/src/middleware/auth.ts
// Authentication and authorization middleware for Cloud Functions

import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { logger } from '../utils/logger';

/**
 * Verify that the request is from an authenticated user.
 * Throws HttpsError('unauthenticated') if no valid auth token.
 */
export function requireAuth(request: CallableRequest): string {
  if (!request.auth) {
    logger.warn('Unauthenticated request blocked', { action: 'requireAuth' });
    throw new HttpsError('unauthenticated', 'You must be logged in to perform this action.');
  }
  return request.auth.uid;
}

/**
 * Verify that the request is from an authenticated admin user.
 * Checks custom claims for { role: 'admin' }.
 * Throws HttpsError('permission-denied') if not an admin.
 */
export function requireAdmin(request: CallableRequest): string {
  const uid = requireAuth(request);
  const claims = request.auth?.token;

  if (!claims || claims.role !== 'admin') {
    logger.warn('Non-admin request blocked', {
      action: 'requireAdmin',
      userId: uid,
    });
    throw new HttpsError(
      'permission-denied',
      'You do not have permission to perform this action. Admin access required.',
    );
  }

  return uid;
}
