// packages/mobile/app/(tabs)/cart.tsx
// Legacy route redirecting to stack-level cart screen

import { Redirect } from 'expo-router';

export default function CartRedirect() {
  return <Redirect href="/cart" />;
}
