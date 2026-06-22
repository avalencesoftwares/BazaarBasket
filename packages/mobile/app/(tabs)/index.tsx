// packages/mobile/app/(tabs)/index.tsx
// Home screen — categories, featured products, banners — Premium Light Theme

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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { getCategories, getProducts } from '../../services/productService';
import { getStoreSettings } from '../../services/settingsService';
import { formatCurrency, calculateDiscount } from '@bazaarbasket/shared';
import type { Product, Category } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

function CategoryItem({ category }: { category: Category }) {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/(tabs)/search?categoryId=${category.id}`)}
      accessibilityLabel={`Browse ${category.name}`}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
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
            <Ionicons name="grid" size={24} color="#94A3B8" />
          </View>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const discount = calculateDiscount(product.mrp, product.price);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) { return; }
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
    } catch {
      // Error handled in store
    } finally {
      setIsAdding(false);
    }
  }, [product.id, isOutOfStock, addItem]);

  return (
    <TouchableOpacity
      style={[styles.productCard, isOutOfStock && styles.productCardOutOfStock]}
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}`}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}

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
            <Ionicons name="image" size={32} color="#CBD5E1" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productUnit}>{product.unit}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          {product.mrp > product.price && (
            <Text style={styles.productMrp}>{formatCurrency(product.mrp)}</Text>
          )}
        </View>

        {isOutOfStock ? (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>ADD</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00B7B5"
          colors={['#00B7B5']}
        />
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.appName}>BazaarBasket 🧺</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#00B7B5', '#00A19F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{settingsQuery.data?.bannerTitle || 'Fresh Groceries'}</Text>
            <Text style={styles.bannerSubtitle}>{settingsQuery.data?.bannerSubtitle || 'Delivered in minutes'}</Text>
            <View style={styles.bannerOfferContainer}>
              <Text style={styles.bannerOffer}>{settingsQuery.data?.bannerOffer || 'Free delivery on orders above ₹499'}</Text>
            </View>
          </View>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="basket" size={72} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          </View>
        </View>
        {categoriesQuery.isLoading ? (
          <ActivityIndicator size="small" color="#00B7B5" style={styles.loader} />
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

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Featured Products</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            accessibilityLabel="View all products"
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {productsQuery.isLoading ? (
          <ActivityIndicator size="large" color="#00B7B5" style={styles.loader} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    borderRadius: 18,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#00B7B5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  bannerOfferContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  bannerOffer: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bannerIconContainer: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#00B7B5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00A19F',
    fontWeight: '600',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryImageWrapper: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  categoryName: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productCardOutOfStock: {
    opacity: 0.6,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productImageContainer: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH * 0.8,
    backgroundColor: '#F8FAFC',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 18,
  },
  productUnit: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00A19F',
  },
  productMrp: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#00B7B5',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#00B7B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  outOfStockButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  loader: {
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
