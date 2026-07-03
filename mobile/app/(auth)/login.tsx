// packages/mobile/app/(auth)/login.tsx
// Redesigned premium login screen with groceries artwork placed at the top above the login form

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BACKDROP_IMAGE = require('../../assets/grocery_background.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BRAND_LOGO = require('../../assets/brand_logo.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.38;

const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  lightGreen: '#E8F5E9',
  mintBg: '#FAF9F6',
  white: '#FFFFFF',
  textDark: '#1A1C1A',
  textSecondary: '#64748B',
  borderLight: '#E2E8F0',
};

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoScale, formOpacity, formTranslateY]);

  const handlePhoneLogin = useCallback(async () => {
    const cleaned = phoneNumber.replace(/\s/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: `+91${cleaned}` },
      });
    } catch (error) {
      logger.error('Failed to send OTP', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      Alert.alert('Google Sign-In', 'Google Sign-In will be configured with your Google credentials.');
    } catch (error) {
      logger.error('Google sign-in failed', error);
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Groceries Artwork Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={BACKDROP_IMAGE} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <LinearGradient
            colors={['rgba(26, 28, 26, 0.45)', 'rgba(26, 28, 26, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* New Premium Circular Brand Logo overlayed on the groceries background */}
          <Animated.View style={[styles.header, { transform: [{ scale: logoScale }] }]}>
            <Image source={BRAND_LOGO} style={styles.logoImage} />
            <Text style={styles.logoTitle}>BazaarBasket</Text>
          </Animated.View>

          {/* Curve overlap indicator */}
          <LinearGradient
            colors={['transparent', 'rgba(250, 249, 246, 0.8)', COLORS.mintBg]}
            style={styles.curveFade}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        {/* Clean Login Form Container */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={[styles.phoneInputContainer, isFocused && styles.phoneInputContainerFocused]}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter mobile number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              accessibilityLabel="Mobile phone number input"
            />
          </View>

          <TouchableOpacity
            style={[styles.otpButton, (isLoading || phoneNumber.length < 10) && styles.otpButtonDisabled]}
            onPress={handlePhoneLogin}
            disabled={isLoading || phoneNumber.length < 10}
            activeOpacity={0.85}
            accessibilityLabel="Send OTP button"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.otpButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.otpButtonText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.75}
            accessibilityLabel="Sign in with Google"
            accessibilityRole="button"
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mintBg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    zIndex: 10,
    marginTop: 20,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 30,
    color: COLORS.white,
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 1, height: 1.5 },
    textShadowRadius: 5,
    letterSpacing: 0.8,
  },
  curveFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 5,
  },
  formCard: {
    flex: 1,
    backgroundColor: COLORS.mintBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    marginTop: -20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  phoneInputContainerFocused: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: COLORS.borderLight,
  },
  countryCodeText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: COLORS.textDark,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  otpButton: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  otpButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  otpButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 28,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
});
