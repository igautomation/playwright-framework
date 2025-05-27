<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/data/README.md -->

# Data Utilities

This directory contains utilities for generating test data for the Playwright framework.

## Core Files

- `dataGenerator.js` - Utility for generating random test data
- `index.js` - Exports all data utilities

## Features

- Random data generation for testing
- Name generation (first name, last name, full name)
- Email and username generation
- Password generation
- Job title generation
- Employee ID generation
- Date generation

## Usage

```javascript
// Import all utilities
const data = require('../src/utils/data');

// Or import specific utilities
const { DataGenerator } = require('../src/utils/data');

// Create a data generator instance
const generator = new DataGenerator();

// Generate random data
const firstName = generator.firstName();
const lastName = generator.lastName();
const fullName = generator.fullName();
const email = generator.email('example.com');
const username = generator.username();
const password = generator.password(12);
const jobTitle = generator.jobTitle();
const employeeId = generator.employeeId();
const randomDate = generator.date();
const dateString = generator.dateString();

// Generate random strings and numbers
const randomString = generator.randomString(10);
const randomInt = generator.randomInt(1, 100);
```

## Related Utilities

For more comprehensive test data generation, see also:

- `TestDataFactory` in `/src/utils/common/testDataFactory.js` - Provides more complex data structures
- `DataProvider` in `/src/utils/web/dataProvider.js` - Handles loading and saving data files