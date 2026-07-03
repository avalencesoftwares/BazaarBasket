// packages/mobile/app/index.tsx
// Onboarding / Welcome Splash screen - Premium Light Theme

import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generated brand logo and illustration
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BRAND_LOGO = require('../assets/brand_logo.png');
const RIDER_ILLUSTRATION_URL = 'https://lh3.googleusercontent.com/aida/AP1WRLslq7aSBopuHACYhV6Ap1T9Pr229yDbZzDC7yGQbAPz2C0e0_x7lfqmUdKsrldnoXFkUNMepZ-_NDohn1yhzW6_Flm51LlVWvDO1orJe5ye99PRbgW-kkpcyqKdS8RI6yXHcHC7cm-Io_hSXyuf_kbsLRlm4vMPBkHZWe5BufCaAniZ9FdB44qIfbLz7GQqeX724RpcxX9SCUuLLiAm0CziuCQKSnh9jt4lmGaucSVcgvh2KEZOQgn92g';

const COLORS = {
  primaryGreen: '#4CAF50',
  darkGreen: '#388E3C',
  lightGreen: '#E8F5E9',
  mintBg: '#F1F8F3',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textSecondary: '#64748B',
  accentOrange: '#FFA726',
};

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [swipeTriggered, setSwipeTriggered] = useState(false);

  // Auto-redirect or check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('bazaarbasket_onboarding_completed');
        if (completed === 'true' && !isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          setCheckingOnboarding(false);
        }
      } catch (err) {
        setCheckingOnboarding(false);
      }
    };

    if (!authLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        checkOnboardingStatus();
      }
    }
  }, [isAuthenticated, authLoading]);

  // Swipe Action Dimensions
  const trackWidth = SCREEN_WIDTH - 48;
  const handleWidth = 56;
  const maxDrag = trackWidth - handleWidth - 8;
  const swipeX = useRef(new Animated.Value(0)).current;

  // Handle successful navigation
  const handleProceed = async () => {
    setSwipeTriggered(true);
    try {
      await AsyncStorage.setItem('bazaarbasket_onboarding_completed', 'true');
    } catch (e) {
      // ignore
    }
    router.replace('/(tabs)');
  };

  // Draggable slider logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (swipeTriggered) return;
        const newX = Math.max(0, Math.min(gestureState.dx, maxDrag));
        swipeX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (swipeTriggered) return;
        if (gestureState.dx > maxDrag * 0.7) {
          Animated.timing(swipeX, {
            toValue: maxDrag,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            handleProceed();
          });
        } else {
          Animated.spring(swipeX, {
            toValue: 0,
            tension: 40,
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Double arrow chevron animation
  const animValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animValue]);

  const chevronTranslate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 6],
  });

  if (authLoading || checkingOnboarding) {
    return <View style={[styles.container, { backgroundColor: COLORS.mintBg }]} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.mintBg} />

      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.brandContainer}>
            <Image source={BRAND_LOGO} style={styles.logoImage} />
            <Text style={styles.brandName}>BazaarBasket</Text>
          </View>
          <TouchableOpacity style={styles.marketPill} activeOpacity={0.8} onPress={handleProceed}>
            <Text style={styles.marketPillText}>Groceries</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Illustration Section */}
      <View style={styles.illustrationContainer}>
        <Image
          source={{ uri: RIDER_ILLUSTRATION_URL }}
          style={styles.illustration}
          contentFit="contain"
          cachePolicy="disk"
        />
      </View>

      {/* Titles and Copy */}
      <View style={styles.content}>
        <Text style={styles.headline}>
          Swift Grocery{'\n'}Service in Minutes
        </Text>
        <Text style={styles.subtitle}>
          We ensure your orders arrive faster than you thought possible.
        </Text>
      </View>

      {/* Stats Panel Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsTextColumn}>
          <Text style={styles.statsTitle}>400k+</Text>
          <Text style={styles.statsSubtitle}>Active Clients</Text>
        </View>
        <TouchableOpacity style={styles.statsArrowBtn} activeOpacity={0.85} onPress={handleProceed}>
          <Ionicons name="arrow-forward" size={24} color={COLORS.primaryGreen} style={styles.diagonalArrow} />
        </TouchableOpacity>
      </View>

      {/* Bottom Interactive Swipe Slider Container */}
      <View style={styles.footer}>
        <View style={styles.sliderTrack}>
          <Animated.View
            style={[
              styles.sliderHandle,
              { transform: [{ translateX: swipeX }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderCircle}>
              <Ionicons name="checkmark" size={24} color={COLORS.primaryGreen} />
            </View>
          </Animated.View>
          <View style={styles.sliderTextContainer} pointerEvents="none">
            <Text style={styles.sliderText}>Groceries Market</Text>
            <Animated.View style={{ transform: [{ translateX: chevronTranslate }] }}>
              <Ionicons name="chevron-forward-outline" size={16} color={COLORS.white} style={styles.chevrons} />
            </Animated.View>
          </View>
        </View>

        {/* Navigation Link to Login Screen */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkHighlight}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mintBg,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: COLORS.darkGreen,
    letterSpacing: 0.2,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  marketPill: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  marketPillText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  illustrationContainer: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: SCREEN_WIDTH * 0.72,
  },
  content: {
    marginBottom: 20,
  },
  headline: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 34,
    color: COLORS.darkGreen,
    lineHeight: 42,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  statsTextColumn: {
    flexDirection: 'column',
  },
  statsTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 44,
  },
  statsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 2,
  },
  statsArrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  diagonalArrow: {
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    paddingBottom: 40,
  },
  sliderTrack: {
    height: 64,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 32,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  sliderHandle: {
    position: 'absolute',
    left: 4,
    zIndex: 10,
  },
  sliderCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  sliderTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  sliderText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  chevrons: {
    marginTop: 1,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 18,
  },
  loginLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLinkHighlight: {
    color: COLORS.darkGreen,
    fontWeight: '700',
  },
});
