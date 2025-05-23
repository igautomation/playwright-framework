/**
 * Development Environment Configuration
 * 
 * Configuration specific to the development environment
 */

module.exports = {
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
      usersPerPage: parseInt(process.env.USERS_PER_PAGE || '6')
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
  }
};