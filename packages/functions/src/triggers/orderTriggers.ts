// packages/functions/src/triggers/orderTriggers.ts
// Firestore triggers for order status changes → FCM push notifications

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { COLLECTIONS, ORDER_STATUS_LABELS } from '@bazaarbasket/shared';
import type { Order, User } from '@bazaarbasket/shared';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

/**
 * Trigger: When an order's status changes, send a push notification to the customer.
 */
export const onOrderStatusChange = onDocumentUpdated(
  {
    document: `${COLLECTIONS.ORDERS}/{orderId}`,
    region: REGION,
  },
  async (event) => {
    if (!event.data) {
      return;
    }

    const beforeData = event.data.before.data() as Order;
    const afterData = event.data.after.data() as Order;

    // Only trigger if status actually changed
    if (beforeData.status === afterData.status) {
      return;
    }

    const orderId = event.params.orderId;
    const statusLabel = ORDER_STATUS_LABELS[afterData.status] || afterData.status;

    logger.info('Order status changed', {
      action: 'onOrderStatusChange',
      orderId,
      oldStatus: beforeData.status,
      newStatus: afterData.status,
      userId: afterData.userId,
    });

    // Get customer's FCM tokens
    const db = getFirestore();
    const userSnap = await db
      .collection(COLLECTIONS.USERS)
      .doc(afterData.userId)
      .get();

    if (!userSnap.exists) {
      logger.warn('User not found for order notification', {
        action: 'onOrderStatusChange',
        userId: afterData.userId,
        orderId,
      });
      return;
    }

    const user = userSnap.data() as User;

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      logger.info('No FCM tokens found for user', {
        action: 'onOrderStatusChange',
        userId: afterData.userId,
      });
      return;
    }

    // Build notification
    const notification = {
      title: `Order ${afterData.orderNumber} - ${statusLabel}`,
      body: getStatusMessage(afterData),
    };

    const messaging = getMessaging();

    // Send to all user tokens
    const invalidTokens: string[] = [];
    for (const token of user.fcmTokens) {
      try {
        await messaging.send({
          token,
          notification,
          data: {
            type: 'order_status_update',
            orderId,
            status: afterData.status,
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'order_updates',
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
      } catch (error: unknown) {
        const errorCode = (error as { code?: string }).code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(token);
        }
        logger.error('Failed to send FCM notification', error, {
          action: 'onOrderStatusChange',
          userId: afterData.userId,
          token,
        });
      }
    }

    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      const validTokens = user.fcmTokens.filter((t) => !invalidTokens.includes(t));
      await db
        .collection(COLLECTIONS.USERS)
        .doc(afterData.userId)
        .update({ fcmTokens: validTokens });

      logger.info('Invalid FCM tokens cleaned', {
        action: 'onOrderStatusChange',
        userId: afterData.userId,
        removedCount: String(invalidTokens.length),
      });
    }
  },
);

function getStatusMessage(order: Order): string {
  switch (order.status) {
    case 'confirmed':
      return `Your order has been confirmed! We're preparing it now.`;
    case 'packed':
      return `Your order is packed and ready for delivery.`;
    case 'out_for_delivery':
      return `Your order is out for delivery! Expected during ${order.deliverySlot.label}.`;
    case 'delivered':
      return `Your order has been delivered! Thank you for shopping with BazaarBasket.`;
    case 'cancelled':
      return `Your order has been cancelled. ${order.cancelReason ? `Reason: ${order.cancelReason}` : ''}`.trim();
    default:
      return `Your order status has been updated to ${ORDER_STATUS_LABELS[order.status] || order.status}.`;
  }
}
