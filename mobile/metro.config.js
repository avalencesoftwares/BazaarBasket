// metro.config.js — Custom Metro configuration for Firebase + Hermes compatibility
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force Metro to transform Firebase packages through Babel
// (Firebase v11 uses private class fields that Hermes doesn't support natively)
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;
