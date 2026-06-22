// packages/functions/src/triggers/stockTriggers.ts
// Firestore triggers for low stock alerts → FCM push to admin

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { COLLECTIONS, LOW_STOCK_THRESHOLD, UserRole } from '@bazaarbasket/shared';
import type { Product, User } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

/**
 * Trigger: When a product's stock drops below LOW_STOCK_THRESHOLD,
 * send a push notification to all admin users.
 */
export const onLowStock = onDocumentUpdated(
  {
    document: `${COLLECTIONS.PRODUCTS}/{productId}`,
    region: REGION,
  },
  async (event) => {
    if (!event.data) {
      return;
    }

    const beforeData = event.data.before.data() as Product;
    const afterData = event.data.after.data() as Product;
    const productId = event.params.productId;

    // Only trigger if stock crossed the threshold downward
    if (
      beforeData.stock >= LOW_STOCK_THRESHOLD &&
      afterData.stock < LOW_STOCK_THRESHOLD &&
      afterData.stock >= 0
    ) {
      logger.info('Low stock alert triggered', {
        action: 'onLowStock',
        productId,
        productName: afterData.name,
        stock: String(afterData.stock),
        threshold: String(LOW_STOCK_THRESHOLD),
      });

      // Get all admin users' FCM tokens
      const db = getFirestore();
      const adminSnap = await db
        .collection(COLLECTIONS.USERS)
        .where('role', '==', UserRole.ADMIN)
        .get();

      if (adminSnap.empty) {
        logger.warn('No admin users found for low stock alert', {
          action: 'onLowStock',
        });
        return;
      }

      const messaging = getMessaging();
      const notification = {
        title: '⚠️ Low Stock Alert',
        body: `"${afterData.name}" has only ${afterData.stock} units left (threshold: ${LOW_STOCK_THRESHOLD}).`,
      };

      for (const adminDoc of adminSnap.docs) {
        const admin = adminDoc.data() as User;

        if (!admin.fcmTokens || admin.fcmTokens.length === 0) {
          continue;
        }

        for (const token of admin.fcmTokens) {
          try {
            await messaging.send({
              token,
              notification,
              data: {
                type: 'low_stock_alert',
                productId,
                productName: afterData.name,
                stock: String(afterData.stock),
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'admin_alerts',
                  sound: 'default',
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default',
                    badge: 1,
                  },
                },
              },
            });
          } catch (error) {
            logger.error('Failed to send low stock FCM', error, {
              action: 'onLowStock',
              adminUid: adminDoc.id,
            });
          }
        }
      }
    }
  },
);
