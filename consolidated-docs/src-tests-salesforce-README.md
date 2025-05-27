<!-- Source: /Users/mzahirudeen/playwright-framework/src/tests/salesforce/README.md -->

# Salesforce Tests with Playwright

This directory contains automated tests for Salesforce using Playwright.

## Setup

1. Create a `.env` file in the project root with your Salesforce credentials:

```
SALESFORCE_USERNAME=your_username@example.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_CLIENT_ID=your_connected_app_client_id
SALESFORCE_CLIENT_SECRET=your_connected_app_client_secret
SALESFORCE_LOGIN_URL=https://login.salesforce.com
```

2. For API tests, you need to create a Connected App in Salesforce:
   - Setup > App Manager > New Connected App
   - Enable OAuth Settings
   - Add "Full access (full)" to Selected OAuth Scopes
   - Save the Consumer Key (Client ID) and Consumer Secret (Client Secret)

## Running Tests

Run all Salesforce tests:

```bash
npx playwright test src/tests/salesforce
```

Run specific test files:

```bash
npx playwright test src/tests/salesforce/salesforce-login.spec.js
```

## Test Files

- `salesforce-login.spec.js` - Tests for Salesforce authentication
- `lead-management.spec.js` - Tests for lead creation and conversion
- `opportunity-management.spec.js` - Tests for opportunity management
- `salesforce-api.spec.js` - Tests for Salesforce API interactions

## Utilities

The `src/utils/salesforce/salesforceUtils.js` file provides helper functions for Salesforce API interactions:

- Login to Salesforce API
- Create, read, update, and delete records
- Execute SOQL queries

## Configuration

Salesforce configuration is stored in `src/config/salesforce.config.js`. For security, sensitive values should be stored in environment variables.

## Best Practices

1. **Test Data Management**: Create test data via API before UI tests and clean up afterward.
2. **Selectors**: Use Lightning-specific selectors like `.slds-*` classes.
3. **Iframes**: Some Salesforce components are in iframes, which require special handling.
4. **Wait for Lightning**: Lightning UI has dynamic transitions that may require additional waiting.
5. **Visual Testing**: Consider using Playwright's screenshot comparison for visual regression testing.
6. **API Testing**: Use the Salesforce API for setup/teardown and data verification.