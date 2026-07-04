// src/components/screens/CheckoutScreen.tsx
// 3-step checkout: Address → Slot → Confirmation

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MOCK_ADDRESSES,
  DELIVERY_SLOTS,
  VALID_PINCODES,
  type MockAddress,
} from '../../data/mockData';
import { SlotChip } from '../common/SlotChip';

type Step = 'address' | 'slot' | 'confirm';

export function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESSES[0]?.id || '');
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullAddress: '',
    landmark: '',
    pincode: '',
    label: 'Home' as MockAddress['label'],
  });
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [orderId] = useState(`ORD-${10050 + Math.floor(Math.random() * 100)}`);
  const [isPlacing, setIsPlacing] = useState(false);

  // Mock totals
  const grandTotal = 381;
  const totalItems = 3;

  const dates = useMemo(() => {
    const seen = new Set<string>();
    return DELIVERY_SLOTS.filter((s) => {
      if (seen.has(s.date)) return false;
      seen.add(s.date);
      return true;
    }).map((s) => ({ date: s.date, label: s.dateLabel }));
  }, []);

  const slotsForDate = useMemo(() => {
    if (!dates[selectedDate]) return [];
    return DELIVERY_SLOTS.filter((s) => s.date === dates[selectedDate].date);
  }, [selectedDate, dates]);

  const selectedSlotData = DELIVERY_SLOTS.find((s) => s.id === selectedSlot);

  const stepIndex = step === 'address' ? 0 : step === 'slot' ? 1 : 2;

  const handleContinueToSlot = () => {
    if (showNewAddr) {
      if (!newAddr.fullAddress.trim() || !newAddr.pincode.trim()) {
        Alert.alert('Error', 'Please fill in address and pincode');
        return;
      }
      if (!VALID_PINCODES.includes(newAddr.pincode)) {
        Alert.alert('Error', "Sorry, we don't deliver to this location yet.");
        return;
      }
    }
    setStep('slot');
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsPlacing(false);
    setStep('confirm');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center h-14 px-4">
          {step !== 'confirm' && (
            <TouchableOpacity
              onPress={() => (step === 'address' ? router.back() : setStep('address'))}
              className="w-10 h-10 items-center justify-center rounded-full mr-1"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </TouchableOpacity>
          )}
          <Text className="flex-1 text-base font-bold text-gray-900 text-center pr-10">
            Checkout
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="flex-row items-center px-6 pb-3 gap-1">
          {['Address', 'Slot', 'Confirm'].map((_, i) => (
            <View key={i} className="flex-1 flex-row items-center gap-1">
              <View
                className={`flex-1 h-1 rounded-full ${
                  i <= stepIndex ? 'bg-[#22c55e]' : 'bg-gray-200'
                }`}
              />
            </View>
          ))}
        </View>
        <View className="flex-row px-6 pb-2">
          {['Address', 'Slot', 'Confirm'].map((label, i) => (
            <Text
              key={label}
              className={`flex-1 text-center text-[10px] font-medium ${
                i <= stepIndex ? 'text-[#22c55e]' : 'text-gray-400'
              }`}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* Step 1: Address */}
      {step === 'address' && (
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="location" size={18} color="#22c55e" />
            <Text className="text-base font-bold text-gray-900">Select Delivery Address</Text>
          </View>

          <View className="gap-2 mb-4">
            {MOCK_ADDRESSES.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                onPress={() => {
                  setSelectedAddress(addr.id);
                  setShowNewAddr(false);
                }}
                className={`p-4 rounded-xl border-2 ${
                  selectedAddress === addr.id && !showNewAddr
                    ? 'border-[#22c55e] bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2 mb-1.5">
                  <Ionicons
                    name={addr.label === 'Home' ? 'home' : 'briefcase'}
                    size={14}
                    color={addr.label === 'Home' ? '#22c55e' : '#3B82F6'}
                  />
                  <Text className="text-sm font-semibold text-gray-800">{addr.label}</Text>
                </View>
                <Text className="text-sm text-gray-600 leading-relaxed">{addr.fullAddress}</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {addr.landmark} • {addr.pincode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Address */}
          <TouchableOpacity
            onPress={() => setShowNewAddr(!showNewAddr)}
            className="flex-row items-center gap-2 p-3 border-2 border-dashed border-[#22c55e]/30 rounded-xl mb-4"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#22c55e" />
            <Text className="text-sm font-semibold text-[#22c55e]">Add New Address</Text>
          </TouchableOpacity>

          {showNewAddr && (
            <View className="bg-white rounded-xl border border-gray-200 p-4 gap-3 mb-4">
              <TextInput
                placeholder="Full address"
                placeholderTextColor="#9CA3AF"
                value={newAddr.fullAddress}
                onChangeText={(t) => setNewAddr({ ...newAddr, fullAddress: t })}
                className="h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              />
              <TextInput
                placeholder="Landmark (optional)"
                placeholderTextColor="#9CA3AF"
                value={newAddr.landmark}
                onChangeText={(t) => setNewAddr({ ...newAddr, landmark: t })}
                className="h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              />
              <TextInput
                placeholder="Pincode"
                placeholderTextColor="#9CA3AF"
                value={newAddr.pincode}
                onChangeText={(t) =>
                  setNewAddr({ ...newAddr, pincode: t.replace(/\D/g, '').slice(0, 6) })
                }
                keyboardType="number-pad"
                maxLength={6}
                className="h-11 px-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              />
              <View className="flex-row gap-2">
                {(['Home', 'Work', 'Other'] as const).map((label) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setNewAddr({ ...newAddr, label })}
                    className={`flex-1 py-2 rounded-lg border-2 items-center ${
                      newAddr.label === label
                        ? 'border-[#22c55e] bg-green-50'
                        : 'border-gray-200'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        newAddr.label === label ? 'text-[#22c55e]' : 'text-gray-500'
                      }`}
                    >
                      {label === 'Home' ? '🏠' : label === 'Work' ? '💼' : '📍'} {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Step 2: Slot Selection */}
      {step === 'slot' && (
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="time" size={18} color="#22c55e" />
            <Text className="text-base font-bold text-gray-900">Choose Delivery Slot</Text>
          </View>

          {/* Date Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            className="mb-4"
          >
            {dates.map((d, i) => (
              <TouchableOpacity
                key={d.date}
                onPress={() => {
                  setSelectedDate(i);
                  setSelectedSlot(null);
                }}
                className={`px-4 py-2.5 rounded-xl items-center ${
                  selectedDate === i
                    ? 'bg-[#22c55e]'
                    : 'bg-white border border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selectedDate === i ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time Slots */}
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {slotsForDate.map((slot) => (
              <View key={slot.id} style={{ width: '48%' }}>
                <SlotChip
                  slot={slot}
                  selected={selectedSlot === slot.id}
                  onPress={() => setSelectedSlot(slot.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingTop: 64, paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* Animated Checkmark */}
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</Text>
          <Text className="text-sm text-gray-500 mb-6 text-center max-w-[280px]">
            Your order has been placed successfully and will be delivered soon.
          </Text>

          <View className="bg-white rounded-xl border border-gray-200 p-4 w-full mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Order ID</Text>
              <Text className="text-sm font-bold text-gray-800">{orderId}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Items</Text>
              <Text className="text-sm font-medium text-gray-700">{totalItems} items</Text>
            </View>
            {selectedSlotData && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Delivery Slot</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {selectedSlotData.dateLabel}, {selectedSlotData.timeWindow}
                </Text>
              </View>
            )}
          </View>

          <View className="w-full gap-2.5">
            <TouchableOpacity
              onPress={() => router.push('/order/history')}
              className="w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="w-full h-12 rounded-xl border border-gray-300 items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-gray-700">Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom for Steps 1 & 2 */}
      {step === 'address' && (
        <View
          className="absolute left-0 right-0 bg-white border-t border-gray-100 px-4"
          style={{ bottom: 0, paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          <TouchableOpacity
            onPress={handleContinueToSlot}
            className="w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center"
            activeOpacity={0.8}
            style={{ elevation: 4 }}
          >
            <Text className="text-white text-base font-semibold">Continue to Slot Selection</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'slot' && (
        <View
          className="absolute left-0 right-0 bg-white border-t border-gray-100 px-4"
          style={{ bottom: 0, paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={!selectedSlot || isPlacing}
            className={`w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center ${
              !selectedSlot || isPlacing ? 'opacity-50' : ''
            }`}
            activeOpacity={0.8}
            style={{ elevation: selectedSlot ? 4 : 0 }}
          >
            {isPlacing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Place Order (COD) — ₹{grandTotal}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
