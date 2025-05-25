# Core Utilities

This directory contains core utility functions used throughout the Playwright framework.

## Core Files

- `coreUtils.js` - Core utility functions for common operations
- `index.js` - Exports all core utilities

## Features

- Date formatting
- String manipulation (camelCase, snake_case, kebab-case)
- Random data generation
- Object manipulation (deep clone, deep merge)
- Retry mechanism
- Number and file size formatting
- Email validation
- Asynchronous utilities

## Usage

```javascript
// Import all utilities
const core = require('../src/utils/core');

// Or import specific utilities
const { CoreUtils } = require('../src/utils/core');

// Format a date
const formattedDate = CoreUtils.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

// Generate random data
const randomString = CoreUtils.randomString(10);
const randomNumber = CoreUtils.randomNumber(1, 100);

// Validate an email
const isValid = CoreUtils.isValidEmail('user@example.com');

// Format numbers and file sizes
const formattedNumber = CoreUtils.formatNumber(1000000); // "1,000,000"
const fileSize = CoreUtils.formatFileSize(1024 * 1024); // "1.00 MB"

// Convert string cases
const camelCase = CoreUtils.toCamelCase('hello world'); // "helloWorld"
const snakeCase = CoreUtils.toSnakeCase('helloWorld'); // "hello_world"
const kebabCase = CoreUtils.toKebabCase('helloWorld'); // "hello-world"

// Deep clone an object
const clone = CoreUtils.deepClone(originalObject);

// Deep merge objects
const merged = CoreUtils.deepMerge(target, source1, source2);

// Wait for a specified time
await CoreUtils.wait(1000);

// Retry a function
const result = await CoreUtils.retry(async () => {
  // Function that might fail
  return await api.getData();
}, { maxAttempts: 3, delay: 1000, exponential: true });
```