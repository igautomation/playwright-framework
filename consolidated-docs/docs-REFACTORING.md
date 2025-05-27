<!-- Source: /Users/mzahirudeen/playwright-framework/docs/REFACTORING.md -->

# Test Refactoring Guide

This document provides guidance for refactoring the test files to address the issues identified by the validation script.

## Issues to Address

1. **Hard-Coded URLs**
2. **Hard-Coded Credentials**
3. **Missing test.describe Blocks**
4. **Missing Assertions**
5. **Sleep/Delay Usage**

## Step 1: Create Environment Configuration

First, ensure all environment variables are properly defined in the `.env` file:

```
# Base URLs
BASE_URL=https://demo.playwright.dev
API_URL=https://reqres.in/api

# Authentication
USERNAME=Admin
PASSWORD=admin123

# Test Data
TEST_USER_EMAIL=user@example.com
TEST_USER_NAME=Test User
```

## Step 2: Replace Hard-Coded URLs

Replace all hard-coded URLs with environment variables:

```javascript
// Before
await page.goto('https://playwright.dev/');

// After
await page.goto(process.env.BASE_URL);
```

For API tests:

```javascript
// Before
const apiClient = new ApiClient('https://reqres.in/api');

// After
const apiClient = new ApiClient(process.env.API_URL);
```

## Step 3: Replace Hard-Coded Credentials

Replace all hard-coded credentials with environment variables:

```javascript
// Before
await loginPage.login('Admin', 'admin123');

// After
await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
```

## Step 4: Add test.describe Blocks

Wrap all tests in `test.describe` blocks:

```javascript
// Before
test('page title is correct', async ({ page }) => {
  // ...
});

// After
test.describe('Page Navigation', () => {
  test('page title is correct', async ({ page }) => {
    // ...
  });
});
```

## Step 5: Add Assertions

Ensure all tests have at least one assertion:

```javascript
// Before
test('navigate to page', async ({ page }) => {
  await page.goto(process.env.BASE_URL);
});

// After
test('navigate to page', async ({ page }) => {
  await page.goto(process.env.BASE_URL);
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## Step 6: Replace Sleep/Delay with Proper Waiting

Replace arbitrary delays with Playwright's waiting mechanisms:

```javascript
// Before
await page.click('#submit');
await page.waitForTimeout(2000);

// After
await page.click('#submit');
await page.waitForSelector('#success-message');
// or
await expect(page.locator('#success-message')).toBeVisible();
```

## Example Refactoring

### Before

```javascript
// src/tests/ui/example.spec.js
const { test, expect } = require('@playwright/test');

test('user can login', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
});
```

### After

```javascript
// src/tests/ui/example.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto(process.env.ORANGEHRM_URL);
    await page.fill('input[name="username"]', process.env.USERNAME);
    await page.fill('input[name="password"]', process.env.PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('.oxd-topbar-header')).toBeVisible();
  });
});
```

## Automated Refactoring

For bulk refactoring, you can create a script that:

1. Scans all test files
2. Identifies patterns to replace
3. Makes the necessary replacements

Example script structure:

```javascript
const fs = require('fs');
const path = require('path');

// Define patterns to replace
const replacements = [
  {
    pattern: /'https:\/\/reqres\.in\/api'/g,
    replacement: 'process.env.API_URL'
  },
  {
    pattern: /'Admin'/g,
    replacement: 'process.env.USERNAME'
  },
  {
    pattern: /'admin123'/g,
    replacement: 'process.env.PASSWORD'
  }
];

// Function to process a file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      pattern.lastIndex = 0; // Reset regex index
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Walk through the tests directory
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && file.endsWith('.spec.js')) {
      processFile(filePath);
    }
  }
}

// Start processing
walkDir(path.resolve(__dirname, '../src/tests'));
```

## Validation

After refactoring, run the validation script again to ensure all issues have been addressed:

```bash
node ./scripts/utils/validate-tests.js
```