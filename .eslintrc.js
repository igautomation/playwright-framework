module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:playwright/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'playwright/no-conditional-in-test': 'off',
    'playwright/expect-expect': 'off',
    'playwright/no-force-option': 'warn',
    'playwright/no-wait-for-timeout': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};