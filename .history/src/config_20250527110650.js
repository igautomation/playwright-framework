/**
 * Configuration file for the application
 */
const configManager = require('./utils/config');

// Get the configuration from the config manager
const config = configManager.getConfig();

// Export the configuration
module.exports = {
  // Base URL for the application
  baseUrl: config.orangeHrm.url || 'https://opensource-demo.orangehrmlive.com',
  
  // API configuration
  api: {
    baseUrl: process.env.REQRES_API_URL 
      ? `${process.env.REQRES_API_URL.replace(/\/+$/, '')}/api` 
      : 'https://reqres.in/api',
    testData: {
      userId: 2
    }
  },
  
  // Paths for different pages
  paths: {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    admin: '/web/index.php/admin/viewAdminModule',
    pim: '/web/index.php/pim/viewPimModule',
    leave: '/web/index.php/leave/viewLeaveModule',
    time: '/web/index.php/time/viewTimeModule'
  },
  
  // Credentials for authentication
  credentials: {
    username: config.orangeHrm.username || 'Admin',
    password: config.orangeHrm.password || 'admin123'
  },
  
  // External resources
  externalResources: {
    cdn: {
      axeCore: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
    }
  },
  
  // Accessibility testing configuration
  accessibility: {
    rules: [
      'color-contrast',
      'label',
      'aria-roles',
      'image-alt',
      'button-name',
      'document-title',
      'duplicate-id',
      'form-field-multiple-labels',
      'frame-title',
      'html-has-lang',
      'input-button-name',
      'link-name',
      'list',
      'listitem',
      'meta-viewport'
    ],
    impacts: ['critical', 'serious']
  }
};
