// src/components/common/ProductCard.tsx
// Product display card with add/qty controls

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { MockProduct } from '../../data/mockData';

interface ProductCardProps {
  product: MockProduct;
  // Optional: use store-based cart. For mock UI, uses local state.
  onAddToCart?: (product: MockProduct) => void;
  onUpdateQty?: (productId: string, qty: number) => void;
  initialQty?: number;
}

export function ProductCard({ product, onAddToCart, onUpdateQty, initialQty = 0 }: ProductCardProps) {
  const [qty, setQty] = useState(initialQty);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAdd = () => {
    const newQty = qty + 1;
    setQty(newQty);
    onAddToCart?.(product);
  };

  const handleIncrement = () => {
    if (qty >= 10) return;
    const newQty = qty + 1;
    setQty(newQty);
    onUpdateQty?.(product.id, newQty);
  };

  const handleDecrement = () => {
    const newQty = qty - 1;
    setQty(newQty);
    onUpdateQty?.(product.id, newQty);
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${product.id}`)}
      className="bg-white rounded-xl overflow-hidden border border-gray-100"
      activeOpacity={0.8}
      style={{ elevation: 1 }}
    >
      {/* Image */}
      <View className="relative w-full h-32 bg-gray-50">
        <Image
          source={{ uri: product.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="disk"
        />
        {hasDiscount && (
          <View className="absolute top-2 left-2 bg-[#22c55e] px-2 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-bold">{discountPct}% OFF</Text>
          </View>
        )}
        {!product.inStock && (
          <View className="absolute inset-0 bg-white/60 items-center justify-center">
            <Text className="text-xs font-semibold text-gray-600 bg-gray-800/80 text-white px-3 py-1 rounded-full">
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-2.5">
        <Text className="text-[10px] text-gray-400 font-medium" numberOfLines={1}>
          {product.brand}
        </Text>
        <Text className="text-xs font-semibold text-gray-800 mb-0.5" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-[10px] text-gray-400 mb-1.5">{product.weight}</Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-sm font-bold text-gray-900">₹{product.price}</Text>
            {hasDiscount && (
              <Text className="text-[10px] text-gray-400 line-through">
                ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {product.inStock && (
            <>
              {qty === 0 ? (
                <TouchableOpacity
                  onPress={handleAdd}
                  className="bg-[#22c55e] px-2.5 py-1 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-[10px] font-bold">ADD</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center bg-[#22c55e] rounded-lg overflow-hidden">
                  <TouchableOpacity
                    onPress={handleDecrement}
                    className="px-2 py-1"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color="white" />
                  </TouchableOpacity>
                  <Text className="text-white text-xs font-bold px-1 min-w-[16px] text-center">
                    {qty}
                  </Text>
                  <TouchableOpacity
                    onPress={handleIncrement}
                    className="px-2 py-1"
                    activeOpacity={0.7}
                    disabled={qty >= 10}
                  >
                    <Ionicons name="add" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
