module.exports = {
<<<<<<< HEAD
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src']
      },
      alias: {
        map: [
          ['@fixtures', './src/fixtures'],
          ['@utils', './src/utils']
        ],
        extensions: ['.js', '.jsx']
      }
    }
  }
=======
  env: {
    node: true,
    es2021: true,
    browser: true, // Add browser environment for document/window globals
  },
  extends: [
    'eslint:recommended',
    'plugin:playwright/recommended', // Add Playwright plugin
  ],
  parserOptions: {
    ecmaVersion: 2022, // Support modern JS features
    sourceType: 'module', // Support import/export
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore variables starting with underscore
    'no-undef': 'error',
  },
>>>>>>> 51948a2 (Main v1.0)
};
