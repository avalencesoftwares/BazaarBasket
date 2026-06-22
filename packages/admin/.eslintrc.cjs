// packages/admin/.eslintrc.cjs — Admin package ESLint config (CommonJS)
module.exports = {
  ...require('../../.eslintrc.base.js'),
  root: true,
  plugins: [
    ...(require('../../.eslintrc.base.js').plugins || []),
    'react',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    es2020: true,
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
  },
};
