// packages/mobile/services/settingsService.ts
// Settings data service for fetching dynamic store configuration from Firestore

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@bazaarbasket/shared';
import type { StoreSettings } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const STORE_CONFIG_DOC = 'storeConfig';

/**
 * Fetches store settings (delivery fees, home banner, phone, address, etc.)
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, STORE_CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StoreSettings;
    }
    return null;
  } catch (error) {
    logger.error('Error fetching store settings:', error);
    return null;
  }
}
