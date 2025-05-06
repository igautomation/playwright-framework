/**
 * Production environment configuration
 */
module.exports = {
  baseUrl: 'https://prod.example.com',
  apiUrl: 'https://api.prod.example.com',
  credentials: {
    username: process.env.PROD_USERNAME,
    password: process.env.PROD_PASSWORD,
  },
  timeouts: {
    default: 30000,
    navigation: 30000,
    action: 15000,
    expect: 10000,
  },
  reporting: {
    screenshotOnFailure: true,
    videoOnFailure: false,
    traceOnFailure: false,
  },
};
