<!-- Source: /Users/mzahirudeen/playwright-framework/docs/PAGE_OBJECT_GENERATOR.md -->

# Page Object Generator

The framework includes a built-in utility to automatically generate page objects from web pages. This tool analyzes the page structure and creates a well-organized page class with selectors and methods.

## Usage

```bash
# Basic usage
npx generate-page <url> <name>

# Examples
npx generate-page https://example.com LoginPage
npx generate-page https://app.salesforce.com AccountPage --framework salesforce
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--framework` | Target framework (standard, salesforce, angular, react) | standard |
| `--output, -o` | Output directory for generated files | ./src/pages |
| `--no-headless` | Run in headed mode | false |

## Supported Frameworks

- **Standard Web**: Basic HTML elements and common patterns
- **Salesforce Lightning**: Lightning components and SLDS patterns
- **Angular Material**: Mat-* components and Angular patterns
- **React**: React components and testing selectors

## Element Detection

The generator automatically detects and creates methods for:

- Form inputs (text, password, email, etc.)
- Buttons and links
- Checkboxes and radio buttons
- Select dropdowns
- Tables and data grids
- Modals and dialogs
- Custom framework components
- Shadow DOM elements

## Selector Strategies

Selectors are chosen in this priority order:

1. Testing attributes (data-testid, data-qa, etc.)
2. ID attributes
3. Name attributes
4. ARIA attributes
5. Framework-specific attributes
6. CSS selectors
7. XPath as last resort

## Generated Methods

The generator creates appropriate methods based on element type:

```javascript
// For inputs
async fillUsername(value) {
  await this.fill(this.usernameInput, value);
}

// For buttons
async clickSubmit() {
  await this.click(this.submitButton);
}

// For checkboxes
async setRememberMe(check) {
  await this.setCheckbox(this.rememberMeCheckbox, check);
}

// For dropdowns
async selectCountry(value) {
  await this.select(this.countryDropdown, value);
}

// For tables
async getTableRowCount() {
  return await this.page.locator(this.dataTable + ' tbody tr').count();
}
```

## Example Output

```javascript
/**
 * LoginPage Page Object
 * Generated from https://example.com/login
 * @generated
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page URL
    this.url = 'https://example.com/login';
    
    // Form Elements
    this.usernameInput = '[data-testid="username"]';
    this.passwordInput = '[data-testid="password"]';
    this.rememberMeCheckbox = '#rememberMe';
    this.submitButton = 'button[type="submit"]';
    
    // Messages
    this.errorMessage = '.error-message';
    this.successMessage = '.success-message';
    
    // Navigation
    this.forgotPasswordLink = 'a:has-text("Forgot Password")';
    this.registerLink = 'a:has-text("Register")';
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill username field
   * @param {string} username
   */
  async fillUsername(username) {
    await this.fill(this.usernameInput, username);
  }

  /**
   * Fill password field
   * @param {string} password
   */
  async fillPassword(password) {
    await this.fill(this.passwordInput, password);
  }

  /**
   * Set remember me checkbox
   * @param {boolean} check
   */
  async setRememberMe(check) {
    await this.setCheckbox(this.rememberMeCheckbox, check);
  }

  /**
   * Click login button
   */
  async clickSubmit() {
    await this.click(this.submitButton);
  }

  /**
   * Get error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Complete login flow
   * @param {string} username
   * @param {string} password
   * @param {boolean} rememberMe
   */
  async login(username, password, rememberMe = false) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.setRememberMe(true);
    }
    await this.clickSubmit();
  }
}
```

## Best Practices

1. Review generated selectors and update if needed
2. Add custom methods for complex interactions
3. Group related actions into helper methods
4. Add JSDoc comments for parameters and return types
5. Keep page objects focused on single page/component
6. Use meaningful names for methods and selectors

## Maintenance

The generator creates a `@generated` tag in the file header. You can:

1. Regenerate the file to update selectors
2. Manually edit the file for custom logic
3. Remove the `@generated` tag to prevent overwrites