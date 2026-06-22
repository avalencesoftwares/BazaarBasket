// .eslintrc.js — Functions package ESLint config
module.exports = {
  ...require('../../.eslintrc.base.js'),
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    ...require('../../.eslintrc.base.js').rules,
    'no-console': 'error',
  },
};
