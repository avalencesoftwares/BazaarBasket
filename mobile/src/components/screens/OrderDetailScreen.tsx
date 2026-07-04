// src/components/screens/OrderDetailScreen.tsx
// Order detail with 4-step tracker, delivery partner, cancel dialog

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MOCK_ORDERS, type OrderStatus } from '../../data/mockData';
import { AppHeader } from '../layout/AppHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STEPS.findIndex((s) => s.key === status);
}

interface OrderDetailScreenProps {
  orderId: string;
}

export function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const [cancelled, setCancelled] = useState(false);
  const order = MOCK_ORDERS.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50">
        <AppHeader title="Order Details" />
        <EmptyState
          title="Order not found"
          actionLabel="Go to Orders"
          onAction={() => router.push('/order/history')}
        />
      </View>
    );
  }

  const currentStatus = cancelled ? 'cancelled' : order.status;
  const stepIdx = getStepIndex(currentStatus);
  const showPartner =
    ['accepted', 'out_for_delivery', 'delivered'].includes(currentStatus) &&
    order.deliveryPartner;

  const handleCancel = () => {
    Alert.alert(
      'Cancel this order?',
      `This action cannot be undone. Your order ${order.id} will be cancelled.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => setCancelled(true),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <AppHeader title={`Order ${order.id}`} />

      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Status + Badge */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900">Order Status</Text>
          <StatusBadge status={currentStatus} />
        </View>

        {/* Status Tracker */}
        {currentStatus !== 'cancelled' ? (
          <View className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
            <View className="flex-row items-center justify-between relative">
              {/* Background line */}
              <View
                className="absolute bg-gray-200"
                style={{ top: 16, left: 35, right: 35, height: 2 }}
              />
              {/* Progress line */}
              <View
                className="absolute bg-[#22c55e]"
                style={{
                  top: 16,
                  left: 35,
                  height: 2,
                  width: `${Math.max(0, stepIdx) / (STEPS.length - 1) * 75}%`,
                }}
              />

              {STEPS.map((step, i) => (
                <View
                  key={step.key}
                  className="relative z-10 items-center"
                  style={{ width: 70 }}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      i <= stepIdx ? 'bg-[#22c55e]' : 'bg-gray-200'
                    } ${i === stepIdx ? 'border-4 border-green-100' : ''}`}
                  >
                    {i <= stepIdx ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Text className="text-xs font-bold text-gray-400">{i + 1}</Text>
                    )}
                  </View>
                  <Text
                    className={`text-[10px] font-medium mt-2 text-center leading-tight ${
                      i <= stepIdx ? 'text-[#22c55e]' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-red-50 rounded-xl border border-red-100 p-4 mb-4 items-center">
            <Ionicons name="close-circle" size={32} color="#F87171" />
            <Text className="text-sm font-semibold text-red-600 mt-2">Order Cancelled</Text>
          </View>
        )}

        {/* Delivery Partner */}
        {showPartner && order.deliveryPartner && (
          <View className="bg-white rounded-xl border border-gray-100 p-4 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-400 mb-0.5">Delivery Partner</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {order.deliveryPartner.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${order.deliveryPartner!.phone}`)}
              className="w-10 h-10 bg-[#22c55e] rounded-full items-center justify-center"
              activeOpacity={0.8}
              style={{ elevation: 2 }}
            >
              <Ionicons name="call" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Address & Slot */}
        <View className="bg-white rounded-xl border border-gray-100 p-4 mb-3 gap-3">
          <View className="flex-row items-start gap-2.5">
            <Ionicons name="location" size={16} color="#22c55e" style={{ marginTop: 2 }} />
            <View>
              <Text className="text-xs text-gray-400">Delivery Address</Text>
              <Text className="text-sm text-gray-700">{order.address}</Text>
            </View>
          </View>
          <View className="flex-row items-start gap-2.5">
            <Ionicons name="time" size={16} color="#22c55e" style={{ marginTop: 2 }} />
            <View>
              <Text className="text-xs text-gray-400">Delivery Slot</Text>
              <Text className="text-sm text-gray-700">{order.slot}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <Text className="text-sm font-bold text-gray-800 mb-3">
            Items ({order.items.length})
          </Text>
          <View className="gap-2.5">
            {order.items.map((item) => (
              <View key={item.productId} className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {item.weight} × {item.quantity}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-gray-800">
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bill Summary */}
        <View className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-3">Bill Summary</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm text-gray-700">₹{order.subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Delivery</Text>
              <Text
                className={`text-sm ${
                  order.deliveryCharge === 0 ? 'text-[#22c55e] font-semibold' : ''
                }`}
              >
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
              </Text>
            </View>
            <View className="border-t border-gray-100 pt-2 flex-row justify-between">
              <Text className="text-sm font-bold text-gray-900">Total</Text>
              <Text className="text-sm font-bold text-gray-900">₹{order.total}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Order */}
        {currentStatus === 'pending' && !cancelled && (
          <TouchableOpacity
            onPress={handleCancel}
            className="h-11 rounded-xl border border-red-300 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-red-500 text-sm font-semibold">Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
