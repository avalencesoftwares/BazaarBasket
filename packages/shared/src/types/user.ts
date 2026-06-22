// packages/shared/src/types/user.ts
// User-related type definitions for Firestore documents

import { UserRole } from '../enums';

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoUrl: string;
  role: UserRole;
  addresses: Address[];
  fcmTokens: string[];
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  maxOrders: number;
  currentOrders: number;
  isAvailable: boolean;
}
