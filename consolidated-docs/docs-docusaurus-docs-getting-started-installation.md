<!-- Source: /Users/mzahirudeen/playwright-framework/docs/docusaurus/docs/getting-started/installation.md -->

---
sidebar_position: 2
---

# Installation

This guide will help you install and set up the Playwright Framework.

## Prerequisites

Before installing the framework, make sure you have the following prerequisites:

- **Node.js** (version 14 or higher)
- **npm** (version 6 or higher)
- **Git** (for version control)

## Installation Steps

### 1. Install Dependencies

First, install all the required dependencies:

```bash
npm install
```

This will install:
- Core Playwright libraries
- Test verification tools
- Reporting utilities
- Other framework dependencies

### 2. Install Browsers

Install the Playwright browsers:

```bash
npx playwright install
```

This installs Chromium, Firefox, and WebKit browsers.

If you need only specific browsers:

```bash
# Install only Chromium
npx playwright install chromium

# Install only Firefox
npx playwright install firefox

# Install only WebKit
npx playwright install webkit
```

### 3. Verify Installation

Verify that the browsers are installed correctly:

```bash
node scripts/verify-browsers.js
```

Run a framework health check:

```bash
node scripts/framework-health-check.js
```

### 4. Install Additional Dependencies

If you encounter any missing dependencies when running tests, install them:

```bash
# Data handling dependencies
npm install --save fast-xml-parser node-fetch @faker-js/faker exceljs js-yaml

# Visual testing dependencies
npm install --save pixelmatch pngjs

# Reporting dependencies
npm install --save allure-playwright
```

## Project Structure

After installation, your project structure should look like this:

```
playwright-framework/
├── src/
│   ├── cli/            # CLI commands
│   ├── config/         # Configuration files
│   ├── data/           # Test data
│   ├── pages/          # Page objects
│   ├── tests/          # Test files
│   └── utils/          # Utility functions
├── reports/            # Test reports
├── playwright.config.js # Playwright configuration
└── package.json
```

## Configuration

The framework can be configured through:

1. **Environment Variables**: Set in `.env` file or directly in the environment
2. **Configuration Files**: Modify `playwright.config.js` for test-specific settings
3. **CLI Options**: Pass options when running commands

See the [Configuration](configuration) section for more details.

## Troubleshooting

### Common Installation Issues

1. **Browser installation fails**

   Try running with administrator privileges or check your network connection:
   ```bash
   sudo npx playwright install
   ```

2. **Missing dependencies**

   If you see errors about missing modules, install them:
   ```bash
   npm install --save <module-name>
   ```

3. **Permission issues**

   Ensure you have write permissions to the installation directory:
   ```bash
   chmod -R 755 ./node_modules
   ```

## Next Steps

Now that you have installed the Playwright Framework, you can:

- [Write your first test](quick-start)
- [Configure the framework](configuration)
- [Explore the CLI commands](../api/cli)