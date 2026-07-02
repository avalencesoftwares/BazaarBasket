// packages/mobile/app/order/history.tsx
// Order history screen with infinite scroll

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/orderService';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, OrderStatus } from '@bazaarbasket/shared';
import type { Order } from '@bazaarbasket/shared';
import { useAuthStore } from '../../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING: return '#f97316';
    case OrderStatus.CONFIRMED: return '#3b82f6';
    case OrderStatus.PACKED: return '#8b5cf6';
    case OrderStatus.OUT_FOR_DELIVERY: return '#06b6d4';
    case OrderStatus.DELIVERED: return '#22c55e';
    case OrderStatus.CANCELLED: return '#ef4444';
    default: return '#64748b';
  }
}

function OrderCard({ order }: { order: Order }) {
  const statusColor = getStatusColor(order.status);

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order/${order.id}`)}
      accessibilityLabel={`Order ${order.orderNumber}`}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      <View style={styles.itemsSummary}>
        <Text style={styles.itemsText} numberOfLines={1}>
          {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>{formatCurrency(order.totalAmount)}</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{order.items.length} items</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrderHistoryScreen() {
  const userId = useAuthStore((s) => s.firebaseUser?.uid || '');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['orders', userId],
    queryFn: async ({ pageParam }) => {
      return getOrders(userId, pageParam as any);
    },
    initialPageParam: undefined as unknown,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
  });

  const orders = data?.pages.flatMap((page) => page.orders) || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#4CAF50" style={styles.footerLoader} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shopButtonGradient}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderNumber: { fontSize: 15, fontWeight: '700', color: '#000000' },
  orderDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemsSummary: { marginBottom: 10 },
  itemsText: { fontSize: 13, color: '#475569' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 17, fontWeight: '700', color: '#000000' },
  itemCountBadge: { backgroundColor: '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  itemCountText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  footerLoader: { paddingVertical: 20 },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#000000', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  shopButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  shopButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: { fontSize: 16, fontWeight: '700', color: '#000000' },
});
