// src/components/screens/ProfileScreen.tsx
// Profile screen with user card, addresses sheet, about, logout

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ADDRESSES } from '../../data/mockData';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [addressesVisible, setAddressesVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  // Mock user data
  const user = {
    name: 'Dev User',
    phone: '9876543210',
  };
  const maskedPhone = `XXXXXX${user.phone.slice(-4)}`;

  const handleLogout = () => {
    Alert.alert('Logout?', 'Are you sure you want to logout from BazaarBasket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center h-14 px-4">
          <Text className="text-base font-bold text-gray-900">Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View
          className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5 flex-row items-center gap-4"
          style={{ elevation: 1 }}
        >
          <View className="w-14 h-14 rounded-full bg-[#22c55e] items-center justify-center">
            <Text className="text-xl font-bold text-white">
              {user.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="text-base font-bold text-gray-900">{user.name}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="call-outline" size={12} color="#6B7280" />
              <Text className="text-sm text-gray-500">+91 {maskedPhone}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View
          className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ elevation: 1 }}
        >
          {/* My Addresses */}
          <TouchableOpacity
            onPress={() => setAddressesVisible(true)}
            className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-green-50 items-center justify-center">
                <Ionicons name="location" size={18} color="#22c55e" />
              </View>
              <Text className="text-sm font-medium text-gray-800">My Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Support */}
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+919876543210')}
            className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-blue-50 items-center justify-center">
                <Ionicons name="call" size={18} color="#3B82F6" />
              </View>
              <Text className="text-sm font-medium text-gray-800">Support (Call Store)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            onPress={() => setAboutVisible(true)}
            className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-purple-50 items-center justify-center">
                <Ionicons name="information-circle" size={18} color="#8B5CF6" />
              </View>
              <Text className="text-sm font-medium text-gray-800">About</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between px-5 py-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center">
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              </View>
              <Text className="text-sm font-medium text-red-500">Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Addresses Bottom Sheet Modal */}
      <Modal
        visible={addressesVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddressesVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setAddressesVisible(false)}
        >
          <View className="flex-1" />
        </TouchableOpacity>
        <View className="bg-white rounded-t-2xl px-5 pt-6 pb-8" style={{ maxHeight: '70%' }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Saved Addresses</Text>
            <TouchableOpacity
              onPress={() => setAddressesVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-3 pb-6">
              {MOCK_ADDRESSES.map((addr) => (
                <View key={addr.id} className="bg-gray-50 rounded-xl p-4">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Text className="text-sm font-semibold text-gray-800">
                      {addr.label === 'Home' ? '🏠' : '💼'} {addr.label}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">{addr.fullAddress}</Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {addr.landmark} • {addr.pincode}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* About Bottom Sheet Modal */}
      <Modal
        visible={aboutVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAboutVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setAboutVisible(false)}
        >
          <View className="flex-1" />
        </TouchableOpacity>
        <View className="bg-white rounded-t-2xl px-5 pt-6 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">About BazaarBasket</Text>
            <TouchableOpacity
              onPress={() => setAboutVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="items-center pb-6">
            <Text className="text-4xl mb-3">🛒</Text>
            <Text className="text-lg font-bold text-gray-900 mb-1">BazaarBasket</Text>
            <Text className="text-sm text-gray-500 mb-2">Version 1.0.0</Text>
            <Text className="text-sm text-gray-500 text-center max-w-[280px]">
              Your local Kirana store, now delivered to your doorstep within 10km. Fresh groceries,
              quick delivery, cash on delivery.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
