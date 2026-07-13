// packages/mobile/app/_layout.tsx
// Root layout with auth guard and providers

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';

// Prevent splash screen auto hide to allow fonts to load
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  const [loaded, error] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'PlayfairDisplay-Black': PlayfairDisplay_900Black,
  });

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="cart"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="checkout"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="order/[id]"
            options={{
              headerShown: true,
              title: 'Order Details',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="order/history"
            options={{
              headerShown: true,
              title: 'Order History',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#000000',
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
