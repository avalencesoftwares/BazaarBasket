// packages/mobile/app/(tabs)/cart.tsx
// Cart screen with quantity stepper and checkout button — Premium Light Theme

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
import { getStoreSettings } from '../../services/settingsService';
import type { CartItem } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';
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
          <Ionicons name={item.quantity <= 1 ? 'trash' : 'remove'} size={14} color={item.quantity <= 1 ? '#EF4444' : '#00B7B5'} />
        </TouchableOpacity>

        <View style={styles.quantityDisplay}>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#00B7B5" />
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
          <Ionicons name="add" size={14} color="#00B7B5" />
        </TouchableOpacity>
      </View>

      <Text style={styles.itemSubtotal}>{formatCurrency(item.price * item.quantity)}</Text>
    </View>
  );
}

export default function CartScreen() {
  const { items, totalItems, totalAmount, isSyncing, clearCart } = useCartStore();

  const { data: settings } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD;
  const standardDeliveryFee = settings?.deliveryFee ?? DELIVERY_CONFIG.DELIVERY_FEE;

  const deliveryFee = totalAmount >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  const grandTotal = totalAmount + deliveryFee;

  const handleClearCart = useCallback(() => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  }, [clearCart]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyIconBg}>
          <Ionicons name="cart-outline" size={56} color="#CBD5E1" />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from the store to get started</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00B7B5', '#00A19F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shopButtonGradient}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#000000" />
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
        <Text style={styles.headerTitle}>Cart ({totalItems} items)</Text>
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
        {totalAmount < freeDeliveryThreshold && (
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
          style={[styles.checkoutButton, isSyncing && styles.checkoutButtonDisabled]}
          onPress={() => router.push('/checkout/address')}
          disabled={isSyncing}
          activeOpacity={0.85}
          accessibilityLabel="Proceed to checkout"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#00B7B5', '#00A19F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color="#000000" />
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  clearText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
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
  itemPrice: { fontSize: 13, color: '#00A19F', fontWeight: '600' },
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
    paddingBottom: 40,
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
  freeDelivery: { color: '#00A19F' },
  freeDeliveryHintContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  freeDeliveryHint: { fontSize: 12, color: '#F59E0B', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#000000' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#00A19F' },
  checkoutButton: {
    borderRadius: 14,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#00B7B5',
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
  checkoutText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    shadowColor: '#00B7B5',
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
  shopButtonText: { fontSize: 16, fontWeight: '700', color: '#000000' },
});
