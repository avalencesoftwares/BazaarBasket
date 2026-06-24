// packages/mobile/app/(tabs)/_layout.tsx
// Bottom tab navigator layout — Pill-shaped floating green bar matching screenshot

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCartStore } from '../../store/cartStore';

const COLORS = {
  primaryGreen: '#4CAF50',
  tabBarBg: '#58B25C', // Vibrant green matching screenshot bottom bar
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  red: '#EF4444',
};

// Cart badge overlay to fit the custom circular tab icon design
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

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  hasDot?: boolean;
  showBadge?: boolean;
}

// Custom tab icon that renders as a circle
function TabIcon({ name, focused, hasDot, showBadge }: TabIconProps) {
  return (
    <View style={focused ? styles.activeContainer : styles.inactiveContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? COLORS.textPrimary : COLORS.white}
      />
      {hasDot && <View style={styles.orangeDot} />}
      {showBadge && <CartBadge />}
    </View>
  );
}

// Custom tab bar component to completely bypass React Navigation's layout bugs
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine icon name
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'index') iconName = 'home-outline';
        else if (route.name === 'search') iconName = 'heart-outline';
        else if (route.name === 'cart') iconName = 'cart-outline';
        else if (route.name === 'profile') iconName = 'person-outline';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <TabIcon
              name={iconName}
              focused={isFocused}
              hasDot={route.name === 'index' && isFocused}
              showBadge={route.name === 'cart'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarAccessibilityLabel: 'Search tab',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarAccessibilityLabel: 'Cart tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 16,
    left: '15%',
    right: '15%',
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.tabBarBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.18)', // subtle circle background for inactive tabs
    justifyContent: 'center',
    alignItems: 'center',
  },
  orangeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFA726', // Orange dot matching screenshot
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.red,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.tabBarBg, // matches green tab bar bg
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
