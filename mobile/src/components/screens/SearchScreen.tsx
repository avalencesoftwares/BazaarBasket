// src/components/screens/SearchScreen.tsx
// Debounced search, recent searches, popular categories, results grid

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';
import { EmptyState } from '../common/EmptyState';

const RECENT_KEY = 'bazaarbasket_recent_searches';

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((data) => {
      if (data) {
        try {
          setRecentSearches(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const saveSearch = useCallback(
    async (term: string) => {
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 8);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches]
  );

  const clearRecent = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Input */}
      <View
        className="bg-white border-b border-gray-100 px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="relative">
          <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
            <Ionicons name="search" size={18} color="#9CA3AF" />
          </View>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search for products, brands..."
            placeholderTextColor="#9CA3AF"
            className="w-full h-11 pl-10 pr-10 bg-gray-100 rounded-xl text-sm"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim()) saveSearch(query.trim());
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              className="absolute right-3 top-0 bottom-0 justify-center"
              activeOpacity={0.7}
            >
              <View className="w-6 h-6 rounded-full bg-gray-300 items-center justify-center">
                <Ionicons name="close" size={12} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {!debouncedQuery.trim() ? (
          /* Before typing: Recent + Popular */
          <>
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text className="text-sm font-semibold text-gray-700">
                      Recent Searches
                    </Text>
                  </View>
                  <TouchableOpacity onPress={clearRecent} activeOpacity={0.7}>
                    <Text className="text-xs text-gray-400">Clear</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <TouchableOpacity
                      key={term}
                      onPress={() => setQuery(term)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full"
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs text-gray-600">{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View>
              <View className="flex-row items-center gap-1.5 mb-3">
                <Ionicons name="trending-up" size={14} color="#22c55e" />
                <Text className="text-sm font-semibold text-gray-700">
                  Popular Categories
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() =>
                      router.push(`/(tabs)/search?categoryId=${cat.id}`)
                    }
                    className="flex-row items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    activeOpacity={0.7}
                  >
                    <Text>{cat.emoji}</Text>
                    <Text className="text-xs text-gray-600">{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : results.length > 0 ? (
          /* Results */
          <>
            <Text className="text-xs text-gray-400 mb-3">
              {results.length} results for "{debouncedQuery}"
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {results.map((product) => (
                <View key={product.id} style={{ width: '48%' }}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </>
        ) : (
          /* No results */
          <EmptyState
            icon="search"
            title="No results found"
            description={`We couldn't find anything for "${debouncedQuery}". Try a different search.`}
          />
        )}

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
