// packages/mobile/app/(tabs)/categories.tsx
// Full-page categories grid screen — Green theme matching app design

import { useState, useCallback } from 'react';
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
import { getCategories } from '../../services/productService';
import type { Category } from '@bazaarbasket/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 16;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

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
};

function CategoryCard({ category }: { category: Category }) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
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
            <Ionicons name="grid" size={28} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
      {category.productCount > 0 && (
        <Text style={styles.categoryCount}>
          {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function CategoriesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await categoriesQuery.refetch();
    setRefreshing(false);
  }, [categoriesQuery]);

  const categories = categoriesQuery.data || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSubtitle}>Browse all categories</Text>
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
        {categoriesQuery.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            <Text style={styles.loaderText}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={56} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtitle}>
              Categories will appear here once added by the store admin.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
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
    paddingHorizontal: HORIZONTAL_PADDING,
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
    paddingHorizontal: HORIZONTAL_PADDING,
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
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primaryGreen + '30',
    marginBottom: 10,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 100,
  },
});
