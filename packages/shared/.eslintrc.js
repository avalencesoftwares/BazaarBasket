// .eslintrc.js — Shared package ESLint config
module.exports = {
  ...require('../../.eslintrc.base.js'),
  root: true,
  env: {
    node: true,
    jest: true,
  },
};
