# API Tests

This directory contains API tests for the application.

## Directory Structure

- `api/` - Root directory for API tests
  - `reqres-api.spec.js` - Main API tests for Reqres.in API
  - `rest/` - REST API tests
    - `fixed-reqres-api.spec.js` - Comprehensive API tests for Reqres.in API
    - `data-driven-api.spec.js` - Data-driven API tests
    - `user-api.spec.js` - User API tests
  - `xml/` - XML API tests
    - `xml-validation.spec.js` - XML validation tests

## Recent Changes

The following duplicate test files have been removed:

1. `direct-reqres-api.spec.js` - Duplicate of `reqres-api.spec.js`
2. `rest/direct-reqres-crud.spec.js` - Duplicate of `rest/fixed-reqres-api.spec.js`
3. `rest/reqres-crud.api.spec.js` - Duplicate of `rest/fixed-reqres-api.spec.js`
4. `rest/reqres-user-api.spec.js` - Duplicate of `rest/fixed-reqres-api.spec.js`

References to these files in `src/data/test-mapping.json` have been updated to point to the remaining files.

## Running Tests

To run all API tests:

```bash
./run-api-tests.sh
```

To run a specific API test:

```bash
npx playwright test src/tests/api/path/to/test.spec.js --project=api
```