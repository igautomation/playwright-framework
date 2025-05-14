// Import directly from @playwright/test
const { test, expect } = require('@playwright/test');
const ApiRequest = require('../../../utils/api/apiRequest');
const User = require('../../../utils/api/models/User');

// Load environment variables
require('dotenv').config();

test('Create auth token via Restful Booker API', async () => {
  const api = new ApiRequest(
    process.env.API_URL || 'https://restful-booker.herokuapp.com'
  );
  
  // Create user with username and password
  const user = new User('admin', 'password123');
  
  // Send authentication request
  const response = await api.post('auth', user.toJSON());
  
  // Verify response
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('token');
});