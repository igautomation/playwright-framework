// eslint.config.js

import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'off'
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
  }
];
