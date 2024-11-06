module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: [
    'import',
    'jsx-a11y',
    'react',
    'react-hooks',
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    './rules/best-practices',
    './rules/errors',
    './rules/node',
    './rules/variables',
    './rules/es6',
    './rules/imports',
    './rules/style',
    './rules/react',
    './rules/react-a11y',
    './rules/react-hooks',
  ].map(require.resolve),
  rules: {
    // 'use strict'
    // https://eslint.org/docs/rules/strict
    strict: 'error',
  },
};
