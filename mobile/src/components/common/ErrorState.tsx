// src/components/common/ErrorState.tsx
// Error message display with retry button

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again later.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
        <Ionicons name="warning-outline" size={36} color="#EF4444" />
      </View>
      <Text className="text-base font-bold text-gray-800 mb-1 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-400 text-center mb-6 max-w-[260px]">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-[#22c55e] px-6 py-3 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-semibold">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
