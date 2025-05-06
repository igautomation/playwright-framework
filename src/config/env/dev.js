/**
 * Development environment configuration
 */
module.exports = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php',
  apiUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php',
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
