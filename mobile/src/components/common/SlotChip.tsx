// src/components/common/SlotChip.tsx
// Delivery time slot card — availability + checkmark when selected

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DeliverySlot } from '../../data/mockData';

interface SlotChipProps {
  slot: DeliverySlot;
  selected: boolean;
  onPress: () => void;
}

export function SlotChip({ slot, selected, onPress }: SlotChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!slot.available}
      className={`relative p-3.5 rounded-xl border-2 ${
        selected
          ? 'border-[#22c55e] bg-green-50'
          : slot.available
            ? 'border-gray-200 bg-white'
            : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
      activeOpacity={0.7}
    >
      {selected && (
        <View className="absolute top-2 right-2 w-5 h-5 bg-[#22c55e] rounded-full items-center justify-center">
          <Ionicons name="checkmark" size={12} color="white" />
        </View>
      )}
      <View className="flex-row items-center gap-2 mb-1">
        <View
          className={`w-2 h-2 rounded-full ${slot.available ? 'bg-[#22c55e]' : 'bg-red-400'}`}
        />
        <Text className="text-sm font-semibold text-gray-800">{slot.timeWindow}</Text>
      </View>
      <Text
        className={`text-xs ${slot.available ? 'text-gray-500' : 'text-red-500 font-medium'}`}
      >
        {slot.available ? `${slot.slotsLeft} slots left` : 'Full'}
      </Text>
    </TouchableOpacity>
  );
}
