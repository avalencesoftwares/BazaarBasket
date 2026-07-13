/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|@tanstack/.*|zustand)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@bazaarbasket/shared$': '<rootDir>/shared',
    '^@bazaarbasket/shared/(.*)$': '<rootDir>/shared/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/.expo/**',
    '!babel.config.js',
    '!tailwind.config.js',
    '!jest.config.js',
    '!metro.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
};
