// packages/mobile/app/(tabs)/index.tsx
// Home screen — Redesigned to match food delivery app screenshot

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { getCategories, getProducts } from '../../services/productService';
import { getStoreSettings } from '../../services/settingsService';
import { formatCurrency } from '@bazaarbasket/shared';
import type { Product, Category } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;
const CATEGORY_CIRCLE_SIZE = 70;

// ─── Color Palette (matching screenshot green theme) ──────────────────────────
const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  lightGreen: '#E8F5E9',
  accentGreen: '#66BB6A',
  white: '#FFFFFF',
  offWhite: '#F5F6FA',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  borderLight: '#E8ECF0',
  red: '#EF4444',
  shadow: '#000000',
};

// ─── Category Item ────────────────────────────────────────────────────────────
function CategoryItem({ category }: { category: Category }) {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/(tabs)/search?categoryId=${category.id}`)}
      accessibilityLabel={`Browse ${category.name}`}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <View style={styles.categoryRing}>
        <View style={styles.categoryImageWrapper}>
          {category.imageUrl ? (
            <Image
              source={{ uri: category.imageUrl }}
              style={styles.categoryImage}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View style={[styles.categoryImage, styles.categoryPlaceholder]}>
              <Ionicons name="grid" size={24} color={COLORS.textMuted} />
            </View>
          )}
        </View>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Product Card (Recommended Style) ─────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const toggleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
  }, []);

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
          onPress={toggleWishlist}
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

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ pageSize: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  const settingsQuery = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      categoriesQuery.refetch(),
      productsQuery.refetch(),
      settingsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [categoriesQuery, productsQuery, settingsQuery]);

  const storeAddress = settingsQuery.data?.storeAddress || 'Your City';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />

      <ScrollView
        style={styles.scrollView}
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
        {/* ─── Search Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.7}
            accessibilityLabel="Search for food"
            accessibilityRole="search"
          >
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <Text style={styles.searchPlaceholder}>Search for food...</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
            accessibilityLabel="Cart"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.textPrimary} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItems > 9 ? '9+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ─── Current Location ──────────────────────────────────────── */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Current Location</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.primaryGreen} />
            <Text style={styles.locationText}>{storeAddress}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
          </View>
        </View>

        {/* ─── Categories ────────────────────────────────────────────── */}
        <View style={styles.categoriesSection}>
          {categoriesQuery.isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primaryGreen} style={styles.loader} />
          ) : (
            <FlatList
              data={categoriesQuery.data || []}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <CategoryItem category={item} />}
              contentContainerStyle={styles.categoryList}
            />
          )}
        </View>

        {/* ─── Promotional Banner ────────────────────────────────────── */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerLabel}>
                {settingsQuery.data?.bannerTitle || 'New Year Offer'}
              </Text>
              <Text style={styles.bannerDiscount}>
                {settingsQuery.data?.bannerOffer || '40% OFF'}
              </Text>
              <Text style={styles.bannerDate}>
                {settingsQuery.data?.bannerSubtitle || '16-31 Dec'}
              </Text>

              <View style={styles.bannerButtonRow}>
                <TouchableOpacity
                  style={styles.bannerButton}
                  onPress={() => router.push('/(tabs)/search')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bannerButtonText}>Get Now</Text>
                </TouchableOpacity>
                <View style={styles.bannerArrow}>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                </View>
              </View>
            </View>

            {/* Right side promotional image area */}
            <View style={styles.bannerRight}>
              <View style={styles.bannerDiscountBadge}>
                <Text style={styles.bannerDiscountBadgeLabel}>DISCOUNT</Text>
                <Text style={styles.bannerDiscountBadgePercent}>40%</Text>
                <Text style={styles.bannerDiscountBadgeOff}>OFF</Text>
              </View>
              <View style={styles.bannerImagePlaceholder}>
                <Ionicons name="gift" size={48} color="rgba(255,255,255,0.4)" />
              </View>
              <View style={styles.bannerAllProducts}>
                <Text style={styles.bannerAllProductsText}>ALL PRODUCT</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ─── Recommended for You ───────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              accessibilityLabel="See more products"
              accessibilityRole="button"
            >
              <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
          </View>

          {productsQuery.isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primaryGreen} style={styles.loader} />
          ) : (
            <View style={styles.productGrid}>
              {(productsQuery.data?.products || []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollView: {
    flex: 1,
  },

  // ── Header / Search ───────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: COLORS.offWhite,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 50,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
    flex: 1,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },

  // ── Location ──────────────────────────────────────────────────────────────
  locationContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 16,
  },
  locationLabel: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // ── Categories ────────────────────────────────────────────────────────────
  categoriesSection: {
    paddingBottom: 20,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: CATEGORY_CIRCLE_SIZE + 16,
  },
  categoryRing: {
    width: CATEGORY_CIRCLE_SIZE + 8,
    height: CATEGORY_CIRCLE_SIZE + 8,
    borderRadius: (CATEGORY_CIRCLE_SIZE + 8) / 2,
    borderWidth: 2.5,
    borderColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryImageWrapper: {
    width: CATEGORY_CIRCLE_SIZE,
    height: CATEGORY_CIRCLE_SIZE,
    borderRadius: CATEGORY_CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  bannerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  banner: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 160,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  bannerDiscount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  bannerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  bannerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  bannerArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerRight: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bannerDiscountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 2,
  },
  bannerDiscountBadgeLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFEB3B',
    letterSpacing: 0.5,
  },
  bannerDiscountBadgePercent: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 18,
  },
  bannerDiscountBadgeOff: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFEB3B',
  },
  bannerImagePlaceholder: {
    width: 90,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerAllProducts: {
    marginTop: 6,
    backgroundColor: '#FFEB3B',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bannerAllProductsText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#E65100',
    letterSpacing: 0.5,
  },

  // ── Section Headers ───────────────────────────────────────────────────────
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeMoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Product Cards ─────────────────────────────────────────────────────────
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
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

  // ── Misc ──────────────────────────────────────────────────────────────────
  loader: {
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
