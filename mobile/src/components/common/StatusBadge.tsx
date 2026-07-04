// src/components/common/StatusBadge.tsx
// Color-coded order status pill

import React from 'react';
import { View, Text } from 'react-native';
import type { OrderStatus } from '../../data/mockData';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  accepted: { label: 'Accepted', bg: 'bg-blue-100', text: 'text-blue-700' },
  out_for_delivery: { label: 'Delivering', bg: 'bg-orange-100', text: 'text-orange-700' },
  delivered: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-[10px] font-semibold ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
