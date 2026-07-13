// packages/mobile/app/checkout/confirm.tsx
// Order confirmation screen with COD — Premium Light Theme

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, DELIVERY_CONFIG, PaymentMethod } from '@bazaarbasket/shared';
import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../../services/settingsService';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { placeOrder } from '../../services/orderService';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConfirmOrderScreen() {
  const params = useLocalSearchParams<{
    addressId: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
    slotLabel: string;
  }>();

  const { items, totalAmount } = useCartStore();
  const userProfile = useAuthStore((s) => s.userProfile);
  const [isPlacing, setIsPlacing] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD;
  const standardDeliveryFee = settings?.deliveryFee ?? DELIVERY_CONFIG.DELIVERY_FEE;

  const isPickup = params.addressId === 'pickup';
  const deliveryFee = isPickup ? 0 : (totalAmount >= freeDeliveryThreshold ? 0 : standardDeliveryFee);
  const grandTotal = totalAmount + deliveryFee;

  const selectedAddress = isPickup
    ? {
        id: 'pickup',
        label: 'Store Pickup',
        fullName: userProfile?.displayName || 'Customer',
        phone: userProfile?.phone || '',
        addressLine1: settings?.storeAddress || 'Store Outlet',
        addressLine2: 'Please pick up your order directly from the store location.',
        city: settings?.storeName || 'BazaarBasket Store',
        state: '',
        pincode: '',
        landmark: '',
      }
    : userProfile?.addresses.find((a) => a.id === params.addressId);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address.');
      return;
    }

    setIsPlacing(true);
    try {
      const idempotencyKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const result = await placeOrder({
        deliveryAddress: {
          id: selectedAddress.id,
          label: selectedAddress.label,
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state || '',
          pincode: selectedAddress.pincode || '',
          landmark: selectedAddress.landmark || '',
        },
        deliverySlot: {
          date: params.slotDate || new Date().toISOString().split('T')[0],
          startTime: params.slotStartTime || '',
          endTime: params.slotEndTime || '',
          label: params.slotLabel || 'Self Pickup',
        },
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        notes: '',
        idempotencyKey,
      });

      Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.', [
        {
          text: 'View Order',
          onPress: () => router.replace(`/order/${result.orderId}`),
        },
      ]);
    } catch (error: unknown) {
      let message = 'Failed to place order. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied') || error.message.includes('permission') || error.message.includes('Permission')) {
          message = 'Permission denied. Please ensure you are logged in and your connection is secure, or update your Firestore security rules.';
        } else {
          message = error.message;
        }
      }
      Alert.alert('Order Failed', message);
    } finally {
      setIsPlacing(false);
    }
  }, [selectedAddress, params]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, styles.sectionIconBgTeal]}>
              <Ionicons name="location" size={16} color="#4CAF50" />
            </View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          {selectedAddress ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{selectedAddress.label}</Text>
              <Text style={styles.cardText}>{selectedAddress.fullName}</Text>
              <Text style={styles.cardText}>{selectedAddress.addressLine1}</Text>
              <Text style={styles.cardText}>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</Text>
            </View>
          ) : (
            <Text style={styles.cardText}>No address selected</Text>
          )}
        </View>

        {/* Delivery Slot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, styles.sectionIconBgBlue]}>
              <Ionicons name="time" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>Delivery Slot</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{params.slotLabel}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, styles.sectionIconBgTeal]}>
              <Ionicons name="cash" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={[styles.card, styles.codCard]}>
            <View style={styles.codIconBg}>
              <Ionicons name="cash-outline" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.codTitle}>Cash on Delivery</Text>
              <Text style={styles.codSubtitle}>Pay when your order arrives</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, styles.sectionIconBgPurple]}>
              <Ionicons name="basket" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          </View>
          {items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemQty}>{item.quantity} × {formatCurrency(item.price)}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeText]}>
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacing && styles.placeOrderDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          activeOpacity={0.85}
          accessibilityLabel="Place order"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.placeOrderGradient}
          >
            {isPlacing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text style={styles.placeOrderText}>Place Order • {formatCurrency(grandTotal)}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconBgTeal: {
    backgroundColor: '#E8F5E9',
  },
  sectionIconBgBlue: {
    backgroundColor: '#EFF6FF',
  },
  sectionIconBgPurple: {
    backgroundColor: '#F5F3FF',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 4 },
  cardText: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  codCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  codIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codTitle: { fontSize: 15, fontWeight: '700', color: '#F59E0B' },
  codSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, color: '#000000', fontWeight: '500', marginBottom: 2 },
  itemQty: { fontSize: 12, color: '#94A3B8' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#000000' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 14, color: '#000000', fontWeight: '600' },
  freeText: { color: '#388E3C' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#000000' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#388E3C' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  placeOrderButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  placeOrderDisabled: { opacity: 0.5 },
  placeOrderGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 14,
  },
  placeOrderText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
