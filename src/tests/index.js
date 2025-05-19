/**
 * Test Suite Index
 * 
 * This file serves as an entry point and documentation for the test suite.
 * It provides an overview of the available tests and how to run them.
 */

/**
 * Test Categories:
 * 
 * 1. Core Tests
 *    - Basic functionality tests that validate core features
 *    - Located in src/tests/core/
 *    - Examples: navigation, authentication, API integration, etc.
 * 
 * 2. Example Tests
 *    - Demonstrate how to use specific framework features
 *    - Located in src/tests/examples/
 *    - Examples: data-driven testing, API mocking, custom fixtures, etc.
 * 
 * 3. Validation Tests
 *    - Verify that the framework itself is working correctly
 *    - Located in src/tests/validation/
 *    - Examples: framework components, configuration, plugin system, etc.
 */

/**
 * Running Tests:
 * 
 * Run all tests:
 * ```
 * npx playwright test
 * ```
 * 
 * Run a specific test file:
 * ```
 * npx playwright test src/tests/core/navigation.spec.js
 * ```
 * 
 * Run tests in a specific directory:
 * ```
 * npx playwright test src/tests/core/
 * ```
 * 
 * Run tests with specific browser:
 * ```
 * npx playwright test --project=chromium
 * ```
 * 
 * Run tests in parallel with multiple workers:
 * ```
 * npx playwright test --workers=4
 * ```
 * 
 * Run tests with UI mode:
 * ```
 * npx playwright test --ui
 * ```
 */

// This file is for documentation purposes only and is not executed