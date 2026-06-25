// packages/mobile/app/checkout/slot.tsx
// Delivery slot picker screen — Premium Light Theme

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getNextNDays, DEFAULT_DELIVERY_SLOTS } from '@bazaarbasket/shared';
import { LinearGradient } from 'expo-linear-gradient';

export default function SlotPickerScreen() {
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const days = getNextNDays(7);
  const [selectedDate, setSelectedDate] = useState(days[0]?.date || '');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleContinue = useCallback(() => {
    if (!selectedDate || !selectedSlot) {
      return;
    }

    const slot = DEFAULT_DELIVERY_SLOTS.find((s) => s.id === selectedSlot);
    const day = days.find((d) => d.date === selectedDate);

    router.push({
      pathname: '/checkout/confirm',
      params: {
        addressId,
        slotDate: selectedDate,
        slotStartTime: slot?.startTime || '',
        slotEndTime: slot?.endTime || '',
        slotLabel: `${day?.label || selectedDate}, ${slot?.label || ''} (${slot?.startTime} - ${slot?.endTime})`,
      },
    });
  }, [addressId, selectedDate, selectedSlot, days]);

  const getSlotIcon = (slotId: string): keyof typeof Ionicons.glyphMap => {
    switch (slotId) {
      case 'morning': return 'sunny';
      case 'afternoon': return 'partly-sunny';
      case 'evening': return 'cloudy';
      default: return 'moon';
    }
  };

  const getSlotColor = (slotId: string): string => {
    switch (slotId) {
      case 'morning': return '#F59E0B';
      case 'afternoon': return '#F97316';
      case 'evening': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Choose Delivery Slot</Text>
          <Text style={styles.subtitle}>When would you like your order delivered?</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Picker */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Select Date</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.date}
              style={[styles.dateCard, selectedDate === day.date && styles.dateCardSelected]}
              onPress={() => setSelectedDate(day.date)}
              accessibilityLabel={`Select ${day.label}`}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayName, selectedDate === day.date && styles.selectedDateText]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dayLabel, selectedDate === day.date && styles.selectedDateText]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Slots */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
        </View>
        <View style={styles.slotGrid}>
          {DEFAULT_DELIVERY_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            const iconColor = isSelected ? getSlotColor(slot.id) : '#94A3B8';
            return (
              <TouchableOpacity
                key={slot.id}
                style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                onPress={() => setSelectedSlot(slot.id)}
                accessibilityLabel={`Select ${slot.label} slot`}
                activeOpacity={0.7}
              >
                {/* eslint-disable-next-line react-native/no-inline-styles */}
                <View style={[styles.slotIconBg, { backgroundColor: isSelected ? `${getSlotColor(slot.id)}15` : '#F8FAFC' }]}>
                  <Ionicons name={getSlotIcon(slot.id)} size={22} color={iconColor} />
                </View>
                <Text style={[styles.slotLabel, isSelected && styles.selectedSlotText]}>
                  {slot.label}
                </Text>
                <Text style={[styles.slotTime, isSelected && styles.selectedSlotTimeDim]}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, (!selectedDate || !selectedSlot) && styles.continueDisabled]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedSlot}
          activeOpacity={0.85}
          accessibilityLabel="Continue to order confirmation"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={selectedDate && selectedSlot ? ['#4CAF50', '#388E3C'] : ['#94A3B8', '#94A3B8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 8 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#4CAF50' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  dateRow: { gap: 10, marginBottom: 28 },
  dateCard: {
    width: 90,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dateCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.12,
    elevation: 3,
  },
  dayName: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  dayLabel: { fontSize: 14, color: '#000000', fontWeight: '700' },
  selectedDateText: { color: '#388E3C' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  slotCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  slotIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotLabel: { fontSize: 15, fontWeight: '700', color: '#000000' },
  slotTime: { fontSize: 12, color: '#94A3B8' },
  selectedSlotText: { color: '#000000' },
  selectedSlotTimeDim: { color: '#388E3C' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueDisabled: { shadowOpacity: 0, elevation: 0 },
  continueGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 14,
  },
  continueText: { fontSize: 16, fontWeight: '700', color: '#000000' },
});
