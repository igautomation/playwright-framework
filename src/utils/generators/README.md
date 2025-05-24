# Page Object Generator

Automatically generate Page Objects from any web page with smart selector strategies and framework-specific support.

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
| `url` | URL of the web page to analyze | (Required) |
| `name` | Name for the page class | (Required) |
| `--framework, -f` | Target framework (standard, salesforce, angular, react) | standard |
| `--output, -o` | Output directory | ./src/pages |
| `--no-headless` | Run in headed mode | false |

## Features

- 🔍 **Smart Selector Detection**
  - data-testid attributes
  - ARIA labels and roles
  - IDs and names
  - Framework-specific attributes
  - Shadow DOM support

- 🎯 **Framework Support**
  - Standard web elements
  - Salesforce Lightning components
  - Angular Material components
  - React components
  - Custom framework support

- 🛠️ **Generated Methods**
  - Form interactions (fill, select, check)
  - Button clicks
  - Table operations
  - Modal handling
  - Custom component interactions

## Example Output

```javascript
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.usernameInput = '[data-testid="username"]';
    this.passwordInput = '[data-testid="password"]';
    this.loginButton = 'button[type="submit"]';
    this.errorMessage = '.error-message';
    this.rememberMeCheckbox = '#rememberMe';
  }

  // Navigation
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  // Form interactions
  async fillUsername(value) {
    await this.fill(this.usernameInput, value);
  }

  async fillPassword(value) {
    await this.fill(this.passwordInput, value);
  }

  async setRememberMe(check) {
    await this.setCheckbox(this.rememberMeCheckbox, check);
  }

  async clickLogin() {
    await this.click(this.loginButton);
  }

  // Helper methods
  async login(username, password, rememberMe = false) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.setRememberMe(true);
    }
    await this.clickLogin();
  }
}
```

## Selector Strategies

Priority order for selecting best locator:

1. Testing attributes
   ```html
   data-testid="login-button"
   data-test="username-input"
   data-qa="submit-form"
   ```

2. ARIA attributes
   ```html
   aria-label="Login"
   aria-describedby="password-hint"
   role="button"
   ```

3. ID and name attributes
   ```html
   id="loginForm"
   name="username"
   ```

4. Framework-specific
   ```html
   <!-- Salesforce -->
   lightning-input
   class="slds-button"

   <!-- Angular -->
   mat-button
   [formControlName]="username"

   <!-- React -->
   data-testid="submit-button"
   ```

5. CSS selectors (last resort)
   ```html
   .login-form button[type="submit"]
   ```

## Best Practices

1. **Review Generated Code**
   - Verify selector uniqueness
   - Add custom methods as needed
   - Update method names for clarity

2. **Framework Selection**
   - Use `--framework` for better selectors
   - Add custom selectors to `selectors.js`

3. **Maintenance**
   - Regenerate when page structure changes
   - Keep custom methods in separate files
   - Use version control for changes

## Common Issues

1. **No Elements Found**
   - Check if page is fully loaded
   - Try `--no-headless` mode
   - Verify framework selection

2. **Poor Selectors**
   - Add data-testid attributes
   - Use framework conventions
   - Update selector patterns

3. **Dynamic Content**
   - Increase wait timeout
   - Add explicit waits
   - Use stable selectors

## Contributing

1. Add new selector patterns in `selectors.js`
2. Improve element detection in `page-generator.js`
3. Add framework-specific methods as needed