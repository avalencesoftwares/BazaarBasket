// packages/mobile/app/product/[id].tsx
// Product detail screen — Premium Light Theme matching BazaarBasket design language

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { getProduct } from '../../services/productService';
import { formatCurrency, calculateDiscount } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textSecondary: '#64748B',
  borderLight: '#F1F5F9',
  accentOrange: '#FFA726',
  red: '#EF4444',
  lightGreen: '#E8F5E9',
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  
  const { items, addItem } = useCartStore();
  const cartItem = items.find((i) => i.productId === id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const handleAddToCart = useCallback(async () => {
    if (!product || product.stock <= 0) { return; }
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      Alert.alert('Added!', `${product.name} added to cart.`);
    } catch {
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setIsAdding(false);
    }
  }, [product, quantity, addItem]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discount = calculateDiscount(product.mrp, product.price);
  const isOutOfStock = product.stock <= 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {product.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActiveImageIndex(index);
              }}
            >
              {product.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img.url }}
                  style={styles.productImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.productImage, styles.imagePlaceholder]}>
              <Ionicons name="image" size={64} color={COLORS.textSecondary} />
            </View>
          )}

          {/* Image Dots */}
          {product.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {product.images.map((_, index) => (
                <View key={index} style={[styles.dot, activeImageIndex === index && styles.dotActive]} />
              ))}
            </View>
          )}

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productUnit}>{product.unit}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.mrp > product.price && (
              <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
            )}
            {discount > 0 && (
              <Text style={styles.savingsText}>You save {formatCurrency(product.mrp - product.price)}</Text>
            )}
          </View>

          {product.gstSlab > 0 && (
            <Text style={styles.gstInfo}>GST: {product.gstSlab}% included</Text>
          )}

          {/* In-Cart Indicator */}
          {quantityInCart > 0 && (
            <View style={styles.inCartIndicator}>
              <Ionicons name="cart" size={16} color={COLORS.primaryGreen} />
              <Text style={styles.inCartText}>{quantityInCart} added in your cart</Text>
            </View>
          )}

          {/* Stock Info */}
          <View style={styles.stockContainer}>
            {isOutOfStock ? (
              <View style={styles.outOfStockTag}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            ) : product.stock <= 10 ? (
              <View style={styles.lowStockTag}>
                <Text style={styles.lowStockText}>Only {product.stock} left!</Text>
              </View>
            ) : (
              <View style={styles.inStockTag}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryGreen} />
                <Text style={styles.inStockText}>In Stock</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      {!isOutOfStock && (
        <View style={styles.bottomBar}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons name="remove" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addToCartButton, isAdding && styles.addToCartDisabled]}
            onPress={handleAddToCart}
            disabled={isAdding}
            accessibilityLabel="Add to cart"
            accessibilityRole="button"
          >
            {isAdding ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="cart" size={20} color="#ffffff" />
                <Text style={styles.addToCartText}>Add to Cart • {formatCurrency(product.price * quantity)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: COLORS.red, marginTop: 12, fontWeight: '600' },
  backButton: { backgroundColor: COLORS.borderLight, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  backButtonText: { fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: { paddingBottom: 120 },
  imageGallery: { position: 'relative', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  dotsContainer: { position: 'absolute', bottom: 12, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)' },
  dotActive: { backgroundColor: '#4CAF50', width: 24 },
  discountBadge: { position: 'absolute', top: 50, right: 20, backgroundColor: COLORS.red, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  discountText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  infoContainer: { padding: 20 },
  productName: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  productUnit: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  price: { fontSize: 26, fontWeight: '700', color: COLORS.primaryGreen },
  mrp: { fontSize: 16, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  savingsText: { fontSize: 13, color: '#F97316', fontWeight: '600' },
  gstInfo: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },
  inCartIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inCartText: { fontSize: 13, color: '#388E3C', fontWeight: '600' },
  stockContainer: { marginBottom: 16 },
  inStockTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inStockText: { fontSize: 14, color: COLORS.primaryGreen, fontWeight: '600' },
  lowStockTag: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  lowStockText: { fontSize: 13, color: '#D97706', fontWeight: '600' },
  outOfStockTag: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  outOfStockText: { fontSize: 13, color: COLORS.red, fontWeight: '600' },
  descriptionContainer: { marginBottom: 16, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 16 },
  descriptionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 16 },
  tag: { backgroundColor: COLORS.borderLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 12, color: COLORS.textSecondary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden' },
  qtyButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2E8F0' },
  qtyText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, paddingHorizontal: 16 },
  addToCartButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryGreen, borderRadius: 12, paddingVertical: 14, gap: 8 },
  addToCartDisabled: { opacity: 0.5 },
  addToCartText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
