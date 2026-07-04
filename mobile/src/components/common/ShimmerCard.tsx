// src/components/common/ShimmerCard.tsx
// Skeleton loading placeholder card using animated opacity

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function ShimmerCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <Animated.View
        style={{ opacity }}
        className="w-full h-32 bg-gray-200"
      />
      <View className="p-3">
        <Animated.View
          style={{ opacity }}
          className="h-3 bg-gray-200 rounded-full w-3/4 mb-2"
        />
        <Animated.View
          style={{ opacity }}
          className="h-3 bg-gray-200 rounded-full w-1/2 mb-2"
        />
        <Animated.View
          style={{ opacity }}
          className="h-3 bg-gray-200 rounded-full w-1/3"
        />
      </View>
    </View>
  );
}
