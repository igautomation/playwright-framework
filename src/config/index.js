/**
 * Configuration
 * 
 * Central configuration for the framework
 */

// Default configuration
const defaultConfig = {
  // Base URLs
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  
  // API configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://reqres.in/api',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    apiKey: process.env.API_KEY || 'reqres-free-v1',
    testData: {
      userId: parseInt(process.env.TEST_USER_ID || '2'),
      nonExistentUserId: parseInt(process.env.TEST_NONEXISTENT_USER_ID || '999'),
      page: parseInt(process.env.TEST_PAGE || '1'),
      maxValidUserId: parseInt(process.env.MAX_VALID_USER_ID || '12'),
      maxPageWithData: parseInt(process.env.MAX_PAGE_WITH_DATA || '2'),
      usersPerPage: parseInt(process.env.USERS_PER_PAGE || '6'),
      userIds: process.env.TEST_USER_IDS ? process.env.TEST_USER_IDS.split(',').map(Number) : [1, 2, 3, 23],
      pages: process.env.TEST_PAGES ? process.env.TEST_PAGES.split(',').map(Number) : [1, 2, 3],
      users: [
        { 
          name: process.env.TEST_USER1_NAME || 'User 1', 
          job: process.env.TEST_USER1_JOB || 'Job 1', 
          expectedStatus: parseInt(process.env.TEST_USER1_STATUS || '201') 
        },
        { 
          name: process.env.TEST_USER2_NAME || 'User 2', 
          job: process.env.TEST_USER2_JOB || 'Job 2', 
          expectedStatus: parseInt(process.env.TEST_USER2_STATUS || '201') 
        },
        { 
          name: process.env.TEST_USER3_NAME || 'User 3', 
          job: process.env.TEST_USER3_JOB || 'Job 3', 
          expectedStatus: parseInt(process.env.TEST_USER3_STATUS || '201') 
        }
      ],
      queryParams: [
        { 
          param: process.env.TEST_PARAM1_NAME || 'page', 
          value: parseInt(process.env.TEST_PARAM1_VALUE || '1'), 
          expectedStatus: parseInt(process.env.TEST_PARAM1_STATUS || '200') 
        },
        { 
          param: process.env.TEST_PARAM2_NAME || 'per_page', 
          value: parseInt(process.env.TEST_PARAM2_VALUE || '3'), 
          expectedStatus: parseInt(process.env.TEST_PARAM2_STATUS || '200') 
        }
      ],
      newUser: {
        name: process.env.NEW_USER_NAME || 'Test User',
        job: process.env.NEW_USER_JOB || 'Test Job'
      }
    }
  },
  
  // Credentials
  credentials: {
    username: process.env.USERNAME || 'Admin',
    password: process.env.PASSWORD || 'admin123',
    invalidUsername: process.env.INVALID_USERNAME || 'invalid',
    invalidPassword: process.env.INVALID_PASSWORD || 'wrong'
  },
  
  // Paths
  paths: {
    login: process.env.LOGIN_PATH || '/web/index.php/auth/login',
    dashboard: process.env.DASHBOARD_PATH || '/web/index.php/dashboard/index',
    admin: process.env.ADMIN_PATH || '/web/index.php/admin/viewSystemUsers',
    pim: process.env.PIM_PATH || '/web/index.php/pim/viewEmployeeList'
  },
  
  // Selectors
  selectors: {
    auth: {
      usernameInput: process.env.USERNAME_INPUT || 'input[name="username"]',
      passwordInput: process.env.PASSWORD_INPUT || 'input[name="password"]',
      loginButton: process.env.LOGIN_BUTTON || 'button[type="submit"]',
      errorAlert: process.env.ERROR_ALERT || '.oxd-alert-content-text',
      requiredFieldError: process.env.REQUIRED_FIELD_ERROR || '.oxd-input-field-error-message',
      userDropdown: process.env.USER_DROPDOWN || '.oxd-userdropdown-tab',
      logoutMenuItem: process.env.LOGOUT_MENU_ITEM || 'a:has-text("Logout")',
      rememberMeCheckbox: process.env.REMEMBER_ME_CHECKBOX || 'input[type="checkbox"]'
    },
    combined: {
      usernameInput: process.env.USERNAME_INPUT || 'input[name="username"]',
      passwordInput: process.env.PASSWORD_INPUT || 'input[name="password"]',
      loginButton: process.env.LOGIN_BUTTON || 'button[type="submit"]',
      pimLink: process.env.PIM_LINK || 'a:has-text("PIM")',
      adminLink: process.env.ADMIN_LINK || 'a:has-text("Admin")',
      searchInput: process.env.SEARCH_INPUT || 'input[placeholder="Type for hints..."]',
      searchButton: process.env.SEARCH_BUTTON || 'button:has-text("Search")',
      employeeTable: process.env.EMPLOYEE_TABLE || '.oxd-table-card',
      addButton: process.env.ADD_BUTTON || 'button:has-text("Add")',
      userRoleDropdown: process.env.USER_ROLE_DROPDOWN || '.oxd-select-text',
      employeeNameInput: process.env.EMPLOYEE_NAME_INPUT || 'input[placeholder="Type for hints..."]',
      statusDropdown: process.env.STATUS_DROPDOWN || '.oxd-select-text',
      usernameField: process.env.USERNAME_FIELD || 'input[autocomplete="off"]',
      passwordField: process.env.PASSWORD_FIELD || 'input[type="password"]',
      saveButton: process.env.SAVE_BUTTON || 'button[type="submit"]'
    }
  },
  
  // External resources
  externalResources: {
    cdn: {
      axeCore: process.env.AXE_CORE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
      chartJs: process.env.CHART_JS_CDN || 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    }
  },
  
  // Accessibility configuration
  accessibility: {
    rules: process.env.ACCESSIBILITY_RULES ? process.env.ACCESSIBILITY_RULES.split(',') : [
      'color-contrast',
      'label',
      'aria-roles',
      'image-alt'
    ]
  },
  
  // Visual testing configuration
  visual: {
    baselineDir: process.env.VISUAL_BASELINE_DIR || 'visual-baselines',
    diffDir: process.env.VISUAL_DIFF_DIR || 'visual-diffs',
    threshold: parseFloat(process.env.VISUAL_THRESHOLD || '0.1'),
    matchThreshold: parseFloat(process.env.VISUAL_MATCH_THRESHOLD || '0.1'),
    updateBaselines: process.env.VISUAL_UPDATE_BASELINES === 'true'
  }
};

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
let envConfig = {};

try {
  envConfig = require(`./${env}`);
} catch (e) {
  console.log(`No environment-specific config found for ${env}`);
}

// Merge configurations
const config = {
  ...defaultConfig,
  ...envConfig
};

module.exports = config;