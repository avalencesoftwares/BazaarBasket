// src/components/screens/HomeScreen.tsx
// Home screen with categories, deals, search bar, slot banner

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { CategoryCarousel } from '../common/CategoryCarousel';
import { DeliverySlotBanner } from '../common/DeliverySlotBanner';
import { ProductCard } from '../common/ProductCard';
import { ShimmerCard } from '../common/ShimmerCard';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const totalItems = 0; // Replace with useCartStore((s) => s.totalItems) when wired

  const dealProducts = PRODUCTS.filter((p) => p.originalPrice && p.inStock).slice(0, 8);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 800);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 h-14">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">🛒</Text>
            <View>
              <Text className="text-base font-bold text-gray-900 leading-tight">
                BazaarBasket
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location" size={10} color="#22c55e" />
                <Text className="text-[11px] text-gray-500">Koramangala, 560034</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            className="w-10 h-10 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={22} color="#374151" />
            {totalItems > 0 && (
              <View className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-[#22c55e] rounded-full items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
            colors={['#22c55e']}
          />
        }
      >
        {/* Search Bar */}
        <View className="px-4 py-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            className="w-full flex-row items-center gap-3 h-11 px-4 bg-gray-100 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">Search for atta, milk, fruits...</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Slot Banner */}
        <View className="mb-4">
          <DeliverySlotBanner />
        </View>

        {/* Category Carousel */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-base font-bold text-gray-900">Shop by Category</Text>
          </View>
          <CategoryCarousel />
        </View>

        {/* Deals & Offers */}
        <View className="px-4 mb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="sparkles" size={16} color="#22c55e" />
            <Text className="text-base font-bold text-gray-900">Deals & Offers</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          >
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <View key={i} style={{ width: 160 }}>
                    <ShimmerCard />
                  </View>
                ))
              : dealProducts.map((product) => (
                  <View key={product.id} style={{ width: 160 }}>
                    <ProductCard product={product} />
                  </View>
                ))}
          </ScrollView>
        </View>

        {/* Browse All - Category Grid */}
        <View className="px-4 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">Browse All</Text>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => router.push(`/(tabs)/search?categoryId=${cat.id}`)}
                className="relative rounded-2xl overflow-hidden"
                style={{ width: '48%', height: 112, elevation: 1 }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: cat.image }}
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="disk"
                />
                {/* Gradient overlay */}
                <View
                  className="absolute inset-0"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                  }}
                />
                <View className="absolute bottom-0 left-0 right-0 p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-white leading-tight">
                      {cat.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.6)" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buy Again Placeholder */}
        <View className="px-4 mb-8">
          <View className="bg-gray-100 rounded-2xl p-6 items-center border-2 border-dashed border-gray-200">
            <Text className="text-2xl mb-2">🔄</Text>
            <Text className="text-sm font-semibold text-gray-500">Buy Again</Text>
            <Text className="text-xs text-gray-400 mt-1">Coming Soon</Text>
          </View>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
