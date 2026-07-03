// packages/shared/src/types/storeSettings.ts
// Store configuration managed by admin and consumed by the mobile app

export interface StoreSettingsDeliverySlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface StoreSettings {
  // General store info
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;

  // Delivery configuration
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  deliverySlots: StoreSettingsDeliverySlot[];

  // Banner configuration (home screen)
  bannerTitle: string;
  bannerSubtitle: string;
  bannerOffer: string;

  // Timestamps
  updatedAt?: Date;
}
