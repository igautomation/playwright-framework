/**
 * QA environment configuration
 * 
 * SAMPLE TEST APPLICATIONS:
 * - Web UI: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * - API: https://reqres.in/
 */
module.exports = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
  apiUrl: 'https://reqres.in/api',
  credentials: {
    username: 'Admin',
    password: 'admin123',
  },
  timeouts: {
    default: 30000,
    navigation: 30000,
    action: 15000,
    expect: 10000,
  },
  reporting: {
    screenshotOnFailure: true,
    videoOnFailure: true,
    traceOnFailure: true,
  },
};
