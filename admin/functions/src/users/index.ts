// packages/functions/src/users/index.ts
// User management Cloud Functions

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import {
  COLLECTIONS,
  updateUserProfileSchema,
  sanitizeObject,
  UserRole,
} from '@bazaarbasket/shared';
import type { User } from '@bazaarbasket/shared';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimiter';
import { validateInput } from '../middleware/validator';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

/**
 * Set admin role via custom claims.
 * Only callable by existing admins (bootstrapped via Firebase Console).
 */
export const setAdminRole = onCall(
  { region: REGION, maxInstances: 5 },
  async (request) => {
    const callerUid = requireAdmin(request);
    await checkRateLimit(callerUid);

    const { uid } = request.data as { uid: string };
    if (!uid || typeof uid !== 'string') {
      throw new HttpsError('invalid-argument', 'User UID is required');
    }

    const auth = getAuth();

    // Verify target user exists
    try {
      await auth.getUser(uid);
    } catch {
      throw new HttpsError('not-found', 'User not found');
    }

    // Set custom claims
    await auth.setCustomUserClaims(uid, { role: UserRole.ADMIN });

    // Update Firestore user doc
    const db = getFirestore();
    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      role: UserRole.ADMIN,
      updatedAt: new Date(),
    });

    logger.info('Admin role set', {
      userId: callerUid,
      action: 'setAdminRole',
      targetUid: uid,
    });
  },
);

/**
 * Get the current user's profile.
 */
export const getUserProfile = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);

    const db = getFirestore();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (!userSnap.exists) {
      // Create a new user document from auth data
      const auth = getAuth();
      const authUser = await auth.getUser(userId);
      const now = new Date();

      const newUser: User = {
        uid: userId,
        displayName: authUser.displayName || '',
        email: authUser.email || '',
        phone: authUser.phoneNumber || '',
        photoUrl: authUser.photoURL || '',
        role: UserRole.CUSTOMER,
        addresses: [],
        fcmTokens: [],
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection(COLLECTIONS.USERS).doc(userId).set(newUser);

      logger.info('New user profile created', {
        userId,
        action: 'getUserProfile',
      });

      return newUser;
    }

    // Update last login
    await userSnap.ref.update({ lastLoginAt: new Date() });

    return { uid: userSnap.id, ...userSnap.data() } as User;
  },
);

/**
 * Update the current user's profile.
 */
export const updateUserProfile = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);
    await checkRateLimit(userId);

    const input = validateInput(updateUserProfileSchema, request.data);
    const db = getFirestore();

    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const sanitized = sanitizeObject(input as Record<string, unknown>);
    const updateData: Record<string, unknown> = {
      ...sanitized,
      updatedAt: new Date(),
    };

    // Remove undefined fields
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    await userRef.update(updateData);

    logger.info('User profile updated', {
      userId,
      action: 'updateUserProfile',
    });
  },
);

/**
 * Register an FCM token for push notifications.
 */
export const registerFCMToken = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const userId = requireAuth(request);

    const { token } = request.data as { token: string };
    if (!token || typeof token !== 'string') {
      throw new HttpsError('invalid-argument', 'FCM token is required');
    }

    const db = getFirestore();
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const user = userSnap.data() as User;

    // Avoid duplicate tokens
    if (!user.fcmTokens.includes(token)) {
      await userRef.update({
        fcmTokens: [...user.fcmTokens, token],
        updatedAt: new Date(),
      });
    }

    logger.info('FCM token registered', {
      userId,
      action: 'registerFCMToken',
    });
  },
);
