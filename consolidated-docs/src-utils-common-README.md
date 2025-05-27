<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/common/README.md -->

# Common Utilities

This directory contains common utilities used throughout the Playwright framework.

## Core Files

- `logger.js` - Logging utility for consistent logging across the framework
- `playwrightService.js` - Service for browser automation, screenshots, and PDF generation
- `playwrightUtils.js` - Additional utilities for advanced browser automation
- `errorHandler.js` - Error handling and reporting for Playwright operations
- `retryWithBackoff.js` - Retry mechanism with exponential backoff for flaky operations
- `dataUtils.js` - Utilities for reading and parsing data from various file formats
- `dataOrchestrator.js` - Manages test data across the framework
- `testDataFactory.js` - Generates test data for various scenarios
- `index.js` - Exports all common utilities

## Usage

```javascript
// Import all utilities
const common = require('../src/utils/common');

// Or import specific utilities
const { 
  logger, 
  PlaywrightService, 
  PlaywrightUtils, 
  dataUtils 
} = require('../src/utils/common');

// Use logger
logger.info('This is an info message');
logger.error('This is an error message');

// Use Playwright service
const service = new PlaywrightService();
await service.captureScreenshot('https://example.com');

// Use data utilities
const data = await dataUtils.readJsonData('path/to/data.json');

// Use test data factory
const user = TestDataFactory.createUser();
const products = TestDataFactory.createProducts(5);

// Use retry with backoff
const retry = new RetryWithBackoff();
const result = await retry.execute(async () => {
  // Flaky operation
  return await api.getData();
});
```