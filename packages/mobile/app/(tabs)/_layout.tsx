// packages/mobile/app/(tabs)/_layout.tsx
// Bottom tab navigator layout — Premium Light Theme

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';

function CartBadge() {
  const totalItems = useCartStore((s) => s.totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00B7B5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 10),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
            </View>
          ),
          tabBarAccessibilityLabel: 'Search tab',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
              <CartBadge />
            </View>
          ),
          tabBarAccessibilityLabel: 'Cart tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </View>
          ),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: '#EBF9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
