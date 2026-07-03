// packages/mobile/services/userService.ts
// User profile service using Cloud Functions

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { User, UpdateUserProfileInput } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const getUserProfileFn = httpsCallable<Record<string, never>, User>(functions, 'getUserProfile');
const updateUserProfileFn = httpsCallable<UpdateUserProfileInput, void>(functions, 'updateUserProfile');
const registerFCMTokenFn = httpsCallable<{ token: string }, void>(functions, 'registerFCMToken');

export async function getUserProfile(): Promise<User> {
  const result = await getUserProfileFn({});
  logger.debug('User profile fetched');
  return result.data;
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<void> {
  await updateUserProfileFn(input);
  logger.debug('User profile updated');
}

export async function registerFCMToken(token: string): Promise<void> {
  await registerFCMTokenFn({ token });
  logger.debug('FCM token registered');
}
