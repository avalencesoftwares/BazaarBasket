// .eslintrc.base.js — Shared ESLint configuration for all packages
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'eqeqeq': ['error', 'always'],
    'prefer-const': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-duplicate-imports': 'off',
    'no-var': 'error',
    'curly': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js', '!.eslintrc*.js'],
};
