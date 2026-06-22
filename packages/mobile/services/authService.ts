// packages/mobile/services/authService.ts
// Authentication service — Phone OTP + Google Sign-In

import {
  signInWithPhoneNumber,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from './firebase';
import { logger } from '../utils/logger';

let confirmationResult: ConfirmationResult | null = null;

/**
 * Send OTP to a phone number.
 * @param phoneNumber - Full phone number with country code (e.g., +919876543210)
 * @param recaptchaVerifier - reCAPTCHA verifier instance
 */
export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: unknown,
): Promise<void> {
  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier as Parameters<typeof signInWithPhoneNumber>[2],
    );
    logger.debug('OTP sent successfully', { phoneNumber });
  } catch (error) {
    logger.error('Failed to send OTP', error);
    throw error;
  }
}

/**
 * Verify OTP and sign in.
 * @param otp - 6-digit OTP code
 */
export async function verifyOTP(otp: string): Promise<User> {
  if (!confirmationResult) {
    throw new Error('No OTP request found. Please request a new OTP.');
  }

  try {
    const result = await confirmationResult.confirm(otp);
    confirmationResult = null;
    logger.debug('OTP verified successfully');
    return result.user;
  } catch (error) {
    logger.error('OTP verification failed', error);
    throw error;
  }
}

/**
 * Sign in with Google.
 * @param idToken - Google ID token from Google Sign-In
 */
export async function signInWithGoogle(idToken: string): Promise<User> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    logger.debug('Google sign-in successful');
    return result.user;
  } catch (error) {
    logger.error('Google sign-in failed', error);
    throw error;
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    logger.debug('User signed out');
  } catch (error) {
    logger.error('Sign out failed', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user's ID token.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}
