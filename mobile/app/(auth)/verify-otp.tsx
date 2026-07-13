// packages/mobile/app/(auth)/verify-otp.tsx
// Redesigned premium verify OTP screen with 4-digit test code (1234) mapping to unique email/password accounts

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../../utils/logger';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { setTempPhone } from '../../services/authHelper';

const OTP_LENGTH = 4;

export default function VerifyOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const otpOpacity = useRef(new Animated.Value(0)).current;
  const inputAnimations = useRef(
    Array(OTP_LENGTH).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Timer countdown
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(otpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(80, inputAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, [headerOpacity, headerTranslateY, otpOpacity, inputAnimations]);

  const handleVerify = useCallback(
    async (otpCode: string) => {
      setIsVerifying(true);
      try {
        if (otpCode === '1234') {
          logger.info('OTP login bypass activated', { phone });
          setTempPhone(phone);

          // Construct unique email identifier based on clean phone number format
          const cleanedPhone = phone.replace(/[^a-zA-Z0-9]/g, '');
          const email = `phone_${cleanedPhone}@bazaarbasket.local`;
          const password = 'test_otp_password';

          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (signInErr: any) {
            if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
              // Register new unique user if they don't exist in Firebase yet
              await createUserWithEmailAndPassword(auth, email, password);
            } else {
              throw signInErr;
            }
          }

          router.replace('/(tabs)');
          return;
        }

        // For testing purpose, display verification failure on invalid codes
        Alert.alert('Verification Failed', 'Invalid OTP. For testing, please use 1234.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } catch (error: any) {
        logger.error('OTP verification failed', error);
        Alert.alert('Verification Failed', error.message || 'Failed to authenticate. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    },
    [phone],
  );

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-advance to next input
      if (text && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all digits are entered
      if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === OTP_LENGTH) {
        handleVerify(newOtp.join(''));
      }
    },
    [otp, handleVerify],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    },
    [otp],
  );

  const handleResend = useCallback(() => {
    if (resendTimer > 0) {
      return;
    }
    setResendTimer(30);
    logger.info('Resending OTP', { phone });
    Alert.alert('OTP Sent', `A new OTP has been sent to ${phone}`);
  }, [resendTimer, phone]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Decorative gradient */}
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#FFFFFF']}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#1E293B" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>Verify Phone</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{'\n'}
          <Text style={styles.phoneHighlight}>{phone}</Text>
        </Text>
      </Animated.View>

      <Animated.View style={[styles.otpContainer, { opacity: otpOpacity }]}>
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [
                {
                  scale: inputAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }}
          >
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                otp[index] ? styles.otpInputFilled : null,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={otp[index]}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          </Animated.View>
        ))}
      </Animated.View>

      {isVerifying && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      )}

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResend}
        disabled={resendTimer > 0}
        accessibilityLabel="Resend OTP"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.resendText,
            resendTimer > 0 && styles.resendTextDisabled,
          ]}
        >
          {resendTimer > 0
            ? `Resend OTP in ${resendTimer}s`
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneHighlight: {
    color: '#388E3C',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  otpInput: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  otpInputFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  loader: {
    marginBottom: 24,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 15,
    color: '#388E3C',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
});
