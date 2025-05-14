/**
 * Generate-test command for the CLI
 *
 * This command generates a template for a new test file
 */
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/common/logger');

/**
 * Generate a test file template
 * @param {Object} options - Command options
 */
module.exports = (options = {}) => {
  try {
    logger.info('Generating test file template...');
    
    const testName = options.name || 'new-test';
    const testType = options.type || 'ui';
    const testDir = options.dir || path.join(process.cwd(), 'src/tests');
    const outputDir = path.join(testDir, options.subdir || '');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine file name
    let fileName = `${testName}.spec.js`;
    if (testType === 'ui') {
      fileName = `${testName}.ui.spec.js`;
    } else if (testType === 'api') {
      fileName = `${testName}.api.spec.js`;
    } else if (testType === 'e2e') {
      fileName = `${testName}.e2e.spec.js`;
    }
    
    const filePath = path.join(outputDir, fileName);
    
    // Check if file already exists
    if (fs.existsSync(filePath) && !options.force) {
      logger.error(`File already exists: ${filePath}`);
      logger.info('Use --force to overwrite');
      return;
    }
    
    // Generate template based on test type
    const template = generateTemplate(testName, testType);
    
    // Write template to file
    fs.writeFileSync(filePath, template);
    
    logger.info(`Test file template generated: ${filePath}`);
    
    return {
      filePath,
      testName,
      testType
    };
  } catch (error) {
    logger.error('Error generating test file template:', error.message || error);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
  }
};

/**
 * Generate template based on test type
 * @param {string} testName - Test name
 * @param {string} testType - Test type (ui, api, e2e)
 * @returns {string} Template content
 */
function generateTemplate(testName, testType) {
  const formattedTestName = testName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  switch (testType) {
    case 'ui':
      return generateUiTestTemplate(formattedTestName);
    case 'api':
      return generateApiTestTemplate(formattedTestName);
    case 'e2e':
      return generateE2eTestTemplate(formattedTestName);
    default:
      return generateBasicTestTemplate(formattedTestName);
  }
}

/**
 * Generate UI test template
 * @param {string} testName - Test name
 * @returns {string} Template content
 */
function generateUiTestTemplate(testName) {
  return `/**
 * ${testName} UI Tests
 * 
 * This test suite demonstrates UI testing capabilities
 */
const { test, expect } = require('@playwright/test');

test.describe('${testName} @ui', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto('https://example.com/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display page correctly', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Verify page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Example Domain');
  });

  test('should interact with page elements', async ({ page }) => {
    // Example interaction with page elements
    await page.click('a');
    
    // Add your assertions here
    // await expect(page.locator('selector')).toBeVisible();
  });
});
`;
}

/**
 * Generate API test template
 * @param {string} testName - Test name
 * @returns {string} Template content
 */
function generateApiTestTemplate(testName) {
  return `/**
 * ${testName} API Tests
 * 
 * This test suite demonstrates API testing capabilities
 */
const { test, expect } = require('@playwright/test');

/**
 * Repository pattern for API interactions
 */
class ApiRepository {
  /**
   * @param {import('@playwright/test').APIRequestContext} request 
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://api.example.com';
  }

  /**
   * Get resource
   * @returns {Promise<Object>} - Response data
   */
  async getResource() {
    const response = await this.request.get(\`\${this.baseUrl}/resource\`);
    if (!response.ok()) {
      throw new Error(\`Failed to get resource: \${response.statusText()}\`);
    }
    return await response.json();
  }

  /**
   * Create resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>} - Response data
   */
  async createResource(data) {
    const response = await this.request.post(\`\${this.baseUrl}/resource\`, {
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok()) {
      throw new Error(\`Failed to create resource: \${response.statusText()}\`);
    }
    return await response.json();
  }
}

// Test data
const testData = {
  resource: {
    name: 'Test Resource',
    description: 'This is a test resource'
  }
};

test.describe('${testName} API Tests @api', () => {
  let apiRepo;

  test.beforeEach(async ({ request }) => {
    apiRepo = new ApiRepository(request);
  });

  test('should get resource', async () => {
    // When: Getting resource from API
    const response = await apiRepo.getResource();
    
    // Then: Response should have expected structure
    expect(response).toBeDefined();
    
    // Add your assertions here
    // expect(response.property).toBe(expectedValue);
  });

  test('should create resource', async () => {
    // When: Creating a resource via API
    const response = await apiRepo.createResource(testData.resource);
    
    // Then: Response should have expected structure
    expect(response).toBeDefined();
    
    // Add your assertions here
    // expect(response.name).toBe(testData.resource.name);
  });
});
`;
}

/**
 * Generate E2E test template
 * @param {string} testName - Test name
 * @returns {string} Template content
 */
function generateE2eTestTemplate(testName) {
  return `/**
 * ${testName} End-to-End Tests
 * 
 * This test suite demonstrates end-to-end testing capabilities
 */
const { test, expect } = require('@playwright/test');

// Page Object for Login Page
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
    this.errorMessage = page.locator('.error-message');
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    await this.page.goto('https://example.com/login');
    // Wait for the page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with the given credentials
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// Page Object for Dashboard Page
class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page 
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('header');
    this.userMenu = page.locator('.user-menu');
    this.logoutButton = page.locator('.logout-button');
  }

  /**
   * Check if dashboard is loaded
   * @returns {Promise<boolean>} True if dashboard is loaded
   */
  async isDashboardLoaded() {
    await this.header.waitFor({ state: 'visible' });
    return await this.header.isVisible();
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    // Wait for logout to complete
    await this.page.waitForLoadState('networkidle');
  }
}

test.describe('${testName} E2E Tests @e2e', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
  });

  test('should login successfully', async ({ page }) => {
    // Login with valid credentials
    await loginPage.login('testuser', 'password');
    
    // Verify successful login
    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();
    
    // Logout
    await dashboardPage.logout();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Login with invalid credentials
    await loginPage.login('invalid', 'invalid');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
`;
}

/**
 * Generate basic test template
 * @param {string} testName - Test name
 * @returns {string} Template content
 */
function generateBasicTestTemplate(testName) {
  return `/**
 * ${testName} Tests
 * 
 * This test suite demonstrates basic testing capabilities
 */
const { test, expect } = require('@playwright/test');

test.describe('${testName}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
    await page.goto('https://example.com/');
  });

  test('should pass basic test', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Add your assertions here
    // await expect(page.locator('selector')).toBeVisible();
  });

  test('should perform test actions', async ({ page }) => {
    // Example test actions
    await page.click('a');
    
    // Add your assertions here
    // await expect(page.locator('selector')).toBeVisible();
  });
});
`;
}