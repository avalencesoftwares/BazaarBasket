// src/components/screens/CategoryScreen.tsx
// Category page with subcategory chips, product grid, shimmer loading

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { AppHeader } from '../layout/AppHeader';
import { ProductCard } from '../common/ProductCard';
import { ShimmerCard } from '../common/ShimmerCard';
import { EmptyState } from '../common/EmptyState';

interface CategoryScreenProps {
  categoryId: string;
}

export function CategoryScreen({ categoryId }: CategoryScreenProps) {
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState('All');

  const category = CATEGORIES.find((c) => c.id === categoryId);

  useEffect(() => {
    setLoading(true);
    setSelectedSub('All');
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [categoryId]);

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    let products = PRODUCTS.filter((p) => p.categoryId === category.id);
    if (selectedSub !== 'All') {
      products = products.filter((p) => p.subcategory === selectedSub);
    }
    return products;
  }, [category, selectedSub]);

  if (!category) {
    return (
      <View className="flex-1 bg-gray-50">
        <AppHeader title="Category" />
        <EmptyState title="Category not found" description="This category doesn't exist." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <AppHeader title={category.name} rightAction="search" />

      {/* Subcategory Chips */}
      <View className="bg-white border-b border-gray-100 px-4 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {category.subcategories.map((sub) => (
            <TouchableOpacity
              key={sub}
              onPress={() => setSelectedSub(sub)}
              className={`px-4 py-2 rounded-full ${
                selectedSub === sub
                  ? 'bg-[#22c55e]'
                  : 'bg-gray-100'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedSub === sub ? 'text-white' : 'text-gray-600'
                }`}
              >
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={{ width: '48%' }}>
                <ShimmerCard />
              </View>
            ))}
          </View>
        ) : filteredProducts.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={{ width: '48%' }}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="search"
            title="No products found"
            description={`No products in "${selectedSub}" yet.`}
          />
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
