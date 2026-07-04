// src/components/common/CartItemRow.tsx
// Cart item row with product image, qty controls, and swipe-to-delete

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface CartItemData {
  product: {
    id: string;
    name: string;
    brand: string;
    weight: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface CartItemRowProps {
  item: CartItemData;
  onUpdateQty?: (productId: string, qty: number) => void;
  onRemove?: (productId: string) => void;
}

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const { product, quantity } = item;

  return (
    <View className="flex-row items-center bg-white rounded-xl border border-gray-100 p-3 gap-3">
      {/* Product Image */}
      <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
        <Image
          source={{ uri: product.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="disk"
        />
      </View>

      {/* Product Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-xs text-gray-400">{product.weight}</Text>
        <Text className="text-sm font-bold text-gray-900 mt-1">
          ₹{product.price * quantity}
        </Text>
      </View>

      {/* Qty Controls */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => {
            if (quantity <= 1) {
              onRemove?.(product.id);
            } else {
              onUpdateQty?.(product.id, quantity - 1);
            }
          }}
          className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons
            name={quantity <= 1 ? 'trash-outline' : 'remove'}
            size={16}
            color={quantity <= 1 ? '#EF4444' : '#4B5563'}
          />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 min-w-[20px] text-center">
          {quantity}
        </Text>
        <TouchableOpacity
          onPress={() => onUpdateQty?.(product.id, quantity + 1)}
          disabled={quantity >= 10}
          className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
          style={quantity >= 10 ? { opacity: 0.3 } : undefined}
        >
          <Ionicons name="add" size={16} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
