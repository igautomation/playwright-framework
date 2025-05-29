# Salesforce Page Objects

This directory contains page objects for Salesforce UI automation.

## Structure

- `BaseSalesforcePage.js`: Base class with common Salesforce functionality
- `LoginPage.js`: Handles authentication
- `AppLauncherPage.js`: Handles navigation through the App Launcher
- `ContactPage.js`: Handles contact creation and management

## Usage

```javascript
const AppLauncherPage = require('../../pages/salesforce/AppLauncherPage');
const ContactPage = require('../../pages/salesforce/ContactPage');

test('Create a new contact', async ({ page }) => {
  // Initialize page objects
  const appLauncherPage = new AppLauncherPage(page);
  const contactPage = new ContactPage(page);

  // Navigate to Accounts app
  await appLauncherPage.navigateToAccounts();

  // Create a new contact
  await contactPage.createContact(contactData);
  
  // Verify success
  const isSuccess = await contactPage.verifyContactCreated();
  await expect(isSuccess).toBeTruthy();
});
```

## BaseSalesforcePage

Base class with common Salesforce functionality:

- `waitForPageLoad()`: Wait for Salesforce page to load
- `getToastMessage()`: Get toast message content
- `isToastVisible(partialText)`: Check if toast message is visible

## LoginPage

Handles authentication:

- `navigate(loginUrl)`: Navigate to login page
- `login(username, password)`: Login to Salesforce

## AppLauncherPage

Handles navigation through the App Launcher:

- `navigateToApp(appName)`: Navigate to an app using the App Launcher
- `navigateToAccounts()`: Navigate specifically to the Accounts app
- `navigateToContacts()`: Navigate specifically to the Contacts app

## ContactPage

Handles contact creation and management:

- `navigateToContactCreation(accountName)`: Navigate to contact creation form
- `createContact(contactData)`: Create a new contact
- `verifyContactCreated()`: Verify contact was created successfully
- `verifyContactUnderAccount(accountName)`: Verify contact was created under the specified account
- `getContactDetails()`: Get contact details from view page

## Best Practices

1. Use role-based selectors for better resilience
2. Add proper error handling and screenshots on failure
3. Use explicit waits for Salesforce's dynamic UI
4. Keep page objects focused on UI interactions
5. Add verification methods to page objects