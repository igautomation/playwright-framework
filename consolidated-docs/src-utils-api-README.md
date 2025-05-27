<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/api/README.md -->

# API Utilities

This directory contains utilities for API testing with Playwright.

## Core Files

- `apiClient.js` - Main API client for making HTTP requests
- `auth.js` - Authentication utilities for API testing
- `graphqlUtils.js` - GraphQL client for making GraphQL requests
- `restUtils.js` - REST utilities for API testing
- `schemaValidator.js` - JSON schema validation utilities
- `index.js` - Exports all API utilities

## Models

The `models` directory contains data models for API testing:

- `Employee.js` - Employee data model
- `User.js` - User data model

## Usage

```javascript
// Import all utilities
const api = require('../src/utils/api');

// Or import specific utilities
const { ApiClient, AuthUtils } = require('../src/utils/api');
const { Employee, User } = require('../src/utils/api').models;

// Create API client
const apiClient = new ApiClient('https://api.example.com');

// Make requests
const users = await apiClient.get('/users');
const user = await apiClient.post('/users', { name: 'John Doe' });
```

## Authentication

```javascript
// Create auth utils
const authUtils = new AuthUtils();

// Get API key headers
const headers = authUtils.getApiKeyHeaders();

// Get OAuth token
const token = await authUtils.getOAuthToken();
const oauthHeaders = authUtils.getOAuthHeaders();

// Use with API client
apiClient.setAuthToken(token);
```

## GraphQL

```javascript
// Create GraphQL client
const graphqlClient = new GraphQLUtils('https://api.example.com/graphql');

// Make GraphQL query
const query = `
  query {
    users {
      id
      name
    }
  }
`;
const data = await graphqlClient.query(query);
```

## Schema Validation

```javascript
// Create schema validator
const validator = new SchemaValidator();

// Define schema
const schema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' }
  }
};

// Validate data
const result = validator.validate(data, schema);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```