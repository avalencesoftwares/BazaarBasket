// packages/mobile/services/authHelper.ts
// Helper to share active user ID and temporarily cached details across services

let tempPhone: string | null = null;

export function getActiveUid(auth: any): string | null {
  return auth.currentUser?.uid;
}

export function getTempPhone(): string | null {
  return tempPhone;
}

export function setTempPhone(phone: string | null) {
  tempPhone = phone;
}
