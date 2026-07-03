// packages/mobile/app/(tabs)/search.tsx
// Search screen with debounced search, filters, and recent searches — Premium Light Theme

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProducts, searchProducts, getCategories } from '../../services/productService';
import { formatCurrency, calculateDiscount } from '@bazaarbasket/shared';
import type { Product } from '@bazaarbasket/shared';
import { useCartStore } from '../../store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;
const RECENT_SEARCHES_KEY = 'bazaarbasket_recent_searches';
const DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const addItem = useCartStore((s) => s.addItem);

  // Load recent searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((data) => {
      if (data) {
        setRecentSearches(JSON.parse(data));
      }
    });
  }, []);

  // Debounce search
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText]);

  const productsQuery = useQuery({
    queryKey: ['products', 'search', debouncedSearch, categoryId],
    queryFn: () =>
      debouncedSearch
        ? searchProducts(debouncedSearch)
        : getProducts({ categoryId: categoryId || undefined }).then((r) => r.products),
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const saveSearch = useCallback(async (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    setDebouncedSearch('');
  }, []);

  const handleAddToCart = useCallback(async (productId: string) => {
    try {
      await addItem(productId, 1);
    } catch {
      // Error handled in store
    }
  }, [addItem]);

  const renderProduct = useCallback(({ item }: { item: Product }) => {
    const discount = calculateDiscount(item.mrp, item.price);
    const isOutOfStock = item.stock <= 0;

    return (
      <TouchableOpacity
        style={[styles.productCard, isOutOfStock && styles.productCardOutOfStock]}
        onPress={() => router.push(`/product/${item.id}`)}
        accessibilityLabel={`${item.name}, ${formatCurrency(item.price)}`}
        activeOpacity={0.7}
      >
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <View style={styles.productImageContainer}>
          {item.images.length > 0 ? (
            <Image source={{ uri: item.images[0].thumbnailUrl }} style={styles.productImage} contentFit="cover" cachePolicy="disk" />
          ) : (
            <View style={[styles.productImage, styles.productPlaceholder]}>
              <Ionicons name="image" size={28} color="#CBD5E1" />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productUnit}>{item.unit}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            {item.mrp > item.price && <Text style={styles.productMrp}>{formatCurrency(item.mrp)}</Text>}
          </View>
          {!isOutOfStock && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item.id)}
              activeOpacity={0.8}
              accessibilityLabel={`Add ${item.name}`}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleAddToCart]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Ionicons name="search" size={20} color={isFocused ? '#4CAF50' : '#94A3B8'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for groceries..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => searchText && saveSearch(searchText)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            accessibilityLabel="Search products"
          />
          {searchText ? (
            <TouchableOpacity onPress={clearSearch} accessibilityLabel="Clear search">
              <View style={styles.clearButton}>
                <Ionicons name="close" size={14} color="#64748B" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filter Chips */}
      {!searchText && (
        <FlatList
          data={categoriesQuery.data || []}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, categoryId === item.id && styles.chipActive]}
              onPress={() => router.setParams({ categoryId: categoryId === item.id ? '' : item.id })}
              accessibilityLabel={`Filter by ${item.name}`}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, categoryId === item.id && styles.chipTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Recent Searches */}
      {!searchText && !categoryId && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          {recentSearches.slice(0, 5).map((term) => (
            <TouchableOpacity key={term} style={styles.recentItem} onPress={() => setSearchText(term)} activeOpacity={0.6}>
              <View style={styles.recentIconBg}>
                <Ionicons name="time-outline" size={14} color="#94A3B8" />
              </View>
              <Text style={styles.recentText}>{term}</Text>
              <Ionicons name="arrow-forward" size={14} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {productsQuery.isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={productsQuery.data || []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={40} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>
                {searchText ? 'No products found' : 'Browse our catalog'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Try a different search term' : 'Use search or pick a category above'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 60 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12, backgroundColor: '#FFFFFF', paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '400' },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContainer: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#000000' },
  recentSection: { paddingHorizontal: 20, marginBottom: 16 },
  recentTitle: { fontSize: 14, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recentIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentText: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '400' },
  productList: { paddingHorizontal: 20, paddingBottom: 100 },
  productRow: { gap: 12, marginBottom: 12 },
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
  productCardOutOfStock: { opacity: 0.6 },
  discountBadge: { position: 'absolute', top: 8, left: 8, zIndex: 1, backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  productImageContainer: { width: '100%', height: PRODUCT_CARD_WIDTH * 0.8, backgroundColor: '#F8FAFC' },
  productImage: { width: '100%', height: '100%' },
  productPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 12 },
  productName: { fontSize: 13, fontWeight: '600', color: '#000000', marginBottom: 4, lineHeight: 18 },
  productUnit: { fontSize: 11, color: '#94A3B8', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#388E3C' },
  productMrp: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: { fontSize: 13, fontWeight: '700', color: '#000000', letterSpacing: 1 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8' },
  loader: { paddingVertical: 40 },
});
