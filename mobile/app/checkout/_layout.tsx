import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#000000',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Back',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="address" options={{ title: 'Select Address' }} />
      <Stack.Screen name="slot" options={{ title: 'Select Slot' }} />
      <Stack.Screen name="confirm" options={{ title: 'Confirm Order' }} />
    </Stack>
  );
}
