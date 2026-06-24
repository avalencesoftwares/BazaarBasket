import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
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
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;
const CATEGORY_CIRCLE_SIZE = 70;

// Helper to chunk array
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// ─── Mock Categories for Redesign Carousel ───────────────────────────────────
const MOCK_CATEGORIES: Category[] = [
  {
    id: 'sweets',
    name: 'Sweets',
    slug: 'sweets',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'health',
    name: 'Health',
    slug: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'drink',
    name: 'Drink',
    slug: 'drink',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'frozen',
    name: 'Frozen',
    slug: 'frozen',
    imageUrl: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bakery',
    name: 'Bakery',
    slug: 'bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'veggies',
    name: 'Veggies',
    slug: 'veggies',
    imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'fruits',
    name: 'Fruits',
    slug: 'fruits',
    imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dairy',
    name: 'Dairy',
    slug: 'dairy',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=250&auto=format&fit=crop',
    imagePublicId: '',
    productCount: 0,
    isActive: true,
    sortOrder: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ─── Color Palette (matching screenshot green theme) ──────────────────────────
const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  lightGreen: '#E8F5E9',
  accentGreen: '#66BB6A',
  white: '#FFFFFF',
  offWhite: '#F5F6FA',
  mintBg: '#F1F8F3', // Light mint green background matching screenshot
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
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const categoriesToRender = categoriesQuery.data && categoriesQuery.data.length > 0
    ? categoriesQuery.data
    : MOCK_CATEGORIES;

  useEffect(() => {
    const totalPages = Math.ceil(categoriesToRender.length / 4);
    if (totalPages <= 1) return;

    const interval = setInterval(() => {
      const nextPage = (currentPage + 1) % totalPages;
      scrollViewRef.current?.scrollTo({
        x: nextPage * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentPage(nextPage);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentPage, categoriesToRender.length]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffset / SCREEN_WIDTH);
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  };

  const storeAddress = settingsQuery.data?.storeAddress || 'New York, USA';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

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
        {/* ─── Curved Green Header ───────────────────────────────────── */}
        <View style={styles.curvedHeader}>
          {/* Search Header Row */}
          <View style={styles.headerRow}>
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

          {/* Location Section */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.white} />
              <Text style={styles.locationText}>{storeAddress}</Text>
            </View>
          </View>
        </View>

        {/* ─── Categories Carousel (with Auto-cycle) ─────────────────── */}
        <View style={styles.categoriesSection}>
          {categoriesQuery.isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primaryGreen} style={styles.loader} />
          ) : (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                contentContainerStyle={styles.categoryScrollContainer}
              >
                {chunkArray(categoriesToRender, 4).map((chunk, pageIndex) => (
                  <View key={`page-${pageIndex}`} style={styles.categoryPage}>
                    {chunk.map((category) => (
                      <CategoryItem key={category.id} category={category} />
                    ))}
                  </View>
                ))}
              </ScrollView>

              {/* Dynamic Page Indicators */}
              <View style={styles.paginationContainer}>
                {chunkArray(categoriesToRender, 4).map((_, pageIndex) => (
                  <View
                    key={`dot-${pageIndex}`}
                    style={[
                      styles.paginationDot,
                      currentPage === pageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* ─── Promotional Banner ────────────────────────────────────── */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#58B25C', '#459D4A']}
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
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#1A1A2E"
                    style={{ transform: [{ rotate: '-45deg' }] }}
                  />
                </View>
              </View>
            </View>

            {/* Right side promotional image area */}
            <View style={styles.bannerRight}>
              {/* Custom SVG Ribbon Tag */}
              <View style={styles.ribbonContainer}>
                <Svg width="54" height="70" viewBox="0 0 54 70">
                  <Path
                    d="M0 0 H54 V60 L27 50 L0 60 Z"
                    fill="#FFFFFF"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                  />
                </Svg>
                <View style={styles.ribbonTextContainer}>
                  <Text style={styles.ribbonLabel}>DISCOUNT</Text>
                  <View style={styles.ribbonDivider} />
                  <Text style={styles.ribbonPercent}>40%</Text>
                  <Text style={styles.ribbonOff}>Off</Text>
                  <View style={styles.ribbonDivider} />
                  <Text style={styles.ribbonAllProduct}>ALL PRODUCT</Text>
                </View>
              </View>

              {/* Woman Image Cutout */}
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?q=80&w=400' }}
                style={styles.bannerWomanImage}
                contentFit="contain"
                cachePolicy="disk"
              />
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
    backgroundColor: COLORS.mintBg,
  },
  scrollView: {
    flex: 1,
  },

  // ── Curved Green Header ────────────────────────────────────────────────────
  curvedHeader: {
    backgroundColor: COLORS.primaryGreen,
    paddingTop: Platform.OS === 'ios' ? 58 : 46,
    paddingBottom: 36, // Extra bottom padding so curved area shows under categories
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },

  // ── Search Bar ────────────────────────────────────────────────────────────
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 50,
    gap: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
    flex: 1,
  },

  // ── Cart Button ───────────────────────────────────────────────────────────
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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

  // ── Location (inside green header) ────────────────────────────────────────
  locationContainer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 17,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Categories Carousel ────────────────────────────────────────────────────
  categoriesSection: {
    marginTop: -20, // Overlap up into the curved bottom of the green header
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  categoryScrollContainer: {
    // Total width = number of pages × SCREEN_WIDTH
  },
  categoryPage: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryRing: {
    width: CATEGORY_CIRCLE_SIZE + 10,
    height: CATEGORY_CIRCLE_SIZE + 10,
    borderRadius: (CATEGORY_CIRCLE_SIZE + 10) / 2,
    borderWidth: 2.5,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryImageWrapper: {
    width: CATEGORY_CIRCLE_SIZE,
    height: CATEGORY_CIRCLE_SIZE,
    borderRadius: CATEGORY_CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGreen,
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
    fontWeight: '600',
  },
  // Legacy list style (not used by carousel but kept for reference)
  categoryList: {
    paddingHorizontal: 16,
    gap: 16,
  },

  // ── Pagination Dots ────────────────────────────────────────────────────────
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryGreen,
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  bannerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: 4,
  },
  banner: {
    borderRadius: 22,
    paddingTop: 22,
    paddingBottom: 0,
    paddingLeft: 22,
    paddingRight: 0,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 168,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 22,
  },
  bannerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 2,
  },
  bannerDiscount: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  bannerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  bannerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerButton: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 9,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  bannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bannerRight: {
    width: 130,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    position: 'relative',
  },

  // ── Ribbon Tag (SVG-backed) ────────────────────────────────────────────────
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 10,
    alignItems: 'center',
  },
  ribbonTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  ribbonLabel: {
    fontSize: 6.5,
    fontWeight: '900',
    color: COLORS.red,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ribbonDivider: {
    width: 36,
    height: 1,
    backgroundColor: COLORS.red,
    marginVertical: 2,
    opacity: 0.5,
  },
  ribbonPercent: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.red,
    lineHeight: 19,
  },
  ribbonOff: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.red,
    letterSpacing: 0.3,
  },
  ribbonAllProduct: {
    fontSize: 5.5,
    fontWeight: '900',
    color: COLORS.red,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Banner Woman Image ─────────────────────────────────────────────────────
  bannerWomanImage: {
    width: 120,
    height: 160,
    marginBottom: 0,
    marginRight: 0,
  },

  // ── Unused old banner styles (kept so no ref errors) ──────────────────────
  bannerDiscountBadge: {
    display: 'none',
  },
  bannerDiscountBadgeLabel: {},
  bannerDiscountBadgePercent: {},
  bannerDiscountBadgeOff: {},
  bannerImagePlaceholder: {
    display: 'none',
  },
  bannerAllProducts: {
    display: 'none',
  },
  bannerAllProductsText: {},

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

