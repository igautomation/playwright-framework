# Enterprise-Grade Playwright Framework Features

This document provides detailed information about the advanced features implemented in our enterprise-grade Playwright framework.

## 1. API Schema Validation

The framework includes a robust API schema validation utility that allows you to validate API responses against JSON schemas.

### Key Features:

- Schema registration and management
- Detailed validation error reporting
- Support for complex nested schemas
- Integration with test data generation

### Example Usage:

```javascript
// Register schema
schemaValidator.addSchema('user', userSchema);

// Validate response
const response = await apiClient.get('/user/1');
const result = schemaValidator.validate('user', response);
expect(result.valid).toBeTruthy();
```

## 2. Auto-Healing Locators

The framework includes a self-healing locator utility that automatically recovers from broken selectors.

### Key Features:

- Multiple fallback strategies
- Automatic storage of successful selectors
- Support for various selector types
- Integration with Page Object Model

### Example Usage:

```javascript
// Create self-healing locator
const selfHealingLocator = new SelfHealingLocator(page);

// Get locator with fallbacks
const loginButton = await selfHealingLocator.getLocator('#login-button', [
  '[data-testid="login-button"]',
  '.login-btn',
]);

// Use the locator
await loginButton.click();
```

## 3. DOM Comparison and Auto-Correction

The framework includes a DOM comparison utility that detects changes in the DOM and updates locators automatically.

### Key Features:

- DOM snapshot capture and comparison
- Automatic locator extraction
- Detection of added, changed, and removed elements
- Alternative locator finding

### Example Usage:

```javascript
// Create DOM comparison utils
const domComparisonUtils = new DOMComparisonUtils(page);

// Compare DOM and update locators
const updatedLocators =
  await domComparisonUtils.compareAndUpdateLocators('login-page');

// Use updated locators
await page.locator(updatedLocators['button-login']).click();
```

## 4. Dynamic Payload Generation

The framework includes a test data factory that can generate dynamic payloads based on JSON schemas.

### Key Features:

- Schema-based payload generation
- Support for various data types
- Custom value overrides
- Realistic data generation

### Example Usage:

```javascript
// Generate payload from schema
const payload = TestDataFactory.generatePayloadFromSchema(userSchema);

// Generate payload with overrides
const payload = TestDataFactory.generatePayloadFromSchema(userSchema, {
  username: 'testuser123',
  email: 'test@example.com',
});
```

## 5. Web Scraping

The framework includes web scraping utilities for extracting structured data from web pages.

### Key Features:

- Table data extraction
- Link extraction
- Structured data extraction
- DOM snapshot saving

### Example Usage:

```javascript
// Create web scraping utils
const webScrapingUtils = new WebScrapingUtils(page);

// Extract table data
const tableData = await webScrapingUtils.extractTableData('#users-table');

// Extract structured data
const productData = await webScrapingUtils.extractStructuredData({
  title: '.product-title',
  price: '.product-price',
  rating: '.product-rating',
});
```

## 6. Accessibility Testing

The framework includes accessibility testing utilities for detecting accessibility issues.

### Key Features:

- Common accessibility issue detection
- Detailed violation reporting
- Customizable rule sets
- Integration with test reporting

### Example Usage:

```javascript
// Create accessibility utils
const accessibilityUtils = new AccessibilityUtils(page);

// Check for accessibility violations
const violations = await accessibilityUtils.getViolations();

// Generate accessibility report
await accessibilityUtils.generateReport();
```

## 7. Performance Testing

The framework includes performance testing utilities for measuring page load and resource performance.

### Key Features:

- Page load time measurement
- Resource loading analysis
- Performance report generation
- Integration with test reporting

### Example Usage:

```javascript
// Create performance utils
const performanceUtils = new PerformanceUtils(page);

// Measure performance
const metrics = await performanceUtils.measurePerformance();

// Generate performance report
await performanceUtils.generatePerformanceReport();
```

## Demo Tests

The framework includes several demo tests that showcase these features:

1. **API Schema Validation Demo**: `src/tests/demo/api-schema-validation-demo.spec.js`
2. **Auto-Healing Demo**: `src/tests/demo/auto-heal-demo.spec.js`
3. **DOM Comparison Demo**: `src/tests/demo/dom-comparison-demo.spec.js`
4. **Web Scraping Demo**: `src/tests/demo/web-scraping-demo.spec.js`
5. **OrangeHRM E2E Demo**: `src/tests/demo/orangehrm-e2e.spec.js`

To run these demos:

```bash
# Run all demo tests
npx playwright test --grep @demo

# Run specific demo
npx playwright test src/tests/demo/auto-heal-demo.spec.js
```
