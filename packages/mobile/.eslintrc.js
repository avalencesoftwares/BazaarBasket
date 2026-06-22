// .eslintrc.js — Mobile package ESLint config
module.exports = {
  ...require('../../.eslintrc.base.js'),
  root: true,
  plugins: [
    ...(require('../../.eslintrc.base.js').plugins || []),
    'react',
    'react-hooks',
    'react-native',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...require('../../.eslintrc.base.js').rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-raw-text': 'off',
  },
};
