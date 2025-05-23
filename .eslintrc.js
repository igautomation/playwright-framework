module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:playwright/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }],
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-focused-test': process.env.CI ? 'error' : 'warn',
    'playwright/no-skipped-test': process.env.CI ? 'error' : 'warn',
    'playwright/valid-expect': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'reports/',
    'allure-results/',
    'playwright-report/',
    'dist/',
    'build/',
    'docs-site/',
  ],
};