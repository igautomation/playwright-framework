---
sidebar_position: 2
---

# API Testing

This guide explains how to write API tests using the Playwright Framework.

## API Testing Approach

The framework provides a comprehensive approach to API testing:

1. **POJO Models**: Plain Old JavaScript Objects with getters/setters for request/response data
2. **API Utilities**: Classes for making API requests and handling responses
3. **Test Data Factory**: Generate dynamic test data for API requests
4. **Fixtures**: Set up API clients and authentication for tests

## POJO Models

POJO models provide a structured way to work with API request and response data:

```javascript
class User {
  // Private properties using # prefix
  #id;
  #username;
  #firstName;
  #lastName;
  #email;
  #password;
  #phone;
  #userStatus;

  constructor(userData = {}) {
    this.#id = userData.id || 0;
    this.#username = userData.username || '';
    this.#firstName = userData.firstName || '';
    this.#lastName = userData.lastName || '';
    this.#email = userData.email || '';
    this.#password = userData.password || '';
    this.#phone = userData.phone || '';
    this.#userStatus = userData.userStatus || 0;
  }

  // Getters and setters
  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
  }

  get username() {
    return this.#username;
  }

  set username(value) {
    this.#username = value;
  }

  // More getters and setters...

  // Serialization
  toJSON() {
    return {
      id: this.#id,
      username: this.#username,
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      password: this.#password,
      phone: this.#phone,
      userStatus: this.#userStatus,
    };
  }

  // Deserialization
  static fromJSON(json) {
    return new User(json);
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.#username) {
      errors.push('Username is required');
    }

    if (!this.#password) {
      errors.push('Password is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = User;
```

## API Utilities

The framework provides utilities for making API requests:

```javascript
const axios = require('axios');
const logger = require('../common/logger');

class ApiUtils {
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl || process.env.API_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.defaultHeaders,
      timeout: 30000,
    });
  }

  setAuthToken(token, type = 'Bearer') {
    this.defaultHeaders['Authorization'] = `${type} ${token}`;
    this.client.defaults.headers.common['Authorization'] = `${type} ${token}`;
    return this;
  }

  async get(endpoint, params = {}, headers = {}) {
    try {
      const response = await this.client.get(endpoint, {
        params,
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`GET request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  async post(endpoint, data = {}, headers = {}) {
    try {
      const response = await this.client.post(endpoint, data, {
        headers: { ...this.defaultHeaders, ...headers },
      });
      return response.data;
    } catch (error) {
      logger.error(`POST request failed for endpoint: ${endpoint}`, error);
      throw error;
    }
  }

  // More methods for PUT, DELETE, PATCH, etc.
}

module.exports = ApiUtils;
```

## GraphQL Utilities

For GraphQL APIs, the framework provides a specialized utility:

```javascript
const { request, gql } = require('graphql-request');
const logger = require('../common/logger');

class GraphQLUtils {
  constructor(endpoint, headers = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  setAuthToken(token, type = 'Bearer') {
    this.headers['Authorization'] = `${type} ${token}`;
    return this;
  }

  async query(query, variables = {}) {
    try {
      logger.debug('Executing GraphQL query', { query, variables });

      const data = await request({
        url: this.endpoint,
        document: gql`
          ${query}
        `,
        variables,
        requestHeaders: this.headers,
      });

      logger.debug('GraphQL query result', { data });
      return data;
    } catch (error) {
      logger.error('GraphQL query failed', error);
      throw error;
    }
  }

  async mutate(mutation, variables = {}) {
    // Similar to query method
    return this.query(mutation, variables);
  }
}

module.exports = GraphQLUtils;
```

## Test Data Factory

Generate dynamic test data for API tests:

```javascript
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

class TestDataFactory {
  static generateUser(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .userName({ firstName, lastName })
      .toLowerCase();

    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
      username,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      userStatus: faker.number.int({ min: 0, max: 1 }),
      ...overrides,
    };
  }

  // More methods for generating different types of data
}

module.exports = TestDataFactory;
```

## API Test Fixtures

Create fixtures for API testing:

```javascript
const { test: base } = require('@playwright/test');
const ApiUtils = require('../../utils/api/apiUtils');
const GraphQLUtils = require('../../utils/api/graphqlUtils');

const test = base.extend({
  apiClient: async ({}, use) => {
    const apiClient = new ApiUtils(process.env.API_URL);
    await use(apiClient);
  },

  authenticatedApiClient: async ({ apiClient }, use) => {
    // Authenticate with API
    const loginPayload = {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD,
    };

    const response = await apiClient.post('/auth', loginPayload);
    apiClient.setAuthToken(response.token);

    await use(apiClient);
  },

  graphqlClient: async ({}, use) => {
    const graphqlClient = new GraphQLUtils(process.env.GRAPHQL_URL);
    await use(graphqlClient);
  },
});

module.exports = { test };
```

## Writing API Tests

### REST API Tests

```javascript
const { test } = require('../fixtures/apiFixtures');
const { expect } = require('@playwright/test');
const User = require('../../utils/api/models/User');
const TestDataFactory = require('../../utils/common/testDataFactory');

test.describe('User API @api @rest', () => {
  let testUser;

  test.beforeEach(() => {
    // Generate test user data
    testUser = TestDataFactory.generateUser();
  });

  test('Create a new user @create @p1', async ({ apiClient }) => {
    // Create user model
    const user = new User(testUser);

    // Verify user data is valid
    const validation = user.validate();
    expect(validation.valid).toBeTruthy();

    // Create user via API
    const response = await apiClient.post('/user', user.toJSON());

    // Verify response
    expect(response).toBeDefined();
    expect(response.code).toBeDefined();
    expect(response.message).toBeDefined();
  });

  test('Get user by username @read @p1', async ({ apiClient }) => {
    // Create user first
    const user = new User(testUser);
    await apiClient.post('/user', user.toJSON());

    // Get user by username
    const response = await apiClient.get(`/user/${testUser.username}`);

    // Verify response
    expect(response).toBeDefined();
    expect(response.username).toBe(testUser.username);
    expect(response.firstName).toBe(testUser.firstName);
    expect(response.lastName).toBe(testUser.lastName);
  });

  // More tests for update, delete, etc.
});
```

### GraphQL API Tests

```javascript
const { test } = require('../fixtures/apiFixtures');
const { expect } = require('@playwright/test');
const TestDataFactory = require('../../utils/common/testDataFactory');

test.describe('GraphQL API @api @graphql', () => {
  test('Query users @read @p1', async ({ graphqlClient }) => {
    const query = `
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `;

    const response = await graphqlClient.query(query);

    expect(response).toBeDefined();
    expect(response.users).toBeInstanceOf(Array);
  });

  test('Create user mutation @create @p1', async ({ graphqlClient }) => {
    const userData = TestDataFactory.generateUser();

    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const variables = {
      input: {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
      },
    };

    const response = await graphqlClient.mutate(mutation, variables);

    expect(response).toBeDefined();
    expect(response.createUser).toBeDefined();
    expect(response.createUser.name).toBe(
      `${userData.firstName} ${userData.lastName}`
    );
    expect(response.createUser.email).toBe(userData.email);
  });
});
```

## Advanced API Testing

### Request/Response Interception

```javascript
const { test } = require('@playwright/test');
const ApiUtils = require('../../utils/api/apiUtils');

test('Intercept API requests', async ({ page }) => {
  // Set up request interception
  await page.route('**/api/users', (route) => {
    const mockUsers = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUsers),
    });
  });

  // Navigate to page that makes API request
  await page.goto('/users');

  // Verify mocked data is displayed
  await expect(page.locator('.user-list')).toContainText('John Doe');
  await expect(page.locator('.user-list')).toContainText('Jane Smith');
});
```

### API Performance Testing

```javascript
const { test } = require('../fixtures/apiFixtures');
const { expect } = require('@playwright/test');

test('API performance test @performance', async ({ apiClient }) => {
  const startTime = Date.now();

  // Make API request
  const response = await apiClient.get('/users');

  const endTime = Date.now();
  const responseTime = endTime - startTime;

  // Verify response time is within acceptable limits
  expect(responseTime).toBeLessThan(1000); // Less than 1 second

  // Verify response
  expect(response).toBeDefined();
});
```

### Batch API Requests

```javascript
const { test } = require('../fixtures/apiFixtures');
const { expect } = require('@playwright/test');
const TestDataFactory = require('../../utils/common/testDataFactory');

test('Batch API requests @batch', async ({ apiClient }) => {
  // Generate multiple users
  const users = [
    TestDataFactory.generateUser(),
    TestDataFactory.generateUser(),
    TestDataFactory.generateUser(),
  ];

  // Create batch requests
  const requests = users.map((user) => ({
    method: 'post',
    endpoint: '/user',
    data: user,
  }));

  // Execute batch requests
  const responses = await apiClient.batch(requests);

  // Verify responses
  expect(responses).toHaveLength(users.length);
  responses.forEach((response) => {
    expect(response).toBeDefined();
    expect(response.code).toBeDefined();
  });
});
```

## Best Practices

1. **Use POJO models**: Create models for request/response data with validation
2. **Generate dynamic test data**: Use test data factory to generate realistic data
3. **Isolate tests**: Each test should be independent and not rely on other tests
4. **Clean up test data**: Delete created resources after tests to avoid test pollution
5. **Handle authentication properly**: Set up authentication in fixtures
6. **Validate responses thoroughly**: Check status codes, headers, and body
7. **Use meaningful test names**: Test names should describe what is being tested
8. **Group related tests**: Use `test.describe` to group related tests
9. **Add proper tags**: Use tags like `@api`, `@rest`, `@graphql` for filtering

## Next Steps

Now that you've learned about API testing, you can:

1. Explore [E2E Testing](e2e-testing)
2. Learn about [Data-Driven Testing](data-driven-testing)
3. Set up [CI/CD Integration](ci-cd-integration)
