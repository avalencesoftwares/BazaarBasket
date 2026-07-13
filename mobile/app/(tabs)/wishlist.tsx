// packages/mobile/app/(tabs)/wishlist.tsx
// Wishlist screen — displays saved products in a premium grid, matching home screen design

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { COLLECTIONS, formatCurrency } from '@bazaarbasket/shared';
import type { Product } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;

const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  white: '#FFFFFF',
  offWhite: '#F5F6FA',
  mintBg: '#F1F8F3',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  borderLight: '#E8ECF0',
  red: '#EF4444',
  shadow: '#000000',
};

// ─── Product Card (Wishlist Version) ─────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = wishlistIds.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
    } catch {
      // Error handled in store
    } finally {
      setIsAdding(false);
    }
  }, [product.id, isOutOfStock, addItem]);

  const handleToggleWishlist = useCallback(async () => {
    await toggleWishlist(product.id);
  }, [product.id, toggleWishlist]);

  return (
    <TouchableOpacity
      style={[styles.productCard, isOutOfStock && styles.productCardOutOfStock]}
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}`}
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={styles.productImageContainer}>
        {product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0].thumbnailUrl }}
            style={styles.productImage}
            contentFit="cover"
            cachePolicy="disk"
          />
        ) : (
          <View style={[styles.productImage, styles.productPlaceholder]}>
            <Ionicons name="image" size={32} color="#D1D5DB" />
          </View>
        )}

        {/* Heart / Wishlist Icon */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleToggleWishlist}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? COLORS.red : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={1}>
          {product.description || product.unit}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>

          {/* Circular Add Button */}
          {isOutOfStock ? (
            <View style={styles.addButtonDisabled}>
              <Ionicons name="remove" size={18} color={COLORS.textMuted} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              disabled={isAdding}
              activeOpacity={0.8}
              accessibilityLabel={`Add ${product.name} to cart`}
              accessibilityRole="button"
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="add" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function WishlistScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const wishlistQuery = useQuery({
    queryKey: ['wishlistProducts', wishlistIds],
    queryFn: async () => {
      if (wishlistIds.length === 0) return [];
      
      // Fetch products in chunks of 10 because Firestore 'in' query limit is 10
      const chunks = [];
      for (let i = 0; i < wishlistIds.length; i += 10) {
        chunks.push(wishlistIds.slice(i, i + 10));
      }
      
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const q = query(
            collection(db, COLLECTIONS.PRODUCTS),
            where('__name__', 'in', chunk)
          );
          const snap = await getDocs(q);
          return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
            updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
          })) as Product[];
        })
      );
      
      return results.flat();
    },
    enabled: wishlistIds.length > 0,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await wishlistQuery.refetch();
    setRefreshing(false);
  }, [wishlistQuery]);

  const products = wishlistIds.length > 0 ? (wishlistQuery.data || []) : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>
          {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryGreen}
            colors={[COLORS.primaryGreen]}
          />
        }
      >
        {wishlistIds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={56} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any product to save it here for later.
            </Text>
          </View>
        ) : wishlistQuery.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            <Text style={styles.loaderText}>Loading saved items...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={56} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>No saved items found</Text>
            <Text style={styles.emptySubtitle}>
              The items in your wishlist may have been deleted or disabled.
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mintBg,
  },
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingTop: Platform.OS === 'ios' ? 58 : 46,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  loaderContainer: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productCardOutOfStock: {
    opacity: 0.55,
  },
  productImageContainer: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH * 0.7,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
    paddingTop: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
