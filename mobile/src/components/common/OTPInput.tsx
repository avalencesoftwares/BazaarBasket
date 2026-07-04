// src/components/common/OTPInput.tsx
// 6-digit OTP input with auto-advance between fields

import React, { useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Animated } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnim]);

  const handleChange = useCallback(
    (idx: number, char: string) => {
      if (!/^\d?$/.test(char)) return;
      const arr = value.split('');
      arr[idx] = char;
      const newValue = arr.join('').slice(0, length);
      onChange(newValue);
      if (char && idx < length - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [value, length, onChange]
  );

  const handleKeyPress = useCallback(
    (idx: number, key: string) => {
      if (key === 'Backspace' && !value[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [value]
  );

  return (
    <Animated.View
      style={{ transform: [{ translateX: shakeAnim }] }}
      className="flex-row gap-2.5 justify-center"
    >
      {Array.from({ length }, (_, i) => (
        <TextInput
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          maxLength={1}
          keyboardType="number-pad"
          value={value[i] || ''}
          onChangeText={(char) => handleChange(i, char)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
            error
              ? 'border-red-400 bg-red-50'
              : value[i]
                ? 'border-[#22c55e] bg-green-50'
                : 'border-gray-200 bg-gray-50'
          }`}
          style={{ fontSize: 20 }}
          selectTextOnFocus
        />
      ))}
    </Animated.View>
  );
}
