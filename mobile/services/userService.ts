// packages/mobile/services/userService.ts
// User profile service using client-side Firestore SDK to support free-tier Spark plan

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserRole } from '@bazaarbasket/shared';
import type { User, UpdateUserProfileInput, Address } from '@bazaarbasket/shared';
import { COLLECTIONS } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';
import { getActiveUid, getTempPhone } from './authHelper';

export async function getUserProfile(): Promise<User> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Automatically create a new user profile document in Firestore (matches backend getUserProfile)
    const now = new Date();
    const phone = getTempPhone() || '';
    const currentUser = auth.currentUser;

    const newUser: User = {
      uid: userId,
      displayName: currentUser?.displayName || 'User',
      email: currentUser?.email || '',
      phone: phone || currentUser?.phoneNumber || '',
      photoUrl: currentUser?.photoURL || '',
      role: UserRole.CUSTOMER,
      addresses: [],
      fcmTokens: [],
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newUser);
    logger.info('New user profile created (client-side)', { userId });
    return newUser;
  }

  // Update last login timestamp
  const data = userSnap.data();
  await updateDoc(userRef, {
    lastLoginAt: new Date(),
  });

  return {
    uid: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
  } as User;
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<void> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...input,
    updatedAt: new Date(),
  });
  logger.debug('User profile updated (client-side)');
}

export async function registerFCMToken(token: string): Promise<void> {
  const userId = getActiveUid(auth);
  if (!userId) return;

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data() as User & { fcmTokens?: string[] };
  const currentTokens = userData.fcmTokens || [];

  if (!currentTokens.includes(token)) {
    await updateDoc(userRef, {
      fcmTokens: [...currentTokens, token],
      updatedAt: new Date(),
    });
    logger.debug('FCM token registered (client-side)');
  }
}

export async function saveAddress(addressInput: Omit<Address, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>): Promise<Address[]> {
  const userId = getActiveUid(auth);
  if (!userId) throw new Error('User not authenticated');

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User profile not found');
  }

  const userData = userSnap.data() as User;
  const currentAddresses = userData.addresses || [];

  const newAddress: Address = {
    ...addressInput,
    id: Math.random().toString(36).substring(2, 9), // Simple unique ID
    isDefault: currentAddresses.length === 0, // Make default if it is the first address
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // If new address is set to default, unset other defaults
  const updatedAddresses = currentAddresses.map((addr) => {
    if (newAddress.isDefault && addr.isDefault) {
      return { ...addr, isDefault: false, updatedAt: new Date() };
    }
    return addr;
  });

  updatedAddresses.push(newAddress);

  await updateDoc(userRef, {
    addresses: updatedAddresses,
    updatedAt: new Date(),
  });

  logger.debug('Address saved (client-side)');
  return updatedAddresses;
}
