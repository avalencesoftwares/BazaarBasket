// src/components/screens/OrdersScreen.tsx
// Orders screen with Active/Past tabs and order cards

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ORDERS, type MockOrder } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeOrders = MOCK_ORDERS.filter((o) =>
    ['pending', 'accepted', 'out_for_delivery'].includes(o.status)
  );
  const pastOrders = MOCK_ORDERS.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  const renderOrderCard = (order: MockOrder) => (
    <TouchableOpacity
      key={order.id}
      onPress={() => router.push(`/order/${order.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-4"
      activeOpacity={0.7}
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-bold text-gray-800">{order.id}</Text>
        <StatusBadge status={order.status} />
      </View>
      <View className="flex-row items-center gap-3 mb-2">
        <Text className="text-xs text-gray-400">{order.date}</Text>
        <Text className="text-xs text-gray-400">•</Text>
        <Text className="text-xs text-gray-400">{order.slot}</Text>
      </View>
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          {order.items.length} item{order.items.length > 1 ? 's' : ''}
        </Text>
        <Text className="text-sm font-bold text-gray-900">₹{order.total}</Text>
      </View>
    </TouchableOpacity>
  );

  const ordersToShow = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center h-14 px-4">
          <Ionicons name="cube-outline" size={20} color="#22c55e" />
          <Text className="text-base font-bold text-gray-900 ml-2">My Orders</Text>
        </View>
      </View>

      <View className="px-4 pt-3">
        {/* Tab Toggle */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 h-11 mb-3">
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            className={`flex-1 rounded-lg items-center justify-center ${
              activeTab === 'active' ? 'bg-white' : ''
            }`}
            activeOpacity={0.7}
            style={activeTab === 'active' ? { elevation: 1 } : undefined}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'active' ? 'text-[#22c55e]' : 'text-gray-500'
              }`}
            >
              Active ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('past')}
            className={`flex-1 rounded-lg items-center justify-center ${
              activeTab === 'past' ? 'bg-white' : ''
            }`}
            activeOpacity={0.7}
            style={activeTab === 'past' ? { elevation: 1 } : undefined}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'past' ? 'text-[#22c55e]' : 'text-gray-500'
              }`}
            >
              Past ({pastOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 120 }}>
          {ordersToShow.length > 0 ? (
            ordersToShow.map(renderOrderCard)
          ) : (
            <EmptyState
              icon={activeTab === 'active' ? 'cube-outline' : 'bag-outline'}
              title={activeTab === 'active' ? 'No active orders' : 'No past orders'}
              description={
                activeTab === 'active'
                  ? "You don't have any active orders right now."
                  : 'Your completed and cancelled orders will appear here.'
              }
              actionLabel={activeTab === 'active' ? 'Start Shopping' : undefined}
              onAction={activeTab === 'active' ? () => router.push('/(tabs)') : undefined}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
