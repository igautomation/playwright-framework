// src/fixtures/combined.js

/**
 * Combined fixture entry point for all test files.
 * This extends the base Playwright test object using our custom fixtures
 * and re-exports the shared 'test' and 'expect' to be used in .spec.js files.
 *
 * Usage:
 *   import { test, expect } from '../../../fixtures/combined.js';
 */

import { expect } from '@playwright/test';
import { customTest } from './customFixtures.js';

// Extend the base test from our custom fixtures (apiClient, retryDiagnostics, etc.)
const test = customTest.extend({});

// Export unified test and expect for use across the framework
export { test, expect };
