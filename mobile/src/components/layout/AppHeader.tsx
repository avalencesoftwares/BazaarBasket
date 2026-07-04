// src/components/layout/AppHeader.tsx
// Reusable screen header with back button, title, optional right action

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: 'search' | 'cart';
  onBack?: () => void;
}

export function AppHeader({ title, showBack = true, rightAction, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      className="bg-white border-b border-gray-100"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center h-14 px-4">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center rounded-full mr-1"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>
        )}
        <Text className="flex-1 text-base font-bold text-gray-900 text-center pr-10">
          {title}
        </Text>
        {rightAction === 'search' && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            className="w-10 h-10 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#374151" />
          </TouchableOpacity>
        )}
        {rightAction === 'cart' && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            className="w-10 h-10 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={22} color="#374151" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
