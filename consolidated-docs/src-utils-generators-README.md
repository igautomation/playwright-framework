<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/generators/README.md -->

# Page Object Generators

This directory contains utilities for automatically generating Page Objects from DOM elements.

## Features

- Extract standard web elements (inputs, buttons, selects, etc.)
- Extract Salesforce-specific elements (lightning components)
- Extract DOM collections (tables, lists, grids)
- Extract and handle modals and dialogs
- Generate page object classes with appropriate methods
- Generate test files with basic test cases

## DOM Collections Support

The generators support extracting and working with DOM collections:

- **Tables**: Standard HTML tables, ARIA tables, and grid roles
- **Lists**: Ordered and unordered lists, listbox roles
- **Grids**: CSS grid-based layouts
- **Repeaters**: Repeated elements with similar structure
- **Lightning Datatables**: Salesforce Lightning datatable components

## Modal/Dialog Support

The generators now detect and handle modal dialogs with methods for:

- Waiting for modals to appear
- Getting modal titles and content
- Clicking buttons within modals
- Filling form fields in modals
- Closing modals
- Checking modal visibility

## Usage

```bash
# Standard web application
node generate-page.js --url https://example.com/page --name ExamplePage

# Salesforce application
node generate-page.js --url https://myorg.lightning.force.com/page --name SfPage --salesforce

# With authentication
node generate-page.js --url https://myorg.lightning.force.com/page --name SfPage --salesforce --username user@example.com --password mypassword

# Without collections
node generate-page.js --url https://example.com/page --name ExamplePage --no-collections

# Generate test files
node generate-page.js --url https://example.com/page --name ExamplePage --generate-tests

# Run in visible mode (non-headless)
node generate-page.js --url https://example.com/page --name ExamplePage --visible
```

## Configuration

See `config.js` for default configuration options. Key settings include:

```javascript
{
  // Output paths
  output: {
    pagesDir: './src/pages',
    testsDir: './tests/pages'
  },
  
  // Extraction options
  extraction: {
    waitForSelectors: { /* ... */ },
    timeout: 60000,
    extractCollections: true
  },
  
  // Salesforce specific options
  salesforce: {
    loginUrl: 'https://login.salesforce.com',
    components: [ /* ... */ ]
  }
}
```

## Core Files

- `generate-page.js`: Main CLI entry point
- `page-generator.js`: Core page object generation logic
- `element-extractor.js`: Element extraction for standard and Salesforce pages
- `domCollections.js`: DOM collections utilities
- `config.js`: Configuration settings
- `selectors.js`: Selector patterns for element identification

## Examples

### Generate a standard page object:

```bash
node generate-page.js --url https://example.com/login --name LoginPage
```

### Generate a Salesforce page object:

```bash
node generate-page.js --url https://myorg.lightning.force.com/lightning/o/Contact/new --name ContactPage --salesforce
```

### Generate with authentication:

```bash
node generate-page.js --url https://myorg.lightning.force.com/lightning/o/Contact/new --name ContactPage --salesforce --username user@example.com --password mypassword
```

### Generate page object with tests:

```bash
node generate-page.js --url https://example.com/login --name LoginPage --generate-tests
```

### Generate for modal/dialog pages:

```bash
node generate-page.js --url https://myorg.lightning.force.com/lightning/o/Contact/new --name NewContactDialog --salesforce --generate-tests
```