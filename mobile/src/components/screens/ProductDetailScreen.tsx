// src/components/screens/ProductDetailScreen.tsx
// Product detail with hero image, qty controls, related products

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';
import { EmptyState } from '../common/EmptyState';

interface ProductDetailScreenProps {
  productId: string;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(0);

  const product = PRODUCTS.find((p) => p.id === productId);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) => p.categoryId === product.categoryId && p.id !== product.id && p.inStock
    ).slice(0, 6);
  }, [product]);

  if (!product) {
    return (
      <View className="flex-1 bg-gray-50">
        <EmptyState
          title="Product not found"
          description="This product doesn't exist."
          actionLabel="Go Home"
          onAction={() => router.push('/(tabs)')}
        />
      </View>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative w-full" style={{ aspectRatio: 1, backgroundColor: '#F9FAFB' }}>
          <Image
            source={{ uri: product.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="disk"
          />
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute bg-white/90 rounded-full items-center justify-center"
            style={{
              top: insets.top + 8,
              left: 16,
              width: 40,
              height: 40,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>

          {/* Discount Badge */}
          {hasDiscount && (
            <View
              className="absolute bg-[#22c55e] px-3 py-1.5 rounded-full"
              style={{ top: insets.top + 8, right: 16, elevation: 2 }}
            >
              <Text className="text-white text-xs font-bold">{discountPct}% OFF</Text>
            </View>
          )}

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <View className="absolute inset-0 bg-white/60 items-center justify-center">
              <Text className="bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
                Currently Unavailable
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-5 pt-5">
          <Text className="text-xs text-gray-400 font-medium mb-1">{product.brand}</Text>
          <Text className="text-xl font-bold text-gray-900 mb-1">{product.name}</Text>
          <Text className="text-sm text-gray-400 mb-3">{product.weight}</Text>

          <View className="flex-row items-baseline gap-2 mb-4">
            <Text className="text-2xl font-bold text-gray-900">₹{product.price}</Text>
            {hasDiscount && (
              <Text className="text-base text-gray-400 line-through">
                ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-1.5">Description</Text>
            <Text className="text-sm text-gray-500 leading-relaxed">{product.description}</Text>
          </View>

          {/* Quantity Selector */}
          {product.inStock && qty > 0 && (
            <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3 mb-5">
              <Text className="text-sm font-medium text-gray-600">Quantity</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setQty(qty - 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 min-w-[24px] text-center">
                  {qty}
                </Text>
                <TouchableOpacity
                  onPress={() => setQty(Math.min(qty + 1, 10))}
                  disabled={qty >= 10}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 items-center justify-center"
                  activeOpacity={0.7}
                  style={qty >= 10 ? { opacity: 0.3 } : undefined}
                >
                  <Ionicons name="add" size={16} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View className="px-5 mt-2">
            <Text className="text-base font-bold text-gray-900 mb-3">Related Products</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
            >
              {relatedProducts.map((p) => (
                <View key={p.id} style={{ width: 160 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom spacer for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      {product.inStock && (
        <View
          className="absolute left-0 right-0 bg-white border-t border-gray-100 px-4"
          style={{ bottom: 0, paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          {qty === 0 ? (
            <TouchableOpacity
              onPress={() => setQty(1)}
              className="w-full h-12 bg-[#22c55e] rounded-xl flex-row items-center justify-center gap-2"
              activeOpacity={0.8}
              style={{ elevation: 4 }}
            >
              <Ionicons name="cart-outline" size={18} color="white" />
              <Text className="text-white text-base font-semibold">
                Add to Cart — ₹{product.price}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/cart')}
              className="w-full h-12 bg-[#16a34a] rounded-xl flex-row items-center justify-center gap-2"
              activeOpacity={0.8}
              style={{ elevation: 4 }}
            >
              <Ionicons name="cart" size={18} color="white" />
              <Text className="text-white text-base font-semibold">
                Go to Cart — {qty} item{qty > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
