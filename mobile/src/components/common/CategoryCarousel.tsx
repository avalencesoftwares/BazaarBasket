// src/components/common/CategoryCarousel.tsx
// Horizontal scrolling category carousel with emoji circles

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIES } from '../../data/mockData';

export function CategoryCarousel() {
  return (
    <View className="px-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingRight: 16 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => router.push(`/(tabs)/search?categoryId=${cat.id}`)}
            className="items-center gap-2"
            style={{ minWidth: 68 }}
            activeOpacity={0.7}
          >
            <View
              className={`w-16 h-16 rounded-2xl ${cat.color} items-center justify-center`}
              style={{ elevation: 1 }}
            >
              <Text className="text-2xl">{cat.emoji}</Text>
            </View>
            <Text
              className="text-[11px] font-medium text-gray-600 text-center leading-tight w-16"
              numberOfLines={2}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
