# CLI Utilities

This directory contains utilities for command-line operations in the Playwright framework.

## Core Files

- `cliUtils.js` - Main CLI utilities for test management and code generation
- `index.js` - Exports all CLI utilities

## Features

- Tag-based test filtering and execution
- Test file generation from templates
- Playwright codegen integration
- Tag expression parsing and evaluation

## Usage

```javascript
// Import all utilities
const cli = require('../src/utils/cli');

// List all tags in test files
const { tags, tagMap } = await cli.listTags({
  testDir: 'src/tests',
  pattern: '**/*.spec.js'
});

// Run tests with specific tags
cli.runTests({
  tags: '@smoke && !@slow',
  headed: true,
  project: 'chromium'
});

// Generate a new test file
cli.generateTest({
  name: 'Login Test',
  type: 'ui',
  tags: ['@login', '@smoke']
});

// Run Playwright codegen
cli.runCodegen({
  url: 'https://example.com',
  outputFile: 'src/tests/generated-test.spec.js',
  browser: 'chromium'
});

// Find tests matching a tag expression
const matchingTests = await cli.findTestsByTagExpression('@smoke && !@slow');
```