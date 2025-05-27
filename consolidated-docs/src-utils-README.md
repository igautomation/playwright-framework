<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/README.md -->

# Utils Directory

This directory contains utility functions and classes used throughout the framework.

## Directory Structure

```
utils/
├── accessibility/    # Accessibility testing utilities
├── api/              # API testing utilities
├── common/           # Common utilities
├── web/              # Web testing utilities
└── [other]/          # Additional specialized utilities
```

## Key Utilities

### API Utilities

- **ApiClient**: Helper methods for API testing
  - Location: `api/apiUtils.js`
  - Usage: Making HTTP requests to APIs

### Web Utilities

- **WebInteractions**: Helper methods for web interactions
  - Location: `web/webInteractions.js`
  - Usage: Common web page interactions

- **ScreenshotUtils**: Utilities for taking and comparing screenshots
  - Location: `web/screenshotUtils.js`
  - Usage: Visual testing and comparison

- **SelfHealingLocator**: Robust element selection with multiple strategies
  - Location: `web/SelfHealingLocator.js`
  - Usage: Reliable element selection

### Common Utilities

- **Logger**: Logging utilities for tests
  - Location: `common/logger.js`
  - Usage: Logging test information

- **TestDataFactory**: Generate test data for tests
  - Location: `common/testDataFactory.js`
  - Usage: Creating test data

### Accessibility Utilities

- **AccessibilityUtils**: Utilities for accessibility testing
  - Location: `accessibility/accessibilityUtils.js`
  - Usage: Testing WCAG compliance

## Design Principles

1. **Configurability**: All external resources (URLs, credentials, etc.) are configurable through environment variables or configuration files.

2. **Modularity**: Each utility focuses on a specific concern and can be used independently.

3. **Reusability**: Utilities are designed to be reused across different tests and projects.

4. **Testability**: All utilities can be easily tested in isolation.

5. **Documentation**: All utilities are well-documented with JSDoc comments.

## Configuration

All external resources are configured through the `src/config/external-resources.js` file, which loads values from environment variables with sensible defaults.

### Required Environment Variables

- `DEFAULT_API_URL`: Default API endpoint for API testing

### Optional Environment Variables

- `AXE_CORE_CDN`: URL to axe-core library for accessibility testing
- `CHART_JS_CDN`: URL to Chart.js library for visualization
- `DEFAULT_EMAIL_DOMAIN`: Default domain for generated email addresses
- `XRAY_API_URL`: Xray API endpoint for test management integration
- `XRAY_CLIENT_ID`: Xray client ID for authentication
- `XRAY_CLIENT_SECRET`: Xray client secret for authentication
- `XRAY_PROJECT_KEY`: Xray project key for test management

## Usage Example

```javascript
const { ApiClient } = require('../utils');
const WebInteractions = require('../utils/web/webInteractions');
const logger = require('../utils/common/logger');

// Using API client
const apiClient = new ApiClient('https://api.example.com');
const response = await apiClient.get('/users');

// Using web interactions
const webInteractions = new WebInteractions(page);
await webInteractions.click('#submit-button');

// Using logger
logger.info('Test completed successfully');
```

## Validation

Run the validation script to ensure no hard-coded values are present:

```bash
node ./scripts/utils/validate-external-resources.js
```