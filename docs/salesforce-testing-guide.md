# Salesforce Testing Guide

This guide provides detailed information on how to use the Playwright framework for Salesforce testing.

## Setup

### Environment Variables

Set up the following environment variables in your `.env` file:

```
SF_USERNAME=your.username@example.com
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_security_token
SF_LOGIN_URL=https://login.salesforce.com
SF_INSTANCE_URL=https://your-instance.lightning.force.com
```

### Authentication Storage

For faster test execution, you can store authentication state:

```bash
npm run setup:salesforce
```

This will create an authentication state in the `auth/` directory that can be reused by other tests.

## Page Objects

The framework uses a Page Object Model architecture for Salesforce testing:

### Base Pages

- `BaseSalesforcePage`: Common functionality for all page objects
  - `waitForPageLoad()`: Wait for Salesforce page to load
  - `getToastMessage()`: Get toast message content
  - `isToastVisible(partialText)`: Check if toast message is visible

### Salesforce Pages

- `LoginPage`: Handles login functionality
  - `navigate(loginUrl)`: Navigate to login page
  - `login(username, password)`: Login to Salesforce

- `AppLauncherPage`: Handles app navigation
  - `navigateToApp(appName)`: Navigate to an app using the App Launcher
  - `navigateToAccounts()`: Navigate specifically to the Accounts app
  - `navigateToContacts()`: Navigate specifically to the Contacts app

- `ContactPage`: Handles contact operations
  - `navigateToContactCreation(accountName)`: Navigate to contact creation form
  - `createContact(contactData)`: Create a new contact
  - `verifyContactCreated()`: Verify contact was created successfully
  - `verifyContactUnderAccount(accountName)`: Verify contact was created under the specified account
  - `getContactDetails()`: Get contact details from view page

## Test Data

Test data is generated using the `Faker` utility in `src/utils/test-data/faker.js`:

```javascript
const Faker = require('../../utils/test-data/faker');

// Generate individual data elements
const firstName = Faker.firstName();
const lastName = Faker.lastName();
const email = Faker.email();

// Generate complete contact data
const contactData = Faker.contactData();
```

## API Testing

The framework includes a `SalesforceUtils` class for API testing:

```javascript
const SalesforceUtils = require('../../utils/salesforce/SalesforceUtils');

// Initialize
const sfUtils = new SalesforceUtils({
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD,
  securityToken: process.env.SF_SECURITY_TOKEN
});

// Login
await sfUtils.login();

// Create record
const result = await sfUtils.createRecord('Account', accountData);

// Query records
const queryResult = await sfUtils.query('SELECT Id, Name FROM Account LIMIT 10');

// Update record
await sfUtils.updateRecord('Account', recordId, updateData);

// Delete record
await sfUtils.deleteRecord('Account', recordId);

// Clean up test data
await sfUtils.cleanupTestData('Contact', 'Department', 'Test Automation');
```

## Running Tests

### All Salesforce Tests

```bash
npm run test:salesforce
```

### With UI

```bash
npm run test:salesforce:headed
```

### In Debug Mode

```bash
npm run test:salesforce:debug
```

### With Playwright UI

```bash
npm run test:salesforce:ui
```

## Test Types

The framework includes several types of Salesforce tests:

### UI Tests

- `contact-creation.spec.js`: Tests contact creation functionality
- `salesforce.spec.js`: Main test suite for Salesforce functionality

### API Tests

- `salesforce-api.spec.js`: Tests Salesforce API operations

### Negative Tests

- `salesforce-negative.spec.js`: Tests validation and error handling

### Data-Driven Tests

- `salesforce-data-driven.spec.js`: Tests with multiple data sets

## Best Practices

1. **Use Page Objects**: Keep selectors and page interactions in page objects
2. **Data-Driven Testing**: Use the Faker utility for test data generation
3. **Explicit Waits**: Use explicit waits for Salesforce's dynamic UI
4. **Error Handling**: Add proper error handling and screenshots on failure
5. **Clean Up**: Tag test data for easy cleanup
6. **API for Setup**: Use API for test setup when possible
7. **Minimal UI Interaction**: Minimize UI interactions for faster tests

## Common Issues

### Login Issues

- Verify credentials in `.env` file
- Check if security token is required
- Ensure login URL is correct

### Selector Issues

- Salesforce UI can change between orgs and releases
- Use role-based selectors when possible
- Add fallback selectors for critical elements

### Performance Issues

- Use API for setup and teardown
- Store authentication state
- Run tests in parallel with different data