// packages/mobile/app/checkout/address.tsx
// Address selection and management screen — Premium Light Theme

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import type { Address } from '@bazaarbasket/shared';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddressScreen() {
  const userProfile = useAuthStore((s) => s.userProfile);
  const [showForm, setShowForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const addresses = userProfile?.addresses || [];

  const handleSelectAddress = useCallback((address: Address) => {
    setSelectedAddressId(address.id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address.');
      return;
    }
    router.push({
      pathname: '/checkout/slot',
      params: { addressId: selectedAddressId },
    });
  }, [selectedAddressId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Delivery Address</Text>
          <Text style={styles.subtitle}>Choose where to deliver your order</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Saved Addresses */}
        {addresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            style={[styles.addressCard, selectedAddressId === address.id && styles.addressCardSelected]}
            onPress={() => handleSelectAddress(address)}
            accessibilityLabel={`Select ${address.label} address`}
            activeOpacity={0.7}
          >
            <View style={styles.addressHeader}>
              <View style={styles.addressLabel}>
                <View style={[
                  styles.addressIconBg,
                  selectedAddressId === address.id && styles.addressIconBgSelected,
                ]}>
                  <Ionicons
                    name={address.label.toLowerCase() === 'home' ? 'home' : 'business'}
                    size={14}
                    color={selectedAddressId === address.id ? '#4CAF50' : '#64748B'}
                  />
                </View>
                <Text style={[styles.addressLabelText, selectedAddressId === address.id && styles.selectedText]}>
                  {address.label}
                </Text>
                {address.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
              </View>
              <View style={[styles.radio, selectedAddressId === address.id && styles.radioSelected]}>
                {selectedAddressId === address.id && <View style={styles.radioDot} />}
              </View>
            </View>
            <Text style={styles.addressName}>{address.fullName}</Text>
            <Text style={styles.addressLine}>{address.addressLine1}</Text>
            {address.addressLine2 ? <Text style={styles.addressLine}>{address.addressLine2}</Text> : null}
            <Text style={styles.addressLine}>{address.city}, {address.state} - {address.pincode}</Text>
            <Text style={styles.addressPhone}>📞 {address.phone}</Text>
          </TouchableOpacity>
        ))}

        {/* Add New Address */}
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => setShowForm(!showForm)}
          accessibilityLabel="Add new address"
          activeOpacity={0.7}
        >
          <View style={styles.addIconBg}>
            <Ionicons name="add" size={18} color="#4CAF50" />
          </View>
          <Text style={styles.addAddressText}>Add New Address</Text>
          <Ionicons name={showForm ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formContainer}>
            <TextInput style={styles.input} placeholder="Label (e.g., Home, Work)" placeholderTextColor="#94A3B8" value={formData.label} onChangeText={(text) => setFormData({ ...formData, label: text })} accessibilityLabel="Address label" />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94A3B8" value={formData.fullName} onChangeText={(text) => setFormData({ ...formData, fullName: text })} accessibilityLabel="Full name" />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#94A3B8" keyboardType="phone-pad" maxLength={10} value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} accessibilityLabel="Phone number" />
            <TextInput style={styles.input} placeholder="Address Line 1" placeholderTextColor="#94A3B8" value={formData.addressLine1} onChangeText={(text) => setFormData({ ...formData, addressLine1: text })} accessibilityLabel="Address line 1" />
            <TextInput style={styles.input} placeholder="Address Line 2 (Optional)" placeholderTextColor="#94A3B8" value={formData.addressLine2} onChangeText={(text) => setFormData({ ...formData, addressLine2: text })} accessibilityLabel="Address line 2" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="City" placeholderTextColor="#94A3B8" value={formData.city} onChangeText={(text) => setFormData({ ...formData, city: text })} accessibilityLabel="City" />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Pincode" placeholderTextColor="#94A3B8" keyboardType="number-pad" maxLength={6} value={formData.pincode} onChangeText={(text) => setFormData({ ...formData, pincode: text })} accessibilityLabel="Pincode" />
            </View>
            <TextInput style={styles.input} placeholder="Landmark (Optional)" placeholderTextColor="#94A3B8" value={formData.landmark} onChangeText={(text) => setFormData({ ...formData, landmark: text })} accessibilityLabel="Landmark" />
            <TouchableOpacity style={styles.saveAddressButton} accessibilityLabel="Save address" activeOpacity={0.85}>
              <LinearGradient colors={['#4CAF50', '#388E3C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                <Text style={styles.saveAddressText}>Save Address</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedAddressId && styles.continueDisabled]}
          onPress={handleContinue}
          disabled={!selectedAddressId}
          activeOpacity={0.85}
          accessibilityLabel="Continue to delivery slot"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={selectedAddressId ? ['#4CAF50', '#388E3C'] : ['#94A3B8', '#94A3B8']}
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
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  addressCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.1,
  },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addressLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressIconBgSelected: { backgroundColor: '#C8E6C9' },
  addressLabelText: { fontSize: 14, fontWeight: '700', color: '#000000' },
  selectedText: { color: '#388E3C' },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#4CAF50' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  addressName: { fontSize: 15, fontWeight: '600', color: '#000000', marginBottom: 4 },
  addressLine: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  addressPhone: { fontSize: 13, color: '#64748B', marginTop: 6 },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  addIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  addAddressText: { flex: 1, fontSize: 15, color: '#388E3C', fontWeight: '600' },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  saveAddressButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  saveAddressText: { fontSize: 15, fontWeight: '700', color: '#000000' },
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
  continueText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
