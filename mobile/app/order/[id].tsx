// packages/mobile/app/order/[id].tsx
// Order detail screen with status stepper

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../../services/orderService';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, OrderStatus } from '@bazaarbasket/shared';

const STATUS_STEPS = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

function OrderStatusStepper({ currentStatus }: { currentStatus: OrderStatus }) {
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <View style={styles.cancelledContainer}>
        <Ionicons name="close-circle" size={40} color="#ef4444" />
        <Text style={styles.cancelledText}>Order Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <View style={styles.stepper}>
      {STATUS_STEPS.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View key={status} style={styles.stepContainer}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isCurrent && styles.stepLabelCurrent,
                ]}
              >
                {ORDER_STATUS_LABELS[status]}
              </Text>
            </View>
            {index < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    refetchInterval: 30_000, // Auto-refresh every 30s for live status
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
      </View>

      {/* Status Stepper */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.card}>
          <OrderStatusStepper currentStatus={order.status} />
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>
              {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>{order.deliverySlot.label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>Cash on Delivery</Text>
          </View>
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        {order.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
              <Text style={styles.itemQty}>{item.quantity} × {formatCurrency(item.price)}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(order.itemsTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={[styles.summaryValue, order.deliveryFee === 0 && styles.freeText]}>
            {order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}
          </Text>
        </View>
        {order.gstAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.gstAmount)}</Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', marginTop: 12 },
  backBtn: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  backBtnText: { fontSize: 14, color: '#000000', fontWeight: '600' },
  orderHeader: { marginBottom: 24 },
  orderNumber: { fontSize: 22, fontWeight: '700', color: '#000000' },
  orderDate: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000', marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepper: { paddingVertical: 8 },
  stepContainer: {},
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  stepCircleCompleted: { backgroundColor: '#388E3C' },
  stepCircleCurrent: { backgroundColor: '#4CAF50', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 8 },
  stepNumber: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  stepLabel: { fontSize: 14, color: '#94A3B8' },
  stepLabelCompleted: { color: '#000000' },
  stepLabelCurrent: { color: '#388E3C', fontWeight: '700' },
  stepLine: { width: 2, height: 24, backgroundColor: '#F1F5F9', marginLeft: 13, marginVertical: 4 },
  stepLineCompleted: { backgroundColor: '#388E3C' },
  cancelledContainer: { alignItems: 'center', paddingVertical: 12 },
  cancelledText: { fontSize: 16, fontWeight: '700', color: '#ef4444', marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  detailText: { fontSize: 14, color: '#475569', flex: 1 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, color: '#000000', fontWeight: '500', marginBottom: 2 },
  itemQty: { fontSize: 12, color: '#64748b' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#000000' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#000000', fontWeight: '600' },
  freeText: { color: '#388E3C' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#000000' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#388E3C' },
});
