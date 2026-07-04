// src/components/common/EmptyState.tsx
// Generic empty state with icon + title + description + optional CTA

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'alert-circle-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={36} color="#9CA3AF" />
      </View>
      <Text className="text-base font-bold text-gray-800 mb-1 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-400 text-center mb-6 max-w-[260px]">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-[#22c55e] px-6 py-3 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
