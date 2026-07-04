// src/components/screens/LoginScreen.tsx
// Phone OTP login screen with green gradient header

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OTPInput } from '../common/OTPInput';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = useCallback(async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }
    setIsLoading(true);
    setError(null);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setOtpSent(true);
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phone]);

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1000));
    if (otp === '123456') {
      setIsLoading(false);
      // Navigate to home on success
      router.replace('/(tabs)');
    } else {
      setIsLoading(false);
      setError('Invalid OTP. Please try again.');
    }
  }, [otp]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Gradient Section */}
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 40,
            paddingBottom: 48,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          {/* Decorative circles */}
          <View
            className="absolute bg-white/10 rounded-full"
            style={{ width: 128, height: 128, top: -32, right: -32 }}
          />
          <View
            className="absolute bg-white/5 rounded-full"
            style={{ width: 80, height: 80, top: 80, left: -16 }}
          />

          <View className="items-center relative z-10">
            <View
              className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4"
              style={{ elevation: 4 }}
            >
              <Ionicons name="basket" size={40} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-white mb-1">BazaarBasket</Text>
            <Text className="text-white/80 text-sm">Fresh groceries at your doorstep</Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="flex-1 px-6 pt-8 pb-6">
          {!otpSent ? (
            /* Phase 1: Phone Input */
            <>
              <Text className="text-xl font-bold text-gray-900 mb-1">Welcome!</Text>
              <Text className="text-sm text-gray-500 mb-8">
                Enter your phone number to continue
              </Text>

              <View className="flex-row items-center gap-2 mb-4">
                <View className="flex-row items-center h-12 px-3 bg-gray-100 rounded-xl border border-gray-200">
                  <Text className="text-gray-600 font-medium text-sm">🇮🇳 +91</Text>
                </View>
                <TextInput
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={(text) => {
                    setError(null);
                    setPhone(text.replace(/\D/g, '').slice(0, 10));
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                  className="flex-1 h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base font-medium"
                  style={{ letterSpacing: 3 }}
                  autoFocus
                />
              </View>

              {error && (
                <View className="flex-row items-center gap-1.5 mb-4">
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <Text className="text-sm text-red-500">{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={phone.length !== 10 || isLoading}
                className={`w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center ${
                  phone.length !== 10 || isLoading ? 'opacity-50' : ''
                }`}
                style={{ elevation: phone.length === 10 ? 4 : 0 }}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold">Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            /* Phase 2: OTP Verification */
            <>
              <Text className="text-xl font-bold text-gray-900 mb-1">Verify OTP</Text>
              <Text className="text-sm text-gray-500 mb-8">
                Enter the 6-digit code sent to{' '}
                <Text className="font-semibold text-gray-700">+91 {phone}</Text>
              </Text>

              <View className="mb-6">
                <OTPInput
                  value={otp}
                  onChange={(v) => {
                    setError(null);
                    setOtp(v);
                  }}
                  error={!!error}
                />
              </View>

              {error && (
                <View className="flex-row items-center justify-center gap-1.5 mb-4">
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <Text className="text-sm text-red-500">{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className={`w-full h-12 bg-[#22c55e] rounded-xl items-center justify-center ${
                  otp.length !== 6 || isLoading ? 'opacity-50' : ''
                }`}
                style={{ elevation: otp.length === 6 ? 4 : 0 }}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold">Verify & Continue</Text>
                )}
              </TouchableOpacity>

              <View className="items-center mt-5">
                {resendTimer > 0 ? (
                  <Text className="text-sm text-gray-400">
                    Resend OTP in{' '}
                    <Text className="font-semibold text-gray-600">{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP} activeOpacity={0.7}>
                    <Text className="text-sm font-semibold text-[#22c55e]">Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Footer hint */}
          <View className="mt-auto pt-8 items-center">
            <Text className="text-xs text-gray-300">
              Demo: Use OTP <Text className="font-bold text-gray-400">123456</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
