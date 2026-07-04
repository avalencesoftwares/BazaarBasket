// src/components/common/DeliverySlotBanner.tsx
// Green gradient banner showing next delivery slot

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export function DeliverySlotBanner() {
  return (
    <View className="mx-4">
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 12 }}
      >
        <View className="flex-row items-center gap-3 p-3.5">
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="time-outline" size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white/80 text-[10px] font-medium uppercase tracking-widest">
              Next Delivery
            </Text>
            <Text className="text-white text-sm font-bold">
              Today, 6:00 PM – 8:00 PM
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </View>
  );
}
