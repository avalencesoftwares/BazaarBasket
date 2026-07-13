// packages/mobile/app/(tabs)/profile.tsx
// Profile screen with user info, addresses, and order history — Premium Light Theme

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/authService';
import { updateUserProfile } from '../../services/userService';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  bgColor?: string;
}

export default function ProfileScreen() {
  const { userProfile, isAuthenticated, firebaseUser } = useAuthStore();
  const fetchUserProfile = useAuthStore((s) => s.fetchUserProfile);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          try {
            await AsyncStorage.removeItem('bazaarbasket_onboarding_completed');
          } catch (e) {
            // ignore
          }
          router.replace('/');
        },
      },
    ]);
  }, []);

  const handleSaveName = useCallback(async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      await updateUserProfile({ displayName: nameInput.trim() });
      await fetchUserProfile();
      setIsEditingName(false);
      Alert.alert('Success', 'Profile name updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile name.');
    } finally {
      setIsUpdating(false);
    }
  }, [nameInput, fetchUserProfile]);

  if (!isAuthenticated) {
    return (
      <View style={styles.notLoggedIn}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.notLoggedInIcon}>
          <Ionicons name="person-circle-outline" size={72} color="#CBD5E1" />
        </View>
        <Text style={styles.notLoggedInTitle}>Not Logged In</Text>
        <Text style={styles.notLoggedInSubtitle}>Sign in to view your profile and orders</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signInGradient}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems: MenuItem[] = [
    { icon: 'receipt-outline', label: 'My Orders', subtitle: 'Track and manage orders', onPress: () => router.push('/order/history'), color: '#3B82F6', bgColor: '#EFF6FF' },
    { icon: 'location-outline', label: 'Saved Addresses', subtitle: 'Manage delivery addresses', onPress: () => router.push('/checkout/address'), color: '#4CAF50', bgColor: '#E8F5E9' },
    { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQ and contact us', onPress: () => Alert.alert('Coming Soon'), color: '#06B6D4', bgColor: '#ECFEFF' },
    { icon: 'information-circle-outline', label: 'About BazaarBasket', subtitle: 'Version 1.0.0', onPress: () => Alert.alert('BazaarBasket v1.0.0'), color: '#64748B', bgColor: '#F8FAFC' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#ecfdf5', '#d1fae5']}
          style={styles.profileCardBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(userProfile?.displayName || firebaseUser?.displayName || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={30}
              autoFocus
              accessibilityLabel="Edit display name"
            />
          ) : (
            <Text style={styles.profileName}>
              {userProfile?.displayName || firebaseUser?.displayName || 'User'}
            </Text>
          )}
          <Text style={styles.profilePhone}>
            {userProfile?.phone || firebaseUser?.phoneNumber || ''}
          </Text>
          {userProfile?.email ? (
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          ) : null}
        </View>

        {isUpdating ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : isEditingName ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleSaveName}
              style={styles.editActionBtn}
              accessibilityLabel="Save name"
            >
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditingName(false)}
              style={styles.editActionBtn}
              accessibilityLabel="Cancel editing"
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setNameInput(userProfile?.displayName || firebaseUser?.displayName || '');
              setIsEditingName(true);
            }}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={20} color={item.color || '#94A3B8'} />
              </View>
              <View>
                <Text style={styles.menuItemText}>{item.label}</Text>
                {item.subtitle && <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityLabel="Sign Out"
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>BazaarBasket v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingTop: 60, paddingBottom: 100 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    gap: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileCardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 3 },
  profilePhone: { fontSize: 14, color: '#64748B' },
  profileEmail: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  nameInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    borderBottomWidth: 1.5,
    borderBottomColor: '#4CAF50',
    paddingVertical: 2,
    marginBottom: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editActionBtn: {
    padding: 4,
  },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: { fontSize: 15, color: '#000000', fontWeight: '600' },
  menuItemSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  versionText: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 24 },
  notLoggedIn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notLoggedInTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  notLoggedInSubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  signInButton: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  signInGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  signInButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
