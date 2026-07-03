// packages/mobile/app/product/[id].tsx
// Product detail screen

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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { getProduct } from '../../services/productService';
import { formatCurrency, calculateDiscount } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

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
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
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
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Ionicons name="image" size={64} color="#475569" />
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
            {discount > 0 && <Text style={styles.savingsText}>You save {formatCurrency(product.mrp - product.price)}</Text>}
          </View>

          {product.gstSlab > 0 && (
            <Text style={styles.gstInfo}>GST: {product.gstSlab}% included</Text>
          )}

          {/* Stock */}
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
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
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
              <Ionicons name="remove" size={18} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={18} color="#f8fafc" />
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
  container: { flex: 1, backgroundColor: '#0f172a' },
  loadingContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', marginTop: 12 },
  backButton: { backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  backButtonText: { fontSize: 14, color: '#f8fafc', fontWeight: '600' },
  imageGallery: { position: 'relative', backgroundColor: '#1e293b' },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85 },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  dotsContainer: { position: 'absolute', bottom: 12, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#ffffff', width: 24 },
  discountBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  discountText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  infoContainer: { padding: 20 },
  productName: { fontSize: 22, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  productUnit: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  price: { fontSize: 26, fontWeight: '700', color: '#4CAF50' },
  mrp: { fontSize: 16, color: '#64748b', textDecorationLine: 'line-through' },
  savingsText: { fontSize: 13, color: '#f97316', fontWeight: '600' },
  gstInfo: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  stockContainer: { marginBottom: 16 },
  inStockTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inStockText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  lowStockTag: { backgroundColor: '#7c2d1220', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  lowStockText: { fontSize: 13, color: '#f97316', fontWeight: '600' },
  outOfStockTag: { backgroundColor: '#44403c20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  outOfStockText: { fontSize: 13, color: '#ef4444', fontWeight: '600' },
  descriptionContainer: { marginBottom: 16 },
  descriptionTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 12, color: '#94a3b8' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 36, gap: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 10, overflow: 'hidden' },
  qtyButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#334155' },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#f8fafc', paddingHorizontal: 16 },
  addToCartButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 14, gap: 8 },
  addToCartDisabled: { opacity: 0.5 },
  addToCartText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
