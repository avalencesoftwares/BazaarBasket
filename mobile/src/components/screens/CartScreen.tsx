// src/components/screens/CartScreen.tsx
// Cart screen with items, promo code, bill summary, checkout button

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../data/mockData';
import { CartItemRow } from '../common/CartItemRow';
import { EmptyState } from '../common/EmptyState';

// Mock cart state for demonstration
interface CartEntry {
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

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Mock cart items for UI demonstration
  const [items, setItems] = useState<CartEntry[]>(() => {
    const mockProducts = PRODUCTS.filter((p) => p.inStock).slice(0, 3);
    return mockProducts.map((p, i) => ({
      product: {
        id: p.id,
        name: p.name,
        brand: p.brand,
        weight: p.weight,
        price: p.price,
        image: p.image,
      },
      quantity: i + 1,
    }));
  });

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = totalAmount >= 299 ? 0 : 25;
  const grandTotal = totalAmount + deliveryCharge;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleRemove = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <View
          className="bg-white border-b border-gray-100"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center h-14 px-4">
            <Text className="text-base font-bold text-gray-900">My Cart</Text>
          </View>
        </View>
        <EmptyState
          icon="bag-outline"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start exploring products!"
          actionLabel="Browse Products"
          onAction={() => router.push('/(tabs)')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center h-14 px-4">
          <Text className="text-base font-bold text-gray-900">
            My Cart ({totalItems} item{totalItems > 1 ? 's' : ''})
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Cart Items */}
        <View className="px-4 py-3 gap-2">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
            />
          ))}
        </View>

        {/* Promo Code */}
        <View className="mx-4 mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <TouchableOpacity
            onPress={() => setPromoOpen(!promoOpen)}
            className="flex-row items-center justify-between px-4 py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="pricetag-outline" size={16} color="#22c55e" />
              <Text className="text-sm font-medium text-gray-700">Apply Promo Code</Text>
            </View>
            <Ionicons
              name={promoOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          {promoOpen && (
            <View className="px-4 pb-3 flex-row gap-2">
              <TextInput
                value={promoCode}
                onChangeText={(t) => setPromoCode(t.toUpperCase())}
                placeholder="Enter code"
                placeholderTextColor="#9CA3AF"
                className="flex-1 h-10 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              />
              <TouchableOpacity
                className="h-10 px-4 rounded-lg border-2 border-[#22c55e] items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-[#22c55e] text-sm font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 p-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">Bill Summary</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm text-gray-800 font-medium">₹{totalAmount}</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="car-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500">Delivery</Text>
              </View>
              <Text
                className={`text-sm ${
                  deliveryCharge === 0
                    ? 'text-[#22c55e] font-semibold'
                    : 'text-gray-800 font-medium'
                }`}
              >
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </Text>
            </View>
            {deliveryCharge > 0 && (
              <Text className="text-[11px] text-gray-400">
                Add ₹{299 - totalAmount} more for free delivery
              </Text>
            )}
            <View className="border-t border-gray-100 pt-2 mt-2 flex-row justify-between">
              <Text className="text-base font-bold text-gray-900">Total</Text>
              <Text className="text-base font-bold text-gray-900">₹{grandTotal}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom */}
      <View
        className="absolute left-0 right-0 bg-white border-t border-gray-100 px-4"
        style={{ bottom: 80, paddingTop: 12, paddingBottom: 12 }}
      >
        <TouchableOpacity
          onPress={() => router.push('/checkout/address')}
          className="w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center"
          activeOpacity={0.8}
          style={{ elevation: 4 }}
        >
          <Text className="text-white text-base font-semibold">
            Proceed to Checkout — ₹{grandTotal}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
