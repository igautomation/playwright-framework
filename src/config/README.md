# Configuration Directory

This directory contains configuration files for the framework.

## Files

- **environment.js**: Loads environment variables from `.env` file
- **external-resources.js**: Configures external resources like APIs and CDNs
- **playwright.config.js**: Playwright test runner configuration

## External Resources Configuration

The `external-resources.js` file centralizes all external resource references to make them configurable. This ensures that the framework doesn't contain any hard-coded values, making it more reusable and adaptable to different environments.

### Configuration Categories

1. **CDN Resources**: URLs for external libraries
   - `axeCore`: Axe Core library for accessibility testing
   - `chartJs`: Chart.js library for visualization

2. **API Endpoints**: URLs for API testing
   - `default`: Default API endpoint
   - `xray`: Xray API endpoint for test management
   - `oauthToken`: OAuth token endpoint

3. **Email Configuration**: Settings for email generation
   - `defaultDomain`: Default domain for generated email addresses

### Environment Variables

The configuration uses environment variables with sensible defaults. You can override these variables in your `.env` file or through your CI/CD system.

#### Required Variables

- `DEFAULT_API_URL`: Default API endpoint for API testing

#### Optional Variables

- `AXE_CORE_CDN`: URL to axe-core library for accessibility testing
- `CHART_JS_CDN`: URL to Chart.js library for visualization
- `DEFAULT_EMAIL_DOMAIN`: Default domain for generated email addresses
- `XRAY_API_URL`: Xray API endpoint for test management integration
- `XRAY_CLIENT_ID`: Xray client ID for authentication
- `XRAY_CLIENT_SECRET`: Xray client secret for authentication
- `XRAY_PROJECT_KEY`: Xray project key for test management

### Usage

```javascript
const externalResources = require('../../config/external-resources');

// Use CDN URL
const axeCoreUrl = externalResources.cdn.axeCore;

// Use API endpoint
const apiUrl = externalResources.apis.default;

// Use email domain
const emailDomain = externalResources.email.defaultDomain;

// Validate configuration
externalResources.validate();
```

## Environment Configuration

The `environment.js` file provides a simple way to access environment variables with default values.

### Usage

```javascript
const env = require('../../config/environment');

// Get environment variable with default
const baseUrl = env.baseUrl;
const apiUrl = env.apiUrl;
const username = env.username;
const password = env.password;

// Get custom environment variable
const customVar = env.getEnv('CUSTOM_VAR', 'default value');
```

## Playwright Configuration

The `playwright.config.js` file configures the Playwright test runner. See the [Playwright documentation](https://playwright.dev/docs/test-configuration) for more details.