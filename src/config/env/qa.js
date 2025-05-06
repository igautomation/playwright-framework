/**
 * QA environment configuration
 */
module.exports = {
  baseUrl: 'https://qa.example.com',
  apiUrl: 'https://api.qa.example.com',
  credentials: {
    username: 'qa-user',
    password: 'qa-password',
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
