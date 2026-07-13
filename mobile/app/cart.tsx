// packages/mobile/app/cart.tsx
// Cart screen with quantity stepper, back button, and checkout button — Premium Light Theme

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatCurrency, DELIVERY_CONFIG } from '@bazaarbasket/shared';
import { useQuery } from '@tanstack/react-query';
import { getStoreSettings } from '../services/settingsService';
import type { CartItem } from '@bazaarbasket/shared';
import { useCartStore } from '../store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';

function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleIncrement = useCallback(async () => {
    if (item.quantity >= item.stock) {
      Alert.alert('Max Stock', `Only ${item.stock} units available.`);
      return;
    }
    setIsUpdating(true);
    try {
      await updateQuantity(item.productId, item.quantity + 1);
    } catch {
      // handled in store
    } finally {
      setIsUpdating(false);
    }
  }, [item, updateQuantity]);

  const handleDecrement = useCallback(async () => {
    if (item.quantity <= 1) {
      Alert.alert('Remove Item', `Remove ${item.productName} from cart?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem(item.productId);
            } catch {
              // handled in store
            }
          },
        },
      ]);
      return;
    }
    setIsUpdating(true);
    try {
      await updateQuantity(item.productId, item.quantity - 1);
    } catch {
      // handled in store
    } finally {
      setIsUpdating(false);
    }
  }, [item, updateQuantity, removeItem]);

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemImage}>
        {item.productImage ? (
          <Image source={{ uri: item.productImage }} style={styles.itemImage} contentFit="cover" cachePolicy="disk" />
        ) : (
          <View style={[styles.itemImage, styles.itemPlaceholder]}>
            <Ionicons name="image" size={20} color="#CBD5E1" />
          </View>
        )}
      </View>

      <View style={styles.cartItemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>

      <View style={styles.quantityStepper}>
        <TouchableOpacity
          style={[styles.stepperButton, styles.stepperButtonLeft]}
          onPress={handleDecrement}
          disabled={isUpdating}
          activeOpacity={0.7}
          accessibilityLabel={`Decrease ${item.productName} quantity`}
        >
          <Ionicons name={item.quantity <= 1 ? 'trash' : 'remove'} size={14} color={item.quantity <= 1 ? '#EF4444' : '#4CAF50'} />
        </TouchableOpacity>

        <View style={styles.quantityDisplay}>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.quantityText}>{item.quantity}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.stepperButton, styles.stepperButtonRight, item.quantity >= item.stock && styles.stepperButtonDisabled]}
          onPress={handleIncrement}
          disabled={isUpdating || item.quantity >= item.stock}
          activeOpacity={0.7}
          accessibilityLabel={`Increase ${item.productName} quantity`}
        >
          <Ionicons name="add" size={14} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <Text style={styles.itemSubtotal}>{formatCurrency(item.price * item.quantity)}</Text>
    </View>
  );
}

export default function CartScreen() {
  const { items, totalItems, totalAmount, isSyncing, clearCart } = useCartStore();
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');

  const { data: settings } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD;
  const standardDeliveryFee = settings?.deliveryFee ?? DELIVERY_CONFIG.DELIVERY_FEE;
  const minDeliveryThreshold = settings?.minOrderAmount ?? DELIVERY_CONFIG.MIN_ORDER_AMOUNT;
  const minOrderLimit = settings?.minOrderLimit ?? 0;

  const deliveryFee = fulfillmentMethod === 'pickup'
    ? 0
    : (totalAmount >= freeDeliveryThreshold ? 0 : standardDeliveryFee);
  const grandTotal = totalAmount + deliveryFee;

  const isBelowMinLimit = totalAmount < minOrderLimit;
  const isBelowDeliveryMin = totalAmount < minDeliveryThreshold;

  const canCheckout = fulfillmentMethod === 'delivery' ? !isBelowDeliveryMin : !isBelowMinLimit;

  const handleClearCart = useCallback(() => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    if (!canCheckout) return;
    if (fulfillmentMethod === 'delivery') {
      router.push('/checkout/address');
    } else {
      router.push({
        pathname: '/checkout/confirm',
        params: {
          addressId: 'pickup',
          slotDate: new Date().toISOString().split('T')[0],
          slotStartTime: '',
          slotEndTime: '',
          slotLabel: 'Self Pickup (Store Working Hours)',
        },
      });
    }
  }, [fulfillmentMethod, canCheckout]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyIconBg}>
          <Ionicons name="cart-outline" size={56} color="#CBD5E1" />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from the store to get started</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shopButtonGradient}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart ({totalItems} items)</Text>
        </View>
        <TouchableOpacity onPress={handleClearCart} accessibilityLabel="Clear cart" activeOpacity={0.6}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <CartItemRow item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Price Summary */}
      <View style={styles.summary}>
        {/* Fulfillment Toggle */}
        <View style={styles.fulfillmentContainer}>
          <TouchableOpacity
            style={[styles.fulfillmentTab, fulfillmentMethod === 'delivery' && styles.fulfillmentTabActive]}
            onPress={() => setFulfillmentMethod('delivery')}
            activeOpacity={0.7}
          >
            <Ionicons name="bicycle" size={16} color={fulfillmentMethod === 'delivery' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.fulfillmentText, fulfillmentMethod === 'delivery' && styles.fulfillmentTextActive]}>
              Home Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fulfillmentTab, fulfillmentMethod === 'pickup' && styles.fulfillmentTabActive]}
            onPress={() => setFulfillmentMethod('pickup')}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront" size={16} color={fulfillmentMethod === 'pickup' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.fulfillmentText, fulfillmentMethod === 'pickup' && styles.fulfillmentTextActive]}>
              Self Pickup
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeDelivery]}>
            {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
          </Text>
        </View>

        {fulfillmentMethod === 'delivery' && isBelowDeliveryMin && !isBelowMinLimit && (
          <View style={styles.alertHintContainer}>
            <Ionicons name="alert-circle" size={14} color="#D97706" />
            <Text style={styles.alertHintText}>
              Delivery unlocks at {formatCurrency(minDeliveryThreshold)}. Switch to Self Pickup to order.
            </Text>
          </View>
        )}

        {isBelowMinLimit && (
          <View style={styles.alertHintRedContainer}>
            <Ionicons name="ban" size={14} color="#DC2626" />
            <Text style={styles.alertHintRedText}>
              Min order is {formatCurrency(minOrderLimit)}. Add {formatCurrency(minOrderLimit - totalAmount)} more.
            </Text>
          </View>
        )}

        {fulfillmentMethod === 'delivery' && !isBelowDeliveryMin && totalAmount < freeDeliveryThreshold && (
          <View style={styles.freeDeliveryHintContainer}>
            <Ionicons name="information-circle" size={14} color="#F59E0B" />
            <Text style={styles.freeDeliveryHint}>
              Add {formatCurrency(freeDeliveryThreshold - totalAmount)} more for free delivery
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, (isSyncing || !canCheckout) && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isSyncing || !canCheckout}
          activeOpacity={0.85}
          accessibilityLabel="Proceed to checkout"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={canCheckout ? ['#4CAF50', '#388E3C'] : ['#94A3B8', '#64748B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutText}>
              {isBelowMinLimit ? 'Below Min Order Limit' : (fulfillmentMethod === 'delivery' && isBelowDeliveryMin ? 'Below Delivery Minimum' : 'Proceed to Checkout')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  clearText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cartItemImage: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8FAFC' },
  itemImage: { width: '100%', height: '100%' },
  itemPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cartItemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 2 },
  itemUnit: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  itemPrice: { fontSize: 13, color: '#388E3C', fontWeight: '600' },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepperButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  stepperButtonLeft: { borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  stepperButtonRight: { borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  stepperButtonDisabled: { opacity: 0.4 },
  quantityDisplay: { width: 36, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  quantityText: { fontSize: 14, fontWeight: '700', color: '#000000' },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: '#000000', minWidth: 55, textAlign: 'right' },
  summary: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#000000' },
  summaryValue: { fontSize: 14, color: '#000000', fontWeight: '600' },
  freeDelivery: { color: '#4CAF50' },
  freeDeliveryHintContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  freeDeliveryHint: { fontSize: 12, color: '#F59E0B', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#000000' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#388E3C' },
  checkoutButton: {
    borderRadius: 14,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  checkoutButtonDisabled: { opacity: 0.5 },
  checkoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 14,
  },
  checkoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#000000', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  shopButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  shopButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  fulfillmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  fulfillmentTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 8,
  },
  fulfillmentTabActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  fulfillmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  fulfillmentTextActive: {
    color: '#FFFFFF',
  },
  alertHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertHintText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    flex: 1,
  },
  alertHintRedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  alertHintRedText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
});
